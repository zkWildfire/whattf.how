import assert from "assert";
import UniformButtonGroupBuilder from "../Utilities/UniformButtonGroupBuilder";
import DemoBuilder from "./Demo/DemoBuilder";
import IMatrix from "./Demo/Matrix";
import { EAssociativity } from "./Demo/Config/Associativity";
import { EEvictionPolicy } from "./Demo/Config/EvictionPolicy";
import { EMatrixSize } from "./Demo/Config/MatrixSize";
import { ESimulationSpeed } from "./Demo/Config/SimulationSpeed";

//
// Miscellaneous constants
//
const BUTTON_COMMON_CSS = "btn col-2 rounded-0";
const BUTTON_ACTIVE_CSS = "btn-primary";
const BUTTON_INACTIVE_CSS = "btn-outline-primary";

// ID of the element that will contain the cache lines
const CACHE_ELEMENT_ID = "cache";

// ID of the element that will contain the matrix
const MATRIX_ELEMENT_ID = "matrix";

// IDs of the statistics elements
const MEMORY_ACCESSES_ELEMENT_ID = "stats-memory-accesses";
const CACHE_HITS_ELEMENT_ID = "stats-cache-hits";
const CACHE_MISSES_ELEMENT_ID = "stats-cache-misses";
const CACHE_HIT_RATE_ELEMENT_ID = "stats-cache-hit-rate";
const CACHE_USAGE_ELEMENT_ID = "stats-cache-usage";

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
const DEFAULT_EVICTION_POLICY = EEvictionPolicy.LeastRecentlyUsed;
const DEFAULT_MATRIX_SIZE = EMatrixSize.SIZE_32x32;
const DEFAULT_SIMULATION_SPEED = ESimulationSpeed.Fast;
const DEFAULT_DISPLAY_VALUES = false;
const DEFAULT_ALGORITHM = naiveTranspose;

const demoBuilder = new DemoBuilder(
	DEFAULT_CACHE_SIZE,
	DEFAULT_LINE_SIZE,
	DEFAULT_ASSOCIATIVITY,
	DEFAULT_EVICTION_POLICY,
	DEFAULT_MATRIX_SIZE,
	DEFAULT_SIMULATION_SPEED,
	DEFAULT_DISPLAY_VALUES,
	DEFAULT_ALGORITHM
);
demoBuilder.setMatrixContainerElement(MATRIX_ELEMENT_ID)
	.setCacheContainerElement(CACHE_ELEMENT_ID)
	.setMemoryAccessesElement(MEMORY_ACCESSES_ELEMENT_ID)
	.setCacheHitsElement(CACHE_HITS_ELEMENT_ID)
	.setCacheMissesElement(CACHE_MISSES_ELEMENT_ID)
	.setCacheHitRateElement(CACHE_HIT_RATE_ELEMENT_ID)
	.setCacheUsageElement(CACHE_USAGE_ELEMENT_ID);

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
cacheSizeButtonGroupBuilder.addButton(
	"cache-size-xl",
	32
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
	"cache-associativity-2-way",
	EAssociativity.TwoWay
);
associativityButtonGroupBuilder.addButton(
	"cache-associativity-4-way",
	EAssociativity.FourWay,
	true
);
associativityButtonGroupBuilder.addButton(
	"cache-associativity-8-way",
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
// Set up the eviction policy button group
//
const evictionPolicyButtonGroupBuilder = new UniformButtonGroupBuilder<
	EEvictionPolicy
>(
	BUTTON_COMMON_CSS,
	BUTTON_ACTIVE_CSS,
	BUTTON_INACTIVE_CSS
);
evictionPolicyButtonGroupBuilder.addButton(
	"eviction-policy-lru",
	EEvictionPolicy.LeastRecentlyUsed,
	true
);
evictionPolicyButtonGroupBuilder.addButton(
	"eviction-policy-mru",
	EEvictionPolicy.MostRecentlyUsed
);
evictionPolicyButtonGroupBuilder.addButton(
	"eviction-policy-oldest",
	EEvictionPolicy.Oldest
);
evictionPolicyButtonGroupBuilder.addButton(
	"eviction-policy-round-robin",
	EEvictionPolicy.RoundRobin
);
evictionPolicyButtonGroupBuilder.addButton(
	"eviction-policy-random",
	EEvictionPolicy.Random
);

const evictionPolicyButtonGroup = evictionPolicyButtonGroupBuilder.construct();
evictionPolicyButtonGroup.OnButtonClicked.subscribe((_, policy: EEvictionPolicy) =>
{
	demoBuilder.setEvictionPolicy(policy);
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
	"simulation-speed-normal",
	ESimulationSpeed.Normal,
);
simSpeedButtonGroupBuilder.addButton(
	"simulation-speed-fast",
	ESimulationSpeed.Fast,
	true
);
simSpeedButtonGroupBuilder.addButton(
	"simulation-speed-maximum",
	ESimulationSpeed.Maximum
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
	naiveTranspose
);
algorithmButtonGroupBuilder.addButton(
	"algorithm-custom",
	/// @todo Implement support for user-provided custom algorithms
	naiveTranspose
);

const algorithmButtonGroup = algorithmButtonGroupBuilder.construct();
algorithmButtonGroup.OnButtonClicked.subscribe(
	(_, algorithm: (matrix: IMatrix) => void) =>
	{
		demoBuilder.setAlgorithm(algorithm);
	}
);

// Bind to the run button click event to run the simulation
const runButton = document.getElementById("start-simulation") as HTMLButtonElement;
assert(runButton != null, "Could not find run button.");
runButton.onclick = async () =>
{
	const instance = demoBuilder.construct();
	instance.initialize();
	await instance.run();
};
