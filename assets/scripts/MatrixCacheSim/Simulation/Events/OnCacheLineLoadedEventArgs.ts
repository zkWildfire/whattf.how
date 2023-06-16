import ISimulationEvent from "./SimulationEvent";
import ISimulationEventVisitor from "./SimulationEventVisitor";

/// Event raised when a new cache line is loaded into the cache.
export default class OnCacheLineLoadedEventArgs implements ISimulationEvent
{
	/// Index within the cache where the cache line was loaded.
	public readonly index: number;

	/// Initializes a new instance of the OnCacheLineLoadedEventArgs class.
	/// @param index Index within the cache where the cache line was loaded.
	public constructor(index: number)
	{
		this.index = index;
	}

	/// Accepts the specified simulation event visitor.
	/// @param visitor Simulation event visitor to accept.
	public accept(visitor: ISimulationEventVisitor): void
	{
		visitor.visitCacheLineLoadedEvent(this.index);
	}
}
