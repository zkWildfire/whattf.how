import ICacheLine from "../CacheLines/CacheLine"
import IPlacementPolicy from "./PlacementPolicy";

/// Class that implements n-way associative placement.
export default class NWayAssociativePlacementPolicy implements IPlacementPolicy
{
	/// The size of each cache line, in number of elements.
	private readonly _lineSize: number;

	/// The size of the cache, in number of cache lines.
	private readonly _cacheSize: number;

	/// The number of cache lines per set.
	private readonly _associativity: number;

	/// Initializes the policy.
	/// @param lineSize The size of each cache line, in number of elements.
	/// @param cacheSize The size of the cache, in number of cache lines.
	/// @param associativity The number of cache lines per set.
	/// @throws Error If the cache size is not a multiple of the associativity.
	constructor(
		lineSize: number,
		cacheSize: number,
		associativity: number)
	{
		if (cacheSize % associativity !== 0)
		{
			throw new Error(
				"Cache size must be a multiple of the associativity."
			);
		}

		this._lineSize = lineSize;
		this._cacheSize = cacheSize;
		this._associativity = associativity;
	}

	/// Gets the indices where the cache line may be placed.
	/// @param cacheLine The cache line to get the indices for.
	/// @returns The indices where the cache line may be placed.
	public getIndices(cacheLine: ICacheLine): number[]
	{
		const setIndex = Math.floor(
			cacheLine.startIndex / this._lineSize
		) % this._associativity;

		return Array.from(
			{ length: this._cacheSize / this._associativity },
			(_, i) => i * this._associativity + setIndex
		);
	}
}
