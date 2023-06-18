import assert from "assert";
import DemoMatrixGenerator from "./Demo/DemoMatrixGenerator";
import DemoCacheGenerator from "./Demo/DemoCacheGenerator";
import TransposeSimulator from "./Simulation/TransposeSimulator";
import ArrayMemory from "./Simulation/Memory/ArrayMemory";
import ModularCache from "./Simulation/Caches/ModularCache";
import DirectMappedPlacementPolicy from "./Simulation/Policies/DirectMappedPlacementPolicy";
import LeastRecentlyUsedEvictionPolicy from "./Simulation/Policies/LeastRecentlyUsedEvictionPolicy";
import WriteThroughCacheLineAllocator from "./Simulation/CacheLines/WriteThroughCacheLineAllocator";
import TransposeValidator from "./Simulation/Validators/TransposeValidator";
import ArrayEventBuffer from "./Visualization/Buffers/ArrayEventBuffer";
import IntervalPlaybackController from "./Visualization/Playback/IntervalPlaybackController";
import DomMatrixRenderer from "./Visualization/Renderers/DomMatrixRenderer";
import DomCacheRenderer from "./Visualization/Renderers/DomCacheRenderer";
import DomStatsRenderer from "./Visualization/Renderers/DomStatsRenderer";
import RowMajorMatrix from "./Demo/RowMajorMatrix";
import UniformButtonGroupBuilder from "../Utilities/UniformButtonGroupBuilder";
import DemoBuilder from "./Demo/DemoBuilder";
import IMatrix from "./Demo/Matrix";

//
// Miscellaneous constants
//
const BUTTON_COMMON_CSS = "btn col-2 rounded-0";
const BUTTON_ACTIVE_CSS = "btn-primary";
const BUTTON_INACTIVE_CSS = "btn-outline-primary";

//
// Built in transpose algorithms
//
const naiveTranspose = (matrix: IMatrix) =>
{
	for (let y = 0; y < matrix.Y; ++y)
	{
		for (let x = 0; x < matrix.X; ++x)
		{
			matrix.swap(x, y, y, x);
		}
	}
};

//
// Create the demo builder
//
const DEFAULT_CACHE_SIZE = 8;
const DEFAULT_LINE_SIZE = 8;
const DEFAULT_ASSOCIATIVITY = EAssociativity.FourWay;
const DEFAULT_MATRIX_SIZE = EMatrixSize.SIZE_32x32;
const DEFAULT_SIMULATION_SPEED = ESimulationSpeed.Fast;
const DEFAULT_DISPLAY_VALUES = false;
const DEFAULT_ALGORITHM = naiveTranspose;

const demoBuilder = new DemoBuilder(
	DEFAULT_CACHE_SIZE,
	DEFAULT_LINE_SIZE,
	DEFAULT_ASSOCIATIVITY,
	DEFAULT_MATRIX_SIZE,
	DEFAULT_SIMULATION_SPEED,
	DEFAULT_DISPLAY_VALUES,
	DEFAULT_ALGORITHM
);

//
// Set up the matrix size button group
//
const matrixSizeButtonGroupBuilder = new UniformButtonGroupBuilder<EMatrixSize>(
	BUTTON_COMMON_CSS,
	BUTTON_ACTIVE_CSS,
	BUTTON_INACTIVE_CSS
);
matrixSizeButtonGroupBuilder.addButton(
	"matrix-size-16x16",
	EMatrixSize.SIZE_16x16
);
matrixSizeButtonGroupBuilder.addButton(
	"matrix-size-32x32",
	EMatrixSize.SIZE_32x32,
	true
);
matrixSizeButtonGroupBuilder.addButton(
	"matrix-size-64x64",
	EMatrixSize.SIZE_64x64
);
matrixSizeButtonGroupBuilder.addButton(
	"matrix-size-63x63",
	EMatrixSize.SIZE_63x63
);
const matrixSizeButtonGroup = matrixSizeButtonGroupBuilder.construct();
matrixSizeButtonGroup.OnButtonClicked.subscribe((_, size: EMatrixSize) =>
{
	demoBuilder.setMatrixSize(size);
});

