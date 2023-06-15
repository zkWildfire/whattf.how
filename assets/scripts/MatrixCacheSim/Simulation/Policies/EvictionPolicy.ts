/// Interface for classes that determine which cache line is evicted.
/// The implementation of this interface used by an `ICache` instance determines
///   how cache lines are removed from the cache when all available locations
///   that a cache line may be placed are occupied.
export default interface IEvictionPolicy
{
	/// Notifies the policy that a cache line was accessed.
	/// @param cacheLineIndex The index of the cache line that was accessed.
	onCacheLineAccessed(cacheLineIndex: number): void;

	/// Notifies the policy that a cache line was evicted.
	/// @param cacheLineIndex The index of the cache line that was evicted.
	onCacheLineEvicted(cacheLineIndex: number): void;

	/// Notifies the policy that a cache line was loaded.
	/// @param cacheLineIndex The index of the cache line that was loaded.
	onCacheLineLoaded(cacheLineIndex: number): void;

	/// Gets the index of the cache line to evict.
	/// All calls to this method will be followed by a call to
	///   `onCacheLineEvicted()`.
	/// @param cacheLineIndices The indices of the cache lines that may be
	///   evicted. Will contain at least one element.
	/// @returns The index of the cache line to evict.
	getCacheLineToEvict(cacheLineIndices: number[]): number;
}
