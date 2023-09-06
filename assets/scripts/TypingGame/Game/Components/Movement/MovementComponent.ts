import { ISignal } from "strongly-typed-events";

/// Component that handles updating the location of an entity.
export interface IMovementComponent
{
	/// Event broadcast to when the entity resets to the start position.
	get OnReset(): ISignal;

	/// The current location of the entity.
	get Position(): { x: number, y: number };

	/// Called to update the location of the entity.
	/// @param deltaTime The time in seconds since the last update.
	Tick(deltaTime: number): void;
}
