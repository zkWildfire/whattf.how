import { ISignal } from "strongly-typed-events";

/// Interface for classes that determine when to spawn new characters.
export interface ISpawnTimer
{
	/// Event broadcast to when a new character should be spawned.
	get OnShouldSpawn(): ISignal;

	/// Starts the timer.
	Start(): void;

	/// Stops the timer.
	Stop(): void;
}
