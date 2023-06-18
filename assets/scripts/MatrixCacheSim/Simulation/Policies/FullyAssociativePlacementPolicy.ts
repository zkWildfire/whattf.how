import ICacheLine from "../CacheLines/CacheLine"
import IPlacementPolicy from "./PlacementPolicy";

/// Placement policy that allows cache lines to map to any cache index.
export default class FullyAssociativePlacementPolicy implements IPlacementPolicy
{
	/// The size of the cache, in number of cache lines.
	private readonly _cacheSize: number;

	/// Initializes the policy.
	/// @param cacheSize The size of the cache, in number of cache lines.
	constructor(cacheSize: number)
	{
		this._cacheSize = cacheSize;
	}

	/// Gets the indices where the cache line may be placed.
	/// @param cacheLine The cache line to get the indices for.
	/// @returns The indices where the cache line may be placed.
	public getIndices(cacheLine: ICacheLine): number[]
	{
		return Array.from({ length: this._cacheSize }, (_, i) => i);
	}
}
