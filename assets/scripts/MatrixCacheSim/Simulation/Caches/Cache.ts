import ICacheLine from "../CacheLines/CacheLine";
import CacheLoadResult from "./CacheLoadResult";

/// Interface for classes that represent a collection of cache lines.
export default interface ICache
{
	/// Number of elements per cache line.
	get lineSize(): number;

	/// Number of cache lines that the cache can store.
	get totalLineCount(): number;

	/// Gets the cache line containing the specified memory index.
	/// @param index The index of the memory location to get the cache line for.
	/// @pre `isPresent(index)` returns true.
	/// @returns The cache line containing the specified memory index.
	getCacheLine(index: number): ICacheLine;

	/// Checks whether the memory location is present in the cache.
	/// @param index The index of the memory location to check.
	/// @returns Whether the memory location is present in the cache.
	isPresent(index: number): boolean;

	/// Loads a new cache line into the cache.
	/// @param cacheLine The cache line to load into the cache.
	/// @returns The result of loading the cache line into the cache.
	loadCacheLine(cacheLine: ICacheLine): CacheLoadResult;

	/// Gets the cache line containing the specified memory index.
	/// @param index The index of the memory location to get the cache line for.
	/// @returns The cache line containing the specified memory index, or null
	///   if the memory location is not present in the cache.
	tryGetCacheLine(index: number): ICacheLine | null;
}
