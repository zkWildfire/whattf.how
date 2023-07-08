import { EventDispatcher, IEvent, ISignal } from "strongly-typed-events";
import IIFrame from "./IFrame";
import IPFrame from "./PFrame";
import IPlaybackComponent from "./PlaybackComponent";
import IRecorderComponent from "./RecorderComponent";
import IRendererComponent from "./RendererComponent";
import ISimulationComponent from "./SimulationComponent";
import ISimulator from "./Simulator";

/// Implementation of the simulator interface that uses modular components.
export default class ModularSimulator<
	TEventHub,
	TIFrame extends IIFrame,
	TPFrame extends IPFrame,
	TSimulationComponent extends ISimulationComponent<TEventHub>,
	TRecorderComponent extends IRecorderComponent<TEventHub, TIFrame, TPFrame>,
	TPlaybackComponent extends IPlaybackComponent<TIFrame, TPFrame>,
	TRendererComponent extends IRendererComponent<TIFrame, TPFrame>
> implements ISimulator
{
	/// Gets the current playback position of the simulation.
	public get CurrentTick(): number
	{
		return this._playbackComponent.CurrentTick;
	}

	/// Gets the total number of ticks in the simulation.
	get TotalTicks(): number
	{
		return this._recorderComponent.TotalTicks;
	}

	/// Emitted when playback stops because the end of the recording was reached.
	/// This should be used by UI elements to account for playback state
	///   changing as a result of simulator state instead of user input.
	get OnPlaybackFinished(): ISignal
	{
		return this._playbackComponent.OnPlaybackFinished;
	}

	/// Emitted when the playback position of the simulation changes.
	/// The sender will be the simulator instance and the event data will be
	///   the tick number of the new playback position.
	get OnPlaybackLocationChanged(): IEvent<ISimulator, number>
	{
		return this._onPlaybackLocationChanged.asEvent();
	}

	/// Simulation component for the simulator.
	private readonly _simulationComponent: TSimulationComponent;

	/// Recorder component for the simulator.
	private readonly _recorderComponent: TRecorderComponent;

	/// Playback component for the simulator.
	private readonly _playbackComponent: TPlaybackComponent;

	/// Renderer component for the simulator.
	private readonly _rendererComponent: TRendererComponent;

	/// Event broadcast to when the playback position of the simulation changes.
	private readonly _onPlaybackLocationChanged =
		new EventDispatcher<ISimulator, number>();

	/// Creates a new modular simulator.
	/// @param simulationComponent Simulation component for the simulator.
	/// @param recorderComponent Recorder component for the simulator.
	/// @param playbackComponent Playback component for the simulator.
	/// @param rendererComponent Renderer component for the simulator.
	public constructor(
		simulationComponent: TSimulationComponent,
		recorderComponent: TRecorderComponent,
		playbackComponent: TPlaybackComponent,
		rendererComponent: TRendererComponent)
	{
		this._simulationComponent = simulationComponent;
		this._recorderComponent = recorderComponent;
		this._playbackComponent = playbackComponent;
		this._rendererComponent = rendererComponent;

		// Initialize each component
		this._recorderComponent.BindToEvents(this._simulationComponent.EventHub);
		this._playbackComponent.OnIFrameGenerated.subscribe((frame) =>
		{
			this._rendererComponent.RenderIFrame(frame);
			this._onPlaybackLocationChanged.dispatch(this, frame.FrameNumber);
		});
		this._playbackComponent.OnPFrameGenerated.subscribe((frame) =>
		{
			this._rendererComponent.RenderPFrame(frame);
			this._onPlaybackLocationChanged.dispatch(this, frame.FrameNumber);
		});

		// Generate events from the simulation
		this._simulationComponent.Run();
	}

	/// Advances or rewinds the playback position of the simulation.
	/// If the simulation is running, this will pause the simulation and
	///   jump to the target tick.
	/// @param tick Target tick to jump to.
	public JumpToTick(tick: number): void
	{
		this._playbackComponent.JumpToTick(tick);
	}

	/// Begins playback of the simulation from its current state.
	/// If the simulation is already on the final tick in the recording, the
	///   playback position will be reset to the start of the recording.
	/// @remarks If the simulation is already playing, this method should be
	///   a no-op.
	public Play(): void
	{
		this._playbackComponent.Play();
	}

	/// Pauses playback of the simulation.
	/// @remarks If the simulation is already paused, this method should be
	///   a no-op.
	public Pause(): void
	{
		this._playbackComponent.Pause();
	}

	/// Starts or stops playback of the simulation.
	public TogglePlayback(): void
	{
		this._playbackComponent.TogglePlayback();
	}

	/// Stops playback of the simulation and resets the playback position.
	public Stop(): void
	{
		this._playbackComponent.Stop();
	}
}
