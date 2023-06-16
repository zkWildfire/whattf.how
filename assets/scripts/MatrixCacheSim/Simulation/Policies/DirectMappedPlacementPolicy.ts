import assert from "assert";
import ICacheLine from "../CacheLines/CacheLine"
import IPlacementPolicy from "./PlacementPolicy";

/// A placement policy that maps each cache line to exactly one index.
export default class DirectMappedPlacementPolicy implements IPlacementPolicy
{
	/// The size of each cache line, in number of elements.
	private readonly _cacheLineSize: number;

	/// The size of the cache, in number of cache lines.
	private readonly _cacheSize: number;

	/// Initializes the policy.
	/// @param cacheLineSize The size of each cache line, in number of elements.
	/// @param cacheSize The size of the cache, in number of cache lines.
	constructor(cacheLineSize: number, cacheSize: number)
	{
		this._cacheLineSize = cacheLineSize;
		this._cacheSize = cacheSize;
	}

	/// Gets the indices where the cache line may be placed.
	/// @param cacheLine The cache line to get the indices for.
	/// @returns The indices where the cache line may be placed.
	public getIndices(cacheLine: ICacheLine): number[]
	{
		assert(cacheLine.size === this._cacheLineSize);

		// Each cache line is mapped to exactly one index
		return [
			Math.floor(cacheLine.startIndex / this._cacheLineSize) %
				this._cacheSize
		];
	}
}
