import ISimulationEvent from "./SimulationEvent";
import ISimulationEventVisitor from "./SimulationEventVisitor";

/// Event raised when a new cache line is loaded into the cache.
export default class OnCacheLineLoadedEventArgs implements ISimulationEvent
{
	/// Index within the cache where the cache line was loaded.
	public readonly cacheIndex: number;

	/// Index of the memory location that the cache line starts at.
	public readonly memoryIndex: number;

	/// Size of the cache line in number of elements.
	public readonly size: number;

	/// Initializes a new instance of the OnCacheLineLoadedEventArgs class.
	/// @param cacheIndex Index within the cache where the cache line was loaded.
	public constructor(
		cacheIndex: number,
		memoryIndex: number,
		size: number)
	{
		this.cacheIndex = cacheIndex;
		this.memoryIndex = memoryIndex;
		this.size = size;
	}

	/// Accepts the specified simulation event visitor.
	/// @param visitor Simulation event visitor to accept.
	public accept(visitor: ISimulationEventVisitor): void
	{
		visitor.visitCacheLineLoadedEvent(
			this.cacheIndex,
			this.memoryIndex,
			this.size
		);
	}
}
