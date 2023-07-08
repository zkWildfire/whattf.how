import IIFrame from "./IFrame";
import IPFrame from "./PFrame";

/// Interface for classes that record data required for playback.
/// Recorder components are responsible for listening for simulation state
///   changes and recording the state of the simulation at each simulation
///   tick. Recorders also define the interface for retrieving the recorded
///   data for playback.
/// @tparam TEventHub Type that defines the various events that this component
///   can bind to and listen for. This type should be the same as the event hub
///   type defined by the simulation component used with the recorder component.
/// @tparam TIFrame Type of I-Frames generated by the recorder component.
/// @tparam TPFrame Type of P-Frames generated by the recorder component.
export default interface IRecorderComponent<
	TEventHub,
	TIFrame extends IIFrame,
	TPFrame extends IPFrame>
{
	/// Gets the total number of simulation ticks that have been recorded.
	get TotalTicks(): number;

	/// Called by the modular simulator to allow event listeners to be bound.
	/// @param eventHub Event hub from the simulation component.
	BindToEvents(eventHub: TEventHub): void;

	/// Generates an I-Frame for the given simulation tick.
	/// @param tick Simulation tick to emit an I-Frame for.
	GenerateIFrame(tick: number): TIFrame;

	/// Generates a P-Frame for the given simulation tick.
	/// @param tick Simulation tick to emit a P-Frame for.
	/// @param referenceTick Simulation tick to use as a reference for the
	///   P-Frame. Must be a tick number less than the target tick.
	GeneratePFrame(tick: number, referenceTick: number): TPFrame;
}