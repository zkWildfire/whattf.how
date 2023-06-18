import IEvictionPolicy from "./EvictionPolicy";

/// Eviction policy that chooses a cache line to evict at random.
export default class RandomEvictionPolicy implements IEvictionPolicy
{
	/// Random number generator used to choose a cache line to evict.
	private readonly _rng: () => number;

	/// Initializes the policy.
	/// @param rng The random number generator to use to choose a cache line to
	///   evict.
	constructor(rng: () => number = Math.random)
	{
		this._rng = rng;
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
		// Pick one of the indices at random
		return cacheLineIndices[
			Math.floor(this._rng() * cacheLineIndices.length)
		];
	}
}
