import ICacheLine from "../CacheLines/CacheLine"

/// Interface for classes that determine where a cache line may be placed.
/// The implementation of this interface used by an `ICache` instance determines
///   the associativity of the cache.
export default interface IPlacementPolicy
{
	/// Gets the indices where the cache line may be placed.
	/// @param cacheLine The cache line to get the indices for.
	/// @returns The indices where the cache line may be placed.
	getIndices(cacheLine: ICacheLine): number[];
}
