import { ISignal, ISimpleEvent } from "strongly-typed-events";
import IIFrame from "./IFrame";
import IPFrame from "./PFrame";

/// Interface for classes that trigger playback of recorded data.
/// Playback components are responsible for calling into the recorder component
///   to release recorded data for playback.
export default interface IPlaybackComponent<
	TIFrame extends IIFrame,
	TPFrame extends IPFrame>
{
	/// Tick number of the most recently played frame.
	get CurrentTick(): number;

	/// Event broadcast when an I-Frame is generated for playback.
	get OnIFrameGenerated(): ISimpleEvent<TIFrame>;

	/// Event broadcast when a P-Frame is generated for playback.
	get OnPFrameGenerated(): ISimpleEvent<TPFrame>;

	/// Emitted when playback stops because the end of the recording was reached.
	get OnPlaybackFinished(): ISignal;

	/// Advances or rewinds the playback position of the simulation.
	/// If the simulation is running, this will pause the simulation and
	///   jump to the target tick.
	/// @param tick Target tick to jump to.
	JumpToTick(tick: number): void;

	/// Begins playback of the simulation from its current state.
	/// If the simulation is already on the final tick in the recording, the
	///   playback position will be reset to the start of the recording.
	/// @remarks If the simulation is already playing, this method should be
	///   a no-op.
	Play(): void;

	/// Pauses playback of the simulation.
	/// @remarks If the simulation is already paused, this method should be
	///   a no-op.
	Pause(): void;

	/// Starts or stops playback of the simulation.
	TogglePlayback(): void;

	/// Stops playback of the simulation and resets the playback position.
	Stop(): void;
}
