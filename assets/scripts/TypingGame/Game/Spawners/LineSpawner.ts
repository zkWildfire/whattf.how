import { ISpawner } from "./Spawner";

/// Spawner that randomly places characters on a line.
export class LineSpawner implements ISpawner
{
	/// Gets the start point of the line.
	private readonly _startPoint: { x: number, y: number };

	/// Gets the end point of the line.
	private readonly _endPoint: { x: number, y: number };

	/// Initializes a new instance of the class.
	/// @param startPoint The start point of the line.
	/// @param endPoint The end point of the line.
	constructor(
		startPoint: { x: number, y: number },
		endPoint: { x: number, y: number })
	{
		this._startPoint = startPoint;
		this._endPoint = endPoint;
	}

	/// Gets the next spawn position for a character actor.
	/// @returns The next spawn position for a character actor.
	public GetNextSpawnPosition(): { x: number, y: number }
	{
		// Get a random value in the range [0, 1]
		// This will be used as the percentage of the way between the start
		//   and end points that the spawn position should be.
		const randomValue = Math.random();

		// Calculate the position on the line that corresponds to the random
		//   value
		const xDiff = this._endPoint.x - this._startPoint.x;
		const yDiff = this._endPoint.y - this._startPoint.y;

		const x = this._startPoint.x + (xDiff * randomValue);
		const y = this._startPoint.y + (yDiff * randomValue);

		return { x, y };
	}
}