//
// Set up the cache size button group
//
const cacheSizeButtonGroupBuilder = new UniformButtonGroupBuilder<number>(
	BUTTON_COMMON_CSS,
	BUTTON_ACTIVE_CSS,
	BUTTON_INACTIVE_CSS
);
cacheSizeButtonGroupBuilder.addButton(
	"cache-size-small",
	4
);
cacheSizeButtonGroupBuilder.addButton(
	"cache-size-medium",
	8,
	true
);
cacheSizeButtonGroupBuilder.addButton(
	"cache-size-large",
	16
);

const cacheSizeButtonGroup = cacheSizeButtonGroupBuilder.construct();
cacheSizeButtonGroup.OnButtonClicked.subscribe((_, size: number) =>
{
	demoBuilder.setCacheSize(size);
});

//
// Set up the cache line size button group
//
const cacheLineSizeButtonGroupBuilder = new UniformButtonGroupBuilder<number>(
	BUTTON_COMMON_CSS,
	BUTTON_ACTIVE_CSS,
	BUTTON_INACTIVE_CSS
);
cacheLineSizeButtonGroupBuilder.addButton(
	"cache-line-size-small",
	4
);
cacheLineSizeButtonGroupBuilder.addButton(
	"cache-line-size-medium",
	8,
	true
);
cacheLineSizeButtonGroupBuilder.addButton(
	"cache-line-size-large",
	16
);

const cacheLineSizeButtonGroup = cacheLineSizeButtonGroupBuilder.construct();
cacheLineSizeButtonGroup.OnButtonClicked.subscribe((_, size: number) =>
{
	demoBuilder.setCacheLineSize(size);
});

//
// Set up the cache associativity button group
//
const associativityButtonGroupBuilder = new UniformButtonGroupBuilder<
	EAssociativity
>(
	BUTTON_COMMON_CSS,
	BUTTON_ACTIVE_CSS,
	BUTTON_INACTIVE_CSS
);
associativityButtonGroupBuilder.addButton(
	"cache-associativity-direct-mapped",
	EAssociativity.DirectMapped
);
associativityButtonGroupBuilder.addButton(
	"cache-associativity-two-way",
	EAssociativity.TwoWay
);
associativityButtonGroupBuilder.addButton(
	"cache-associativity-four-way",
	EAssociativity.FourWay,
	true
);
associativityButtonGroupBuilder.addButton(
	"cache-associativity-eight-way",
	EAssociativity.EightWay
);
associativityButtonGroupBuilder.addButton(
	"cache-associativity-fully-associative",
	EAssociativity.FullyAssociative
);

const associativityButtonGroup = associativityButtonGroupBuilder.construct();
associativityButtonGroup.OnButtonClicked.subscribe((_, associativity: EAssociativity) =>
{
	demoBuilder.setAssociativity(associativity);
});

//
// Set up the simulation speed button group
//
const simSpeedButtonGroupBuilder = new UniformButtonGroupBuilder<ESimulationSpeed>(
	BUTTON_COMMON_CSS,
	BUTTON_ACTIVE_CSS,
	BUTTON_INACTIVE_CSS
);
simSpeedButtonGroupBuilder.addButton(
	"simulation-speed-slow",
	ESimulationSpeed.Slow
);
simSpeedButtonGroupBuilder.addButton(
	"simulation-speed-medium",
	ESimulationSpeed.Normal,
);
simSpeedButtonGroupBuilder.addButton(
	"simulation-speed-fast",
	ESimulationSpeed.Fast,
	true
);

const simSpeedButtonGroup = simSpeedButtonGroupBuilder.construct();
simSpeedButtonGroup.OnButtonClicked.subscribe((_, speed: ESimulationSpeed) =>
{
	demoBuilder.setSimulationSpeed(speed);
});

