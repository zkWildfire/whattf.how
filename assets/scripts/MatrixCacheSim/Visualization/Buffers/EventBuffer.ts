import OnCacheLineEvictedEventArgs from "../../Simulation/Events/OnCacheLineEvictedEventArgs";
import OnCacheLineLoadedEventArgs from "../../Simulation/Events/OnCacheLineLoadedEventArgs";
import OnMemoryAccessedEventArgs from "../../Simulation/Events/OnMemoryAccessedEventArgs";

/// Interface for classes that record simulation events for the visualization.
export default interface IEventBuffer
{
	/// Number of events in the buffer.
	get length(): number;

	/// Gets the event at the given index.
	/// @param index Index of the event to retrieve.
	/// @throws RangeError Thrown if the given index is invalid.
	/// @returns The event at the given index.
	getEvent(index: number):
		OnCacheLineLoadedEventArgs |
		OnCacheLineEvictedEventArgs |
		OnMemoryAccessedEventArgs;

	/// Invoked whenever a cache line is loaded into the cache.
	/// @param eventArgs Event arguments generated by the simulation.
	onCacheLineLoaded(eventArgs: OnCacheLineLoadedEventArgs): void;

	/// Invoked whenever a cache line is evicted from the cache.
	/// @param eventArgs Event arguments generated by the simulation.
	onCacheLineEvicted(eventArgs: OnCacheLineEvictedEventArgs): void;

	/// Invoked whenever a memory location is accessed.
	/// @param eventArgs Event arguments generated by the simulation.
	onMemoryAccessed(eventArgs: OnMemoryAccessedEventArgs): void;
}
