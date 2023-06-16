import ISimulationEvent from "./SimulationEvent";
import ISimulationEventVisitor from "./SimulationEventVisitor";

/// Event raised when a cache line is evicted from the cache.
export default class OnCacheLineEvictedEventArgs implements ISimulationEvent
{
	/// Index within the cache where the cache line was previously loaded.
	public readonly index: number;

	/// Initializes a new instance of the OnCacheLineEvictedEventArgs class.
	/// @param index Index within the cache where the cache line was previously
	///   loaded.
	public constructor(index: number)
	{
		this.index = index;
	}

	/// Accepts the specified simulation event visitor.
	/// @param visitor Simulation event visitor to accept.
	public accept(visitor: ISimulationEventVisitor): void
	{
		visitor.visitCacheLineEvictedEvent(this.index);
	}
}
