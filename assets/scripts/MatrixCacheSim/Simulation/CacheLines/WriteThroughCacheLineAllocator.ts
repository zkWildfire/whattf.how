import ICacheLine from "./CacheLine";
import ICacheLineAllocator from "./CacheLineAllocator";
import IMemory from "../Memory/Memory";
import WriteThroughCacheLine from "./WriteThroughCacheLine";

/// Allocator for the `WriteThroughCacheLine` class.
export default class WriteThroughCacheLineAllocator
	implements ICacheLineAllocator
{
	/// Memory instance backing the cache line.
	private readonly _memory: IMemory;

	/// Size of the cache line in number of elements.
	private readonly _cacheLineSize: number;

	/// Initializes the allocator.
	/// @param memory Memory instance to use for backing the cache line.
	/// @param cacheLineSize Size of the cache line in number of elements.
	constructor(
		memory: IMemory,
		cacheLineSize: number)
	{
		this._memory = memory;
		this._cacheLineSize = cacheLineSize;
	}

	/// Constructs a new cache line.
	/// @param index The memory index that the cache line is being constructed
	///   for.
	/// @returns A new cache line instance that contains the specified memory
	///   index.
	public allocate(index: number): ICacheLine
	{
		// Find the starting index of the cache line
		const startingIndex = index - (index % this._cacheLineSize);

		// Construct the cache line
		return new WriteThroughCacheLine(
			this._memory,
			startingIndex,
			this._cacheLineSize
		);
	}
}
