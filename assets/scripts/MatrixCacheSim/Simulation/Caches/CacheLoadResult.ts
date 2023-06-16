import ICacheLine from "../CacheLines/CacheLine";

/// Struct returned when loading a cache line.
export default interface CacheLoadResult
{
	/// Index where the cache line was loaded.
	index: number;

	/// Cache line that was evicted, if any.
	evictedCacheLine: ICacheLine | null;
}
