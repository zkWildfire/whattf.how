import assert from "assert";
import IEvictionPolicy from "./EvictionPolicy";

/// Eviction policy that always evicts the oldest cache line.
export default class OldestEvictionPolicy implements IEvictionPolicy
{
	/// The size of the cache, in number of cache lines.
	private readonly _cacheSize: number;

	/// The last time each cache line was loaded.
	/// If a cache line is unloaded or hasn't been loaded yet, the last access
	///   time will be -1.
	private readonly _loadTimes: number[];

	/// Counter used to keep track of when cache lines are loaded.
	/// The counter is incremented each time a cache line event occurs (e.g. a
	///   cache line is loaded or evicted). This counter does not record actual
	///   timestamps but rather simulation event "timestamps".
	private _time: number;

	/// Initializes the policy.
	/// @param cacheSize The size of the cache, in number of cache lines.
	constructor(cacheSize: number)
	{
		this._cacheSize = cacheSize;
		this._time = 0;
		this._loadTimes = new Array<number>(cacheSize).fill(-1);
	}

	/// Notifies the policy that a cache line was accessed.
	/// @param cacheLineIndex The index of the cache line that was accessed.
	public onCacheLineAccessed(cacheLineIndex: number): void
	{
		// Do nothing
	}

	/// Notifies the policy that a cache line was evicted.
	/// @param cacheLineIndex The index of the cache line that was evicted.
	public onCacheLineEvicted(cacheLineIndex: number): void
	{
		assert(cacheLineIndex >= 0 && cacheLineIndex < this._cacheSize);
		// A cache line can't be evicted before it's loaded
		assert(this._loadTimes[cacheLineIndex] >= 0);

		this._loadTimes[cacheLineIndex] = -1;
		this._time++;
	}

	/// Notifies the policy that a cache line was loaded.
	/// @param cacheLineIndex The index of the cache line that was loaded.
	public onCacheLineLoaded(cacheLineIndex: number): void
	{
		assert(cacheLineIndex >= 0 && cacheLineIndex < this._cacheSize);
		// A cache line can't be loaded into an index that's already occupied
		assert(this._loadTimes[cacheLineIndex] < 0);

		this._loadTimes[cacheLineIndex] = this._time;
		this._time++;
	}

	/// Gets the index of the cache line to evict.
	/// All calls to this method will be followed by a call to
	///   `onCacheLineEvicted()`.
	/// @param cacheLineIndices The indices of the cache lines that may be
	///   evicted. Will contain at least one element.
	/// @returns The index of the cache line to evict.
	public getCacheLineToEvict(cacheLineIndices: number[]): number
	{
		assert(cacheLineIndices.length > 0);
		cacheLineIndices.forEach((cacheLineIndex) =>
		{
			assert(cacheLineIndex >= 0 && cacheLineIndex < this._cacheSize);
		});

		// This will always be higher than any actual last access time
		let lowestLastAccessTime = this._time + 1;

		// Find the index with the lowest last access time
		let cacheLineToEvict = -1;
		for (let i = 0; i < cacheLineIndices.length; i++)
		{
			const cacheLineIndex = cacheLineIndices[i];
			const lastAccessTime = this._loadTimes[cacheLineIndex];

			// Ignore cache lines that aren't loaded
			// This should never occur in practice, but better safe than sorry
			if (lastAccessTime < 0)
			{
				continue;
			}

			// Keep track of the cache line with the lowest access time
			if (lastAccessTime < lowestLastAccessTime)
			{
				cacheLineToEvict = cacheLineIndex;
				lowestLastAccessTime = lastAccessTime;
			}
		}

		// This should always be valid at this point since this method should
		//   never be called if no cache lines are loaded
		assert(cacheLineToEvict >= 0 && cacheLineToEvict < this._cacheSize);
		return cacheLineToEvict;
	}
}
