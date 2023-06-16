import { ISignal, ISimpleEvent } from "strongly-typed-events";
import OnCacheLineEvictedEventArgs from "../../Simulation/Events/OnCacheLineEvictedEventArgs";
import OnCacheLineLoadedEventArgs from "../../Simulation/Events/OnCacheLineLoadedEventArgs";
import OnMemoryAccessedEventArgs from "../../Simulation/Events/OnMemoryAccessedEventArgs";

/// Interface for classes that emit simulation events over time.
export default interface IPlaybackController
{
	/// Event raised when the playback controller begins emitting events.
	get OnVisualizationStarted(): ISignal;

	/// Event raised when all visualization events have been emitted.
	get OnVisualizationFinished(): ISignal;

	/// Event raised when a cache line loaded event is processed.
	get OnCacheLineLoaded(): ISimpleEvent<OnCacheLineLoadedEventArgs>;

	/// Event raised when a cache line evicted event is processed.
	get OnCacheLineEvicted(): ISimpleEvent<OnCacheLineEvictedEventArgs>;

	/// Event raised when a memory location accessed event is processed.
	get OnMemoryAccessed(): ISimpleEvent<OnMemoryAccessedEventArgs>;

	/// Begins emitting simulation events.
	/// @throws Error Thrown if the simulation is already running.
	startVisualization(): void;

	/// Stops emitting simulation events.
	/// This will be a no-op if the simulation is not currently running.
	stopVisualization(): void;
}
