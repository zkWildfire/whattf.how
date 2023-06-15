/// Event raised when a cache line is evicted from the cache.
export default interface OnCacheLineEvictedEventArgs
{
	/// Index within the cache where the cache line was previously loaded.
	index: number;
}
