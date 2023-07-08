import { IEvent, ISignal } from "strongly-typed-events";

/// Defines the interface common to all simulator implementations.
export default interface ISimulator
{
	/// Gets the current playback position of the simulation.
	get CurrentTick(): number;

	/// Gets the total number of ticks in the simulation.
	get TotalTicks(): number;

	/// Emitted when playback stops because the end of the recording was reached.
	/// This should be used by UI elements to account for playback state
	///   changing as a result of simulator state instead of user input.
	get OnPlaybackFinished(): ISignal;

	/// Emitted when the playback position of the simulation changes.
	/// The sender will be the simulator instance and the event data will be
	///   the tick number of the new playback position.
	get OnPlaybackLocationChanged(): IEvent<ISimulator, number>;

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
