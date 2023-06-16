/// Interface for types used to visit a simulation event.
export default interface ISimulationEventVisitor
{
	/// Invoked when visiting a cache line loaded event.
	/// @param index Index of the cache line that was loaded.
	visitCacheLineLoadedEvent(index: number): void;

	/// Invoked when visiting a cache line evicted event.
	/// @param index Index of the cache line that was evicted.
	visitCacheLineEvictedEvent(index: number): void;

	/// Invoked when visiting a memory accessed event.
	/// @param index Index of the memory location that was accessed.
	/// @param isHit Whether the memory access was a cache hit or miss.
	visitMemoryAccessedEvent(index: number, isHit: boolean): void;
}
