import DemoInstance from "./DemoInstance";
import IMatrix from "./Matrix";

/// Helper class used to construct demo instances.
/// This is a reusable class that may be used to construct multiple demo
///   instances. All values will be maintained between calls to `construct()`.
export default class DemoBuilder
{
	/// The size of the cache in number of cache lines.
	private _cacheSize: number;

	/// The size of each cache line, in number of elements.
	private _cacheLineSize: number;

	/// The associativity of the cache.
	private _associativity: EAssociativity;

	/// Matrix size to use for the demo.
	private _matrixSize: EMatrixSize;

	/// The simulation speed to use for the demo.
	private _simulationSpeedMs: number;

	/// Whether to display matrix elements' values.
	private _displayValues: boolean;

	/// Algorithm to run for the demo.
	/// This method will be passed the matrix that was constructed for the demo.
	private _algorithm: (matrix: IMatrix) => void;

	/// Initializes the factory.
	/// @param cacheSize The size of the cache in number of cache lines.
	/// @param cacheLineSize The size of each cache line, in number of elements.
	/// @param associativity The associativity of the cache.
	/// @param matrixSize The matrix size to use for the demo.
	/// @param simulationSpeedMs The simulation speed to use for the demo.
	/// @param displayValues Whether to display matrix elements' values.
	/// @param algorithm The algorithm to run for the demo.
	constructor(
		cacheSize: number,
		cacheLineSize: number,
		associativity: EAssociativity,
		matrixSize: EMatrixSize,
		simulationSpeedMs: ESimulationSpeed,
		displayValues: boolean,
		algorithm: (matrix: IMatrix) => void)
	{
		this._cacheSize = cacheSize;
		this._cacheLineSize = cacheLineSize;
		this._associativity = associativity;
		this._matrixSize = matrixSize;
		this._simulationSpeedMs = simulationSpeedMs;
		this._displayValues = displayValues;
		this._algorithm = algorithm;
	}

	/// Constructs a new demo instance with the current settings.
	/// @returns The constructed demo instance.
	public construct(): DemoInstance
	{
	}

	/// Sets the size of the cache in number of cache lines.
	/// @param cacheSize The size of the cache in number of cache lines.
	/// @throws Error If the cache size is negative or zero.
	/// @returns `this`
	public setCacheSize(cacheSize: number): DemoBuilder
	{
		if (cacheSize <= 0)
		{
			throw new Error("Cache size must be positive.");
		}

		this._cacheSize = cacheSize;
		return this;
	}

	/// Sets the size of each cache line, in number of elements.
	/// @param cacheLineSize The size of each cache line, in number of elements.
	/// @throws Error If the cache line size is negative or zero.
	/// @returns `this`
	public setCacheLineSize(cacheLineSize: number): DemoBuilder
	{
		if (cacheLineSize <= 0)
		{
			throw new Error("Cache line size must be positive.");
		}

		this._cacheLineSize = cacheLineSize;
		return this;
	}

	/// Sets the associativity of the cache.
	/// @param associativity The associativity of the cache.
	/// @returns `this`
	public setAssociativity(associativity: EAssociativity): DemoBuilder
	{
		this._associativity = associativity;
		return this;
	}

	/// Sets the matrix size to use for the demo.
	/// @param size The matrix size to use for the demo.
	public setMatrixSize(size: EMatrixSize): DemoBuilder
	{
		this._matrixSize = size;
		return this;
	}

	/// Sets the simulation speed to use for the demo.
	/// @param speed The simulation speed to use for the demo.
	public setSimulationSpeed(speed: ESimulationSpeed): DemoBuilder
	{
		this._simulationSpeedMs = speed;
		return this;
	}

	/// Sets whether to display matrix elements' values.
	/// @param display Whether to display matrix elements' values.
	public setDisplayValues(display: boolean): DemoBuilder
	{
		this._displayValues = display;
		return this;
	}

	/// Sets the algorithm to run for the demo.
	/// @param algorithm The algorithm to run for the demo.
	public setAlgorithm(algorithm: (matrix: IMatrix) => void): DemoBuilder
	{
		this._algorithm = algorithm;
		return this;
	}
}
