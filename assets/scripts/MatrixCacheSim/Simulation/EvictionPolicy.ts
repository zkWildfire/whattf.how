/// Interface for classes that determine which cache line is evicted.
/// The implementation of this interface used by an `ICache` instance determines
///   how cache lines are removed from the cache when all available locations
///   that a cache line may be placed are occupied.
export default interface IEvictionPolicy
{
}
