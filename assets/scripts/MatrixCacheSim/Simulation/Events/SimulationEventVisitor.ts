/// Interface for types used to visit a simulation event.
export default interface ISimulationEventVisitor
{
	/// Invoked when visiting a cache line loaded event.
	/// @param cacheIndex Index in the cache where the cache line was loaded.
	/// @param memoryIndex Index of the memory location that the cache line
	///   starts at.
	/// @param size Size of the cache line in number of elements.
	visitCacheLineLoadedEvent(
		cacheIndex: number,
		memoryIndex: number,
		size: number
	): void;

	/// Invoked when visiting a cache line evicted event.
	/// @param cacheIndex Index in the cache where the cache line was loaded.
	/// @param memoryIndex Index of the memory location that the cache line
	///   starts at.
	/// @param size Size of the cache line in number of elements.
	visitCacheLineEvictedEvent(
		cacheIndex: number,
		memoryIndex: number,
		size: number
	): void;

	/// Invoked when visiting a memory accessed event.
	/// @param index Index of the memory location that was accessed.
	/// @param isHit Whether the memory access was a cache hit or miss.
	/// @param newValue Value now at the memory location.
	/// @param oldValue Value at the memory location before the memory was
	///   accessed. May be the same as `newValue`.
	visitMemoryAccessedEvent(
		index: number,
		isHit: boolean,
		newValue: number,
		oldValue: number): void;
}