//
// Set up the display values button group
//
const displayValuesButtonGroupBuilder = new UniformButtonGroupBuilder<boolean>(
	BUTTON_COMMON_CSS,
	BUTTON_ACTIVE_CSS,
	BUTTON_INACTIVE_CSS
);
displayValuesButtonGroupBuilder.addButton(
	"display-values-off",
	false,
	true
);
displayValuesButtonGroupBuilder.addButton(
	"display-values-on",
	true
);

const displayValuesButtonGroup = displayValuesButtonGroupBuilder.construct();
displayValuesButtonGroup.OnButtonClicked.subscribe((_, displayValues: boolean) =>
{
	demoBuilder.setDisplayValues(displayValues);
});

//
// Set up the algorithm button group
//
const algorithmButtonGroupBuilder = new UniformButtonGroupBuilder<
	(matrix: IMatrix) => void
>(
	BUTTON_COMMON_CSS,
	BUTTON_ACTIVE_CSS,
	BUTTON_INACTIVE_CSS
);
algorithmButtonGroupBuilder.addButton(
	"algorithm-naive",
	naiveTranspose,
	true
);
algorithmButtonGroupBuilder.addButton(
	"algorithm-cache-friendly",
	/// @todo Implement cache-friendly transpose algorithm
	naiveTranspose,
	true
);
algorithmButtonGroupBuilder.addButton(
	"algorithm-custom",
	/// @todo Implement support for user-provided custom algorithms
	naiveTranspose,
	true
);

// Set up the generator for the matrix
const matrixCellTextElementClass = "matrix-cell-text";
const generateMatrixCellId = (x: number, y: number) => `matrix-cell-${x}-${y}`;
const matrixGenerator = new DemoMatrixGenerator(
	() => document.getElementById("matrix")!.innerHTML = "",
	(y: number) =>
	{
		const row = document.createElement("div");
		document.getElementById("matrix")!.appendChild(row);
		return row;
	},
	(row: HTMLElement, x: number, y: number) =>
	{
		const cell = document.createElement("div");
		cell.id = generateMatrixCellId(x, y);

		// Create an inner element that will display the cell's value
		// This is necessary to ensure that the cell's size is not affected by
		//   the length of the value stored in the cell
		const cellInner = document.createElement("div");
		cellInner.className = `${matrixCellTextElementClass} position-absolute` +
			" w-100 h-100 d-flex align-items-center justify-content-center" +
			" text-center overflow-hidden";
		cell.appendChild(cellInner);

		row.appendChild(cell);
		return cell;
	},
	"w-100 d-flex",
	"flex-fill matrix-cell position-relative"
);

// Helper method used to set the text of a matrix cell
const setMatrixCellText = (x: number, y: number, text: string) =>
{
	// Get the cell element
	const cell = document.getElementById(generateMatrixCellId(x, y));
	assert(
		cell != null,
		`Could not find matrix cell with ID '${generateMatrixCellId(x, y)}'.`
	);

	// Get the inner element that displays the cell's value
	const innerElements = cell.getElementsByClassName(
		matrixCellTextElementClass
	);
	assert(
		innerElements.length == 1,
		"Expected to find exactly one text element in matrix cell " +
		`with ID '${generateMatrixCellId(x, y)}'.`
	);

	// Update the text of the inner element
	const textElement = innerElements[0] as HTMLSpanElement;
	textElement.innerText = text;
}

// Generate the initial matrix
matrixGenerator.generateMatrix(
	matrixSizeControls.matrixSize[0],
	matrixSizeControls.matrixSize[1]
);

// Bind to the matrix size change event to regenerate the matrix
matrixSizeControls.OnMatrixSizeChanged.subscribe((args) =>
{
	matrixGenerator.generateMatrix(args.x, args.y);
});

// Set up generation of the cache line visualization
const cacheElement = document.getElementById("cache");
assert(cacheElement != null, "Could not find cache element.");

