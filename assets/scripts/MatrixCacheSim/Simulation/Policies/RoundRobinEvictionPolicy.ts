import IEvictionPolicy from "./EvictionPolicy";

/// Eviction policy that evicts cache lines in round robin order.
export default class RoundRobinEvictionPolicy implements IEvictionPolicy
{
	/// Keep track of the different sets of cache lines.
	/// Because of the way caches are implemented, the indices passed to
	///   `getCacheLineToEvict()` will always be the same when evicting from
	///   the same set. Additionally, since cache lines can't be evicted if
	///   space remains in a set, the indices passed to `getCacheLineToEvict()`
	///   will never be a partial set of the indices in a cache set.
	/// The key will be the indices of the cache lines in the set (ordered from
	///   lowest to highest, then converted to a string), and the value will be
	///   the index in the key array of the next cache line to evict.
	private readonly _cacheLineSets: Map<string, number> = new Map();

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
		// Do nothing
	}

	/// Notifies the policy that a cache line was loaded.
	/// @param cacheLineIndex The index of the cache line that was loaded.
	public onCacheLineLoaded(cacheLineIndex: number): void
	{
		// Do nothing
	}

	/// Gets the index of the cache line to evict.
	/// All calls to this method will be followed by a call to
	///   `onCacheLineEvicted()`.
	/// @param cacheLineIndices The indices of the cache lines that may be
	///   evicted. Will contain at least one element.
	/// @returns The index of the cache line to evict.
	public getCacheLineToEvict(cacheLineIndices: number[]): number
	{
		// Sort the indices from lowest to highest
		// This probably isn't necessary but better safe than sorry
		cacheLineIndices.sort((a, b) => a - b);

		// Get the string that represents this set of cache lines
		const cacheLineIndicesString = cacheLineIndices.join(",");

		// Check if this set of cache lines has been seen before
		let evictIndex = this._cacheLineSets.get(cacheLineIndicesString);
		if (evictIndex === undefined)
		{
			// This is a new set of cache lines, so start at the lowest index
			console.log("New set of cache lines");
			evictIndex = 0;
		}

		// Update the index of the next cache line to evict
		this._cacheLineSets.set(
			cacheLineIndicesString,
			(evictIndex + 1) % cacheLineIndices.length
		);
		return cacheLineIndices[evictIndex];
	}
}
