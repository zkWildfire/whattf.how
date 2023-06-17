import ISimulationEvent from "./SimulationEvent";
import ISimulationEventVisitor from "./SimulationEventVisitor";

/// Event raised when a memory location is accessed.
export default class OnMemoryAccessedEventArgs implements ISimulationEvent
{
	/// Index of the memory location that was accessed.
	public readonly index: number;

	/// Whether the memory access was a cache hit or miss.
	public readonly isHit: boolean;

	/// Value at the memory location.
	public readonly value: number;

	/// Initializes a new instance of the OnMemoryAccessedEventArgs class.
	/// @param index Index of the memory location that was accessed.
	/// @param isHit Whether the memory access was a cache hit or miss.
	/// @param value Value at the memory location.
	public constructor(index: number, isHit: boolean, value: number)
	{
		this.index = index;
		this.isHit = isHit;
		this.value = value;
	}

	/// Accepts the specified simulation event visitor.
	/// @param visitor Simulation event visitor to accept.
	public accept(visitor: ISimulationEventVisitor): void
	{
		visitor.visitMemoryAccessedEvent(this.index, this.isHit, this.value);
	}
}
