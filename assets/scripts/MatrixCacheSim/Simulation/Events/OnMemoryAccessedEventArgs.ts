import ISimulationEvent from "./SimulationEvent";
import ISimulationEventVisitor from "./SimulationEventVisitor";

/// Event raised when a memory location is accessed.
export default class OnMemoryAccessedEventArgs implements ISimulationEvent
{
	/// Index of the memory location that was accessed.
	public readonly index: number;

	/// Whether the memory access was a cache hit or miss.
	public readonly isHit: boolean;

	/// Value at the memory location after the memory was accessed.
	public readonly newValue: number;

	/// Value at the memory location before the memory was accessed.
	/// @remarks If the memory access was a read, this value will be the same as
	///   `newValue`.
	public readonly oldValue: number;

	/// Initializes a new instance of the OnMemoryAccessedEventArgs class.
	/// @param index Index of the memory location that was accessed.
	/// @param isHit Whether the memory access was a cache hit or miss.
	/// @param newValue Value now at the memory location.
	/// @param oldValue Value at the memory location before the memory was
	///   accessed.
	public constructor(
		index: number,
		isHit: boolean,
		newValue: number,
		oldValue: number)
	{
		this.index = index;
		this.isHit = isHit;
		this.newValue = newValue;
		this.oldValue = oldValue;
	}

	/// Accepts the specified simulation event visitor.
	/// @param visitor Simulation event visitor to accept.
	public accept(visitor: ISimulationEventVisitor): void
	{
		visitor.visitMemoryAccessedEvent(
			this.index,
			this.isHit,
			this.newValue,
			this.oldValue
		);
	}
}
