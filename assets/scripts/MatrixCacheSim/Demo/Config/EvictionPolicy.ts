/// Eviction policy to use for the cache.
export enum EEvictionPolicy
{
	/// Evicts the least recently used cache line first.
	LeastRecentlyUsed,

	/// Evicts the most recently used cache line first.
	MostRecentlyUsed,

	/// Evicts the cache line that was loaded the longest time ago first.
	Oldest,

	/// Evicts cache lines in a round-robin fashion.
	RoundRobin,

	/// Randomly selects a cache line to evict.
	Random
}
