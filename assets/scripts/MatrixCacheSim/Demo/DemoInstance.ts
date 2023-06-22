import ICache from "../Simulation/Caches/Cache";
import IMemory from "../Simulation/Memory/Memory";
import TransposeSimulator from "../Simulation/TransposeSimulator";
import IPlaybackController from "../Visualization/Playback/PlaybackController";
import ICacheGenerator from "./CacheGenerator";
import IMatrix from "./Matrix";
import IMatrixGenerator from "./MatrixGenerator";
import RowMajorMatrix from "./RowMajorMatrix";

/// Represents an instance of the matrix cache simulator demo.
/// Instances of this class should not be built directly. Use the `DemoBuilder`
///   class instead to build instances of this class.
export default class DemoInstance
{
	/// The matrix generator used by the demo.
	private readonly _matrixGenerator: IMatrixGenerator;

	/// The cache generator used by the demo.
	private readonly _cacheGenerator: ICacheGenerator;

	/// The memory instance used by the simulator.
	private readonly _memory: IMemory;

	/// The cache instance used by the simulator.
	private readonly _cache: ICache;

	/// The simulator used by the demo.
	private readonly _simulator: TransposeSimulator;

	/// The algorithm used by the demo.
	private readonly _algo: (matrix: IMatrix) => void;

	/// The playback controller used by the demo.
	private readonly _playbackController: IPlaybackController;

	/// Callback used to set the text of a matrix cell.
	private readonly _setMatrixCellText:
		(row: number, col: number, text: string) => void;

	/// The size of the matrix to use for the demo.
	private readonly _matrixSize: [number, number];

	/// Initializes the demo instance.
	/// @param matrixGenerator The matrix generator to use for the demo.
	/// @param cacheGenerator The cache generator to use for the demo.
	/// @param memory Memory instance used by the simulator.
	/// @param cache Cache instance used by the simulator.
	/// @param simulator The simulator to use for the demo.
	/// @param algo The algorithm to use for the demo.
	/// @param playbackController The playback controller to use for the demo.
	/// @param setMatrixCellText Callback used to set the text of a matrix cell.
	/// @param matrixSize The size of the matrix to use for the demo.
	constructor(
		matrixGenerator: IMatrixGenerator,
		cacheGenerator: ICacheGenerator,
		memory: IMemory,
		cache: ICache,
		simulator: TransposeSimulator,
		algo: (matrix: IMatrix) => void,
		playbackController: IPlaybackController,
		setMatrixCellText: (row: number, col: number, text: string) => void,
		matrixSize: [number, number])
	{
		this._matrixGenerator = matrixGenerator;
		this._cacheGenerator = cacheGenerator;
		this._memory = memory;
		this._cache = cache;
		this._simulator = simulator;
		this._algo = algo;
		this._playbackController = playbackController;
		this._setMatrixCellText = setMatrixCellText;
		this._matrixSize = matrixSize;
	}

	/// Sets up the DOM elements required to run the demo.
	public initialize(): void
	{
		this._matrixGenerator.generateMatrix(
			this._matrixSize[0],
			this._matrixSize[1]
		);
		this._cacheGenerator.generateCacheLines(
			this._cache.totalLineCount
		);

		// Iterate over the matrix's values and set the initial values displayed
		//   in each matrix cell
		for (let y = 0; y < this._matrixSize[1]; ++y)
		{
			for (let x = 0; x < this._matrixSize[0]; ++x)
			{
				const value = this._memory.read(y * this._matrixSize[0] + x);
				this._setMatrixCellText(x, y, value.toString());
			}
		}
	}

	/// Runs the demo.
	public async run(): Promise<void>
	{
		// Create the matrix for the run
		const matrix: IMatrix = new RowMajorMatrix(
			this._simulator,
			this._matrixSize
		);

		// Run the algorithm
		this._algo(matrix);

		// Start the visualization
		this._playbackController.startVisualization();
		await this._playbackController.waitForSimulation();
		this._playbackController.stopVisualization();
	}
}
