import ISimulator from "../Simulation/Simulator";
import IMatrix from "./Matrix";

/// Matrix implementation that accesses elements using row major ordering.
export default class RowMajorMatrix implements IMatrix
{
	/// Simulator instance to use.
	private readonly _simulator: ISimulator;

	/// Size of the matrix.
	private readonly _size: [number, number];

	/// Size of the matrix's X dimension.
	get X(): number
	{
		return this._size[0];
	}

	/// Size of the matrix's Y dimension.
	get Y(): number
	{
		return this._size[1];
	}

	/// Initializes a new instance of the class.
	/// @param simulator Simulator instance to use.
	/// @param matrixSize Size of the matrix being simulated.
	constructor(
		simulator: ISimulator,
		matrixSize: [number, number])
	{
		this._simulator = simulator;
		this._size = matrixSize;
	}

	/// Swaps the values at the two locations.
	/// @param x1 X coordinate of the first location.
	/// @param y1 Y coordinate of the first location.
	/// @param x2 X coordinate of the second location.
	/// @param y2 Y coordinate of the second location.
	public swap(x1: number, y1: number, x2: number, y2: number): void
	{
		const index1 = this.toIndex(x1, y1);
		const index2 = this.toIndex(x2, y2);

		const value1 = this._simulator.read(index1);
		const value2 = this._simulator.read(index2);

		this._simulator.write(index1, value2);
		this._simulator.write(index2, value1);
	}

	/// Converts the specified coordinates to a memory index.
	/// @param x X coordinate to convert.
	/// @param y Y coordinate to convert.
	/// @returns The memory index that corresponds to the specified coordinates.
	private toIndex(x: number, y: number): number
	{
		return y * this.X + x;
	}
}
