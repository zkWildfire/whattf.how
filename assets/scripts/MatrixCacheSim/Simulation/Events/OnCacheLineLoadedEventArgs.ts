/// Event raised when a new cache line is loaded into the cache.
export default interface OnCacheLineLoadedEventArgs
{
	/// Index within the cache where the cache line was loaded.
	index: number;
}