// Set up the cache line generator
const generateCacheLineId = (i: number) => `cache-line-${i}`;
const cacheLineCss = "border rounded-0 cache-line flex-fill";
/// @todo Make this configurable via the UI
const cacheLineCount = 8;
const cacheLineGenerator = new DemoCacheGenerator(
	() => cacheElement.innerHTML = "",
	(i: number) =>
	{
		// Container element that holds the cache line label and the cache
		//   line element itself
		const row = document.createElement("div");
		row.className = "d-flex align-items-center";

		// Label for the cache line
		const rowLabel = document.createElement("span");
		rowLabel.className = "pe-2 cache-line-label";
		rowLabel.textContent = `Cache Line ${i}: `;
		row.appendChild(rowLabel);

		// Element that represents the cache line
		const rowElement = document.createElement("div");
		rowElement.id = generateCacheLineId(i);
		rowElement.className = cacheLineCss;
		row.appendChild(rowElement);

		cacheElement.appendChild(row);
		return row;
	}
);
cacheLineGenerator.generateCacheLines(cacheLineCount);

// Get references to the statistics elements
const memoryAccessesElementId = "stats-memory-accesses";
const memoryAccessesElement = document.getElementById(memoryAccessesElementId);
assert(
	memoryAccessesElement != null,
	"Could not find stats element with ID '" + memoryAccessesElementId + "'."
);

const cacheHitsElementId = "stats-cache-hits";
const cacheHitsElement = document.getElementById(cacheHitsElementId);
assert(
	cacheHitsElement != null,
	"Could not find stats element with ID '" + cacheHitsElementId + "'."
);

const cacheMissesElementId = "stats-cache-misses";
const cacheMissesElement = document.getElementById(cacheMissesElementId);
assert(
	cacheMissesElement != null,
	"Could not find stats element with ID '" + cacheMissesElementId + "'."
);

const cacheHitRateElementId = "stats-cache-hit-rate";
const cacheHitRateElement = document.getElementById(cacheHitRateElementId);
assert(
	cacheHitRateElement != null,
	"Could not find stats element with ID '" + cacheHitRateElementId + "'."
);

const cacheUsageElementId = "stats-cache-usage";
const cacheUsageElement = document.getElementById(cacheUsageElementId);
assert(
	cacheUsageElement != null,
	"Could not find stats element with ID '" + cacheUsageElementId + "'."
);

