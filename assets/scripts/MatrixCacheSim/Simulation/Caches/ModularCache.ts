import assert from "assert";
import ICacheLine from "../CacheLines/CacheLine";
import IEvictionPolicy from "../Policies/EvictionPolicy";
import IPlacementPolicy from "../Policies/PlacementPolicy";
import ICache from "./Cache";
import CacheLoadResult from "./CacheLoadResult";

/// Component-based cache implementation.
export default class ModularCache implements ICache
{
	/// Number of elements per cache line.
	private readonly _lineSize: number;

	/// Cache lines currently in the cache.
	private readonly _cacheLines: Array<ICacheLine | null>;

	/// Placement policy to use.
	private readonly _placementPolicy: IPlacementPolicy;

	/// Eviction policy to use.
	private readonly _evictionPolicy: IEvictionPolicy;

	/// Number of elements per cache line.
	get lineSize(): number
	{
		return this._lineSize;
	}

	/// Number of cache lines that the cache can store.
	get totalLineCount(): number
	{
		return this._cacheLines.length;
	}

	/// Initializes the cache.
	/// @param lineSize Number of elements per cache line.
	/// @param totalLineCount Number of cache lines that the cache can store.
	/// @param placementPolicy The placement policy to use.
	/// @param evictionPolicy The eviction policy to use.
	constructor(
		lineSize: number,
		totalLineCount: number,
		placementPolicy: IPlacementPolicy,
		evictionPolicy: IEvictionPolicy)
	{
		this._lineSize = lineSize;
		this._cacheLines = new Array<ICacheLine | null>(totalLineCount)
			.fill(null);
		this._placementPolicy = placementPolicy;
		this._evictionPolicy = evictionPolicy;
	}

	/// Gets the cache line containing the specified memory index.
	/// @param index The index of the memory location to get the cache line for.
	/// @pre `isPresent(index)` returns true.
	/// @returns The cache line containing the specified memory index.
	public getCacheLine(index: number): ICacheLine
	{
		const cacheLine = this.tryGetCacheLine(index);
		assert(cacheLine !== null);
		return cacheLine;
	}

	/// Checks whether the memory location is present in the cache.
	/// @param index The index of the memory location to check.
	/// @returns Whether the memory location is present in the cache.
	public isPresent(index: number): boolean
	{
		return this.tryGetCacheLine(index) !== null;
	}

	/// Loads a new cache line into the cache.
	/// @param cacheLine The cache line to load into the cache.
	/// @returns The result of loading the cache line into the cache.
	public loadCacheLine(cacheLine: ICacheLine): CacheLoadResult
	{
		// Keep track of where the new cache line is loaded and which cache
		//   line was evicted, if any
		var cacheLineIndex = -1;
		var evictedCacheLineIndex: number | null = null;

		// Figure out where the cache line may be placed
		const indices = this._placementPolicy.getIndices(cacheLine);

		// Check if any of the indices are free
		for (const index of indices)
		{
			if (this._cacheLines[index] === null)
			{
				this._cacheLines[index] = cacheLine;
				cacheLineIndex = index;
			}
		}

		// Handle the case where no cache line is free
		if (cacheLineIndex === -1)
		{
			// Figure out which cache line to evict
			cacheLineIndex = this._evictionPolicy.getCacheLineToEvict(indices);

			// Evict the cache line
			const evictedCacheLine = this._cacheLines[cacheLineIndex];
			assert(evictedCacheLine !== null);
			this._cacheLines[cacheLineIndex] = cacheLine;

			evictedCacheLine.flush();
			this._evictionPolicy.onCacheLineEvicted(cacheLineIndex);
			evictedCacheLineIndex = cacheLineIndex;
		}

		// Finish loading the cache line
		assert(cacheLineIndex !== -1);
		this._evictionPolicy.onCacheLineLoaded(cacheLineIndex);
		cacheLine.OnCacheLineAccessed.subscribe(() =>
		{
			this._evictionPolicy.onCacheLineAccessed(cacheLineIndex);
		});

		return {
			index: cacheLineIndex,
			cacheLineEvicted: evictedCacheLineIndex !== null
		};
	}

	/// Gets the cache line containing the specified memory index.
	/// @param index The index of the memory location to get the cache line for.
	/// @returns The cache line containing the specified memory index, or null
	///   if the memory location is not present in the cache.
	public tryGetCacheLine(index: number): ICacheLine | null
	{
		for (const cacheLine of this._cacheLines)
		{
			if (cacheLine !== null && cacheLine.contains(index))
			{
				return cacheLine;
			}
		}

		return null;
	}
}
