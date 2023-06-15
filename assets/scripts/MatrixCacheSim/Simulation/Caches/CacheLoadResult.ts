/// Struct returned when loading a cache line.
export default interface CacheLoadResult
{
	/// Index where the cache line was loaded.
	index: number;

	/// Whether a cache line was evicted.
	cacheLineEvicted: boolean;
}
