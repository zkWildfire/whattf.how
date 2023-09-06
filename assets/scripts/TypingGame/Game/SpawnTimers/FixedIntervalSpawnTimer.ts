import { ISignal, SignalDispatcher } from "strongly-typed-events";
import { ISpawnTimer } from "./SpawnTimer";

/// A spawn timer that spawns characters at a fixed interval.
export class FixedIntervalSpawnTimer implements ISpawnTimer
{
	/// Event broadcast to when a new character should be spawned.
	get OnShouldSpawn(): ISignal
	{
		return this._onShouldSpawn.asEvent();
	}

	/// Dispatcher for the `OnShouldSpawn` event.
	private readonly _onShouldSpawn: SignalDispatcher;

	/// Interval in milliseconds between spawns.
	private readonly _intervalMs: number;

	// Stores the interval ID returned by `setInterval()`.
	private _intervalId: number | null = null;

	/// Flag set if the timer is active.
	private _isActive: boolean = false;

	/// Initializes the timer.
	/// @param interval The interval in milliseconds between spawns.
	constructor(intervalMs: number)
	{
		this._onShouldSpawn = new SignalDispatcher();
		this._intervalMs = intervalMs;
	}

	/// Starts the timer.
	public Start(): void
	{
		if (this._isActive)
		{
			// Ignore the call; the timer is already active.
			return;
		}
		this._isActive = true;

		// Start the timer
		this._intervalId = window.setInterval(() =>
			{
				this._onShouldSpawn.dispatch();
			},
			this._intervalMs
		);
	}

	/// Stops the timer.
	public Stop(): void
	{
		if (!this._isActive)
		{
			// Ignore the call; the timer is already inactive.
			return;
		}
		this._isActive = false;

		// Stop the timer
		if (this._intervalId !== null)
		{
			window.clearInterval(this._intervalId);
			this._intervalId = null;
		}
	}
}
