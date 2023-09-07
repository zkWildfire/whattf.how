import { ISignal, SignalDispatcher } from "strongly-typed-events";
import { IMovementComponent } from "./MovementComponent";

/// Movement component that moves the entity at a constant speed.
export class ConstantMovementComponent implements IMovementComponent
{
	/// Event broadcast to when the entity resets to the start position.
	get OnReset(): ISignal
	{
		return this._onReset.asEvent();
	}

	/// The current location of the entity.
	get Position(): { x: number, y: number }
	{
		return this._position;
	}

	/// Dispatcher for the `OnReset` event.
	private readonly _onReset: SignalDispatcher;

	/// Location that the entity started at.
	private readonly _startPosition: { x: number, y: number };

	/// Y position at which point the entity should reset to the start position.
	private readonly _resetY: number;

	/// The speed to move the entity at.
	private readonly _speed: number;

	/// Field backing the `Position` property.
	private _position: { x: number, y: number };

	/// Initializes a new instance of the class.
	/// @param position The initial position of the entity.
	/// @param speed The speed to move the entity at, in pixels per second.
	/// @param resetY The Y position at which point the entity should reset to
	///   the start position.
	constructor(
		position: { x: number, y: number },
		speed: number,
		resetY: number)
	{
		this._onReset = new SignalDispatcher();
		this._startPosition = position;
		this._position = { ...position };
		this._speed = speed;
		this._resetY = resetY;
	}

	/// Called to update the location of the entity.
	/// @param deltaTime The time in seconds since the last update.
	public Tick(deltaTime: number): void
	{
		// Calculate how much to move the entity by
		const movement = this._speed * deltaTime;

		// Move the entity
		this._position.y += movement;

		// Check if the entity should reset
		if (this._position.y >= this._resetY)
		{
			this._position = { ...this._startPosition };
			this._onReset.dispatch();
		}
	}
}