// Bind to the run button click event to run the simulation
const runButton = document.getElementById("start-simulation") as HTMLButtonElement;
assert(runButton != null, "Could not find run button.");
runButton.onclick = async () =>
{
	// This will need to be updated to handle the case where the user clicks
	//   on the button again to stop the simulation.

	/// @todo Make these parameters configurable via the UI
	const cacheLineSize = 8;
	const placementPolicy = new DirectMappedPlacementPolicy(
		cacheLineSize,
		cacheLineCount
	);
	const evictionPolicy = new LeastRecentlyUsedEvictionPolicy(
		cacheLineCount
	);
	const playbackIntervalMs = 50;
	const transposeAlgorithm = naiveTranspose;

	// Create the components backing the simulator
	const matrixSize = matrixSizeControls.matrixSize;
	const memory = new ArrayMemory(
		new Array(matrixSize[0] * matrixSize[1]).fill(0)
	);
	const cache = new ModularCache(
		cacheLineSize,
		cacheLineCount,
		placementPolicy,
		evictionPolicy
	);
	const cacheLineAllocator = new WriteThroughCacheLineAllocator(
		memory,
		cacheLineSize
	);
	const validator = new TransposeValidator(
		matrixSize[0],
		matrixSize[1],
	);
	validator.initializeMemory(memory);

	// Iterate over the matrix's values and set the initial values displayed
	//   in each matrix cell
	for (let y = 0; y < matrixSize[1]; ++y)
	{
		for (let x = 0; x < matrixSize[0]; ++x)
		{
			const value = memory.read(y * matrixSize[0] + x);
			setMatrixCellText(x, y, value.toString());
		}
	}

	// Create the simulator
	const simulator = new TransposeSimulator(
		memory,
		cache,
		cacheLineAllocator,
		validator
	);

	// Create the visualization components
	const eventBuffer = new ArrayEventBuffer();
	const playbackController = new IntervalPlaybackController(
		eventBuffer,
		playbackIntervalMs
	);

	// Bind simulator events to visualization component methods
	simulator.OnMemoryAccessed.subscribe((_, args) =>
	{
		eventBuffer.onMemoryAccessed(args);
	});
	simulator.OnCacheLineLoaded.subscribe((_, args) =>
	{
		eventBuffer.onCacheLineLoaded(args);
	});
	simulator.OnCacheLineEvicted.subscribe((_, args) =>
	{
		eventBuffer.onCacheLineEvicted(args);
	});

	// Create the renderer components
	const matrixRenderer = new DomMatrixRenderer(
		(
			x: number,
			y: number,
			value: number | null,
			color: string,
			textColor: string
		) =>
		{
			const cell = document.getElementById(generateMatrixCellId(x, y));
			assert(
				cell != null,
				"Could not find matrix cell with ID '" +
				generateMatrixCellId(x, y) +
				"'."
			);
			cell.style.backgroundColor = color;
			cell.style.color = textColor;

			// Update the cell's text if necessary
			if (value != null)
			{
				setMatrixCellText(x, y, value.toString());
			}
		},
		// Loaded cache line background color
		"#339900",
		// Loaded cache line text color
		"#000000",
		// Unloaded cache line background color
		"#222222",
		// Unloaded cache line text color
		"#AAAAAA",
		// Accessed element background color
		"#CCCCCC",
		// Accessed element text color
		"#000000",
		matrixSize[0],
		matrixSize[1]
	);
	const cacheRenderer = new DomCacheRenderer(
		(cacheLine: number, css: string) =>
		{
			const cacheLineElement = document.getElementById(
				generateCacheLineId(cacheLine)
			);
			assert(
				cacheLineElement != null,
				"Could not find cache line element with ID '" +
				generateCacheLineId(cacheLine) +
				"'."
			);
			cacheLineElement.className = cacheLineCss + " " + css;
		},
		cacheLineCount,
		"bg-success",
		""
	);
	const statsRenderer = new DomStatsRenderer(
		(count: number) =>
		{
			memoryAccessesElement.textContent = count.toString();
		},
		(count: number) =>
		{
			cacheHitsElement.textContent = count.toString();
		},
		(count: number) =>
		{
			cacheMissesElement.textContent = count.toString();
		},
		(count: number) =>
		{
			// Convert the argument, which will be a value in the range [0, 1],
			//   to a percentage
			const percentage = Math.round(count * 100);
			cacheHitRateElement.textContent = percentage.toString() + "%";
		},
		(count: number) =>
		{
			// Convert the argument, which will be a value in the range [0, 1],
			//   to a percentage
			const percentage = Math.round(count * 100);
			cacheUsageElement.textContent = percentage.toString() + "%";
		},
		cacheLineCount
	);
	const renderers = [
		matrixRenderer,
		cacheRenderer,
		statsRenderer,
	];

	// Bind visualization component events to renderer component methods
	playbackController.OnVisualizationStarted.subscribe(() =>
	{
		renderers.forEach((renderer) =>
		{
			renderer.onSimulationStarted();
		});
	});
	playbackController.OnMemoryAccessed.subscribe((args) =>
	{
		renderers.forEach((renderer) =>
		{
			renderer.onMemoryAccessed(args);
		});
	});
	playbackController.OnCacheLineLoaded.subscribe((args) =>
	{
		renderers.forEach((renderer) =>
		{
			renderer.onCacheLineLoaded(args);
		});
	});
	playbackController.OnCacheLineEvicted.subscribe((args) =>
	{
		renderers.forEach((renderer) =>
		{
			renderer.onCacheLineEvicted(args);
		});
	});
	playbackController.OnVisualizationFinished.subscribe(() =>
	{
		renderers.forEach((renderer) =>
		{
			renderer.onSimulationFinished();
		});
	});

	// Run the matrix transpose algorithm
	const matrix = new RowMajorMatrix(
		simulator,
		matrixSize
	);
	transposeAlgorithm(matrix);

	// Start the visualization
	playbackController.startVisualization();
	await playbackController.waitForSimulation();
	playbackController.stopVisualization();
};
