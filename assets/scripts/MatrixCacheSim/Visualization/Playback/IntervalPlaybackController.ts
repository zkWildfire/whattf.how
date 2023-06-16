import { ISignal, ISimpleEvent, SignalDispatcher, SimpleEventDispatcher } from "strongly-typed-events";
import IEventBuffer from "../Buffers/EventBuffer";
import IPlaybackController from "./PlaybackController";
import OnCacheLineLoadedEventArgs from "../../Simulation/Events/OnCacheLineLoadedEventArgs";
import OnCacheLineEvictedEventArgs from "../../Simulation/Events/OnCacheLineEvictedEventArgs";
import OnMemoryAccessedEventArgs from "../../Simulation/Events/OnMemoryAccessedEventArgs";

/// Playback controller that releases events at a semi-fixed interval.
/// The interval playback controller will use the same interval for each event,
///   but the interval may be changed as a result of the user selecting a
///   different playback speed on the UI. The playback controller will not
///   change the playback speed on its own.
export default class IntervalPlaybackController implements IPlaybackController
{
	/// Buffer to read events from.
	private readonly _eventBuffer: IEventBuffer;

	/// Field backing the `OnVisualizationStarted` property.
	private readonly _onVisualizationStarted: SignalDispatcher;

	/// Field backing the `OnVisualizationFinished` property.
	private readonly _onVisualizationFinished: SignalDispatcher;

	/// Field backing the `OnCacheLineLoaded` property.
	private readonly _onCacheLineLoaded:
		SimpleEventDispatcher<OnCacheLineLoadedEventArgs>;

	/// Field backing the `OnCacheLineEvicted` property.
	private readonly _onCacheLineEvicted:
		SimpleEventDispatcher<OnCacheLineEvictedEventArgs>;

	/// Field backing the `OnMemoryAccessed` property.
	private readonly _onMemoryAccessed:
		SimpleEventDispatcher<OnMemoryAccessedEventArgs>;

	/// Interval in milliseconds between events.
	private _intervalMs: number;

	/// Index of the next event to emit.
	private _nextEventIndex: number;

	/// Flag set if the playback controller should stop.
	private _stopFlag: boolean;

	/// Promise type set once the playback controller has been started.
	private _simulationPromise: Promise<void> | null;

	/// Event raised when the playback controller begins emitting events.
	get OnVisualizationStarted(): ISignal
	{
		return this._onVisualizationStarted.asEvent();
	}

	/// Event raised when all visualization events have been emitted.
	get OnVisualizationFinished(): ISignal
	{
		return this._onVisualizationFinished.asEvent();
	}

	/// Event raised when a cache line loaded event is processed.
	get OnCacheLineLoaded(): ISimpleEvent<OnCacheLineLoadedEventArgs>
	{
		return this._onCacheLineLoaded.asEvent();
	}

	/// Event raised when a cache line evicted event is processed.
	get OnCacheLineEvicted(): ISimpleEvent<OnCacheLineEvictedEventArgs>
	{
		return this._onCacheLineEvicted.asEvent();
	}

	/// Event raised when a memory location accessed event is processed.
	get OnMemoryAccessed(): ISimpleEvent<OnMemoryAccessedEventArgs>
	{
		return this._onMemoryAccessed.asEvent();
	}

	/// Current interval in milliseconds between events.
	get interval(): number
	{
		return this._intervalMs;
	}

	/// Sets the interval in milliseconds between events.
	/// @param value New interval in milliseconds.
	/// @throws RangeError Thrown if `value` is less than zero.
	set interval(value: number)
	{
		if (value < 0)
		{
			throw new RangeError(
				"Cannot set the interval to a value less than zero."
			);
		}
		this._intervalMs = value;
	}

	/// Initializes the controller.
	/// @param buffer Buffer to read events from.
	/// @param intervalMs Interval in milliseconds between events.
	/// @throws RangeError Thrown if `intervalMs` is less than zero.
	constructor(
		buffer: IEventBuffer,
		intervalMs: number)
	{
		if (intervalMs < 0)
		{
			throw new RangeError(
				"intervalMs must be greater than or equal to zero."
			);
		}

		this._eventBuffer = buffer;
		this._intervalMs = intervalMs;
		this._nextEventIndex = 0;
		this._stopFlag = false;
		this._simulationPromise = null;

		this._onVisualizationStarted = new SignalDispatcher();
		this._onVisualizationFinished = new SignalDispatcher();
		this._onCacheLineLoaded =
			new SimpleEventDispatcher<OnCacheLineLoadedEventArgs>();
		this._onCacheLineEvicted =
			new SimpleEventDispatcher<OnCacheLineEvictedEventArgs>();
		this._onMemoryAccessed =
			new SimpleEventDispatcher<OnMemoryAccessedEventArgs>();
	}

	/// Begins emitting simulation events.
	/// @throws Error Thrown if the simulation is already running.
	public startVisualization(): void
	{
		if (this._simulationPromise !== null)
		{
			throw new Error("Simulation is already running.");
		}

		this._stopFlag = false;
		this._simulationPromise = this.emitEvents();
	}

	/// Stops emitting simulation events.
	/// This will be a no-op if the simulation is not currently running.
	public async stopVisualization(): Promise<void>
	{
		// If the simulation is not running, do nothing
		if (this._simulationPromise === null)
		{
			return;
		}

		// Signal the simulation to stop
		this._stopFlag = true;

		// Wait for the simulation to stop
		await this._simulationPromise;

		// Reset the simulation promise
		this._simulationPromise = null;
	}

	/// Method used to handle releasing events over time.
	/// @returns Promise that resolves when all events have been emitted.
	private async emitEvents(): Promise<void>
	{
		// Signal that the simulation has started
		this._onVisualizationStarted.dispatch();

		// Loop until all events have been emitted
		while (this._nextEventIndex < this._eventBuffer.length)
		{
			// If the stop flag is set, stop emitting events
			if (this._stopFlag)
			{
				break;
			}

			// Get the next event
			const simulationEvent = this._eventBuffer.getEvent(
				this._nextEventIndex
			);

			// Wait for the interval to elapse
			await new Promise((resolve) =>
			{
				setTimeout(resolve, this._intervalMs);
			});

			// Process the event
			this.emitEvent(simulationEvent);

			// Move to the next event
			++this._nextEventIndex;
		}

		// Signal that the simulation has finished
		this._onVisualizationFinished.dispatch();
	}

	/// Helper method used to emit an event through the correct dispatcher.
	/// @param simulationEvent Event to emit.
	private emitEvent(simulationEvent:
		OnCacheLineLoadedEventArgs |
		OnCacheLineEvictedEventArgs |
		OnMemoryAccessedEventArgs): void
	{
		simulationEvent.accept({
			visitCacheLineLoadedEvent: (index) =>
			{
				this._onCacheLineLoaded.dispatch(
					simulationEvent as OnCacheLineLoadedEventArgs
				);
			},
			visitCacheLineEvictedEvent: (index) =>
			{
				this._onCacheLineEvicted.dispatch(
					simulationEvent as OnCacheLineEvictedEventArgs
				);
			},
			visitMemoryAccessedEvent: (index, isHit) =>
			{
				this._onMemoryAccessed.dispatch(
					simulationEvent as OnMemoryAccessedEventArgs
				);
			}
		});
	}
}
