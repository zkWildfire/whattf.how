import ICacheLine from "./CacheLine";

/// Interface for classes that construct new cache lines.
export default interface ICacheLineAllocator
{
	/// Constructs a new cache line.
	/// @param index The memory index that the cache line is being constructed
	///   for.
	/// @returns A new cache line instance that contains the specified memory
	///   index.
	allocate(index: number): ICacheLine;
}
