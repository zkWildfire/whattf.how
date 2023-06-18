import assert from "assert";
import DemoInstance from "./DemoInstance";
import DemoMatrixGenerator from "./DemoMatrixGenerator";
import IMatrix from "./Matrix";
import IMatrixGenerator from "./MatrixGenerator";
import ICacheGenerator from "./CacheGenerator";
import DemoCacheGenerator from "./DemoCacheGenerator";
import IPlacementPolicy from "../Simulation/Policies/PlacementPolicy";
import DirectMappedPlacementPolicy from "../Simulation/Policies/DirectMappedPlacementPolicy";
import FullyAssociativePlacementPolicy from "../Simulation/Policies/FullyAssociativePlacementPolicy";
import NWayAssociativePlacementPolicy from "../Simulation/Policies/NWayAssociativePlacementPolicy";
import LeastRecentlyUsedEvictionPolicy from "../Simulation/Policies/LeastRecentlyUsedEvictionPolicy";
import IEvictionPolicy from "../Simulation/Policies/EvictionPolicy";
import ArrayMemory from "../Simulation/Memory/ArrayMemory";
import ModularCache from "../Simulation/Caches/ModularCache";
import WriteThroughCacheLineAllocator from "../Simulation/CacheLines/WriteThroughCacheLineAllocator";
import TransposeValidator from "../Simulation/Validators/TransposeValidator";
import TransposeSimulator from "../Simulation/TransposeSimulator";
import ArrayEventBuffer from "../Visualization/Buffers/ArrayEventBuffer";
import IntervalPlaybackController from "../Visualization/Playback/IntervalPlaybackController";
import IMatrixRenderer from "../Visualization/Renderers/MatrixRenderer";
import DomMatrixRenderer from "../Visualization/Renderers/DomMatrixRenderer";
import ICacheRenderer from "../Visualization/Renderers/CacheRenderer";
import DomCacheRenderer from "../Visualization/Renderers/DomCacheRenderer";
import IStatsRenderer from "../Visualization/Renderers/StatsRenderer";
import DomStatsRenderer from "../Visualization/Renderers/DomStatsRenderer";

/// Helper class used to construct demo instances.
/// This is a reusable class that may be used to construct multiple demo
///   instances. All values will be maintained between calls to `construct()`.
export default class DemoBuilder
{
	/// Class applied to matrix cell text elements.
	private static readonly MATRIX_CELL_TEXT_ELEMENT_CLASS = "matrix-cell-text";

	/// CSS applied to all cache line elements.
	private static readonly CACHE_LINE_CSS =
		"border rounded-0 cache-line flex-fill";

	/// Reference to the container element for the matrix.
	private _matrixContainerElement: HTMLElement | null = null;

	/// Reference to the container element for the cache lines.
	private _cacheContainerElement: HTMLElement | null = null;

	/// Reference to the element that displays the number of memory accesses.
	private _memoryAccessesElement: HTMLElement | null = null;

	/// Reference to the element that displays the number of cache hits.
	private _cacheHitsElement: HTMLElement | null = null;

	/// Reference to the element that displays the number of cache misses.
	private _cacheMissesElement: HTMLElement | null = null;

	/// Reference to the element that displays the cache hit rate.
	private _cacheHitRateElement: HTMLElement | null = null;

	/// Reference to the element that displays the current cache usage.
	private _cacheUsageElement: HTMLElement | null = null;

	/// The size of the cache in number of cache lines.
	private _cacheSize: number;

	/// The size of each cache line, in number of elements.
	private _cacheLineSize: number;

	/// The associativity of the cache.
	private _associativity: EAssociativity;

	/// The eviction policy of the cache.
	private _evictionPolicy: EEvictionPolicy;

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
	/// @param evictionPolicy The eviction policy of the cache.
	/// @param matrixSize The matrix size to use for the demo.
	/// @param simulationSpeedMs The simulation speed to use for the demo.
	/// @param displayValues Whether to display matrix elements' values.
	/// @param algorithm The algorithm to run for the demo.
	constructor(
		cacheSize: number,
		cacheLineSize: number,
		associativity: EAssociativity,
		evictionPolicy: EEvictionPolicy,
		matrixSize: EMatrixSize,
		simulationSpeedMs: ESimulationSpeed,
		displayValues: boolean,
		algorithm: (matrix: IMatrix) => void)
	{
		this._cacheSize = cacheSize;
		this._cacheLineSize = cacheLineSize;
		this._associativity = associativity;
		this._evictionPolicy = evictionPolicy;
		this._matrixSize = matrixSize;
		this._simulationSpeedMs = simulationSpeedMs;
		this._displayValues = displayValues;
		this._algorithm = algorithm;
	}

	/// Constructs a new demo instance with the current settings.
	/// @throws Error Thrown if the build configuration is invalid.
	/// @returns The constructed demo instance.
	public construct(): DemoInstance
	{
		// Make sure required parameters were set
		assert(this._matrixContainerElement !== null);
		assert(this._cacheContainerElement !== null);

		// Convert enums to their equivalent constants
		const matrixX = DemoBuilder.getMatrixX(this._matrixSize);
		const matrixY = DemoBuilder.getMatrixY(this._matrixSize);

		// Construct the generator objects
		const matrixGenerator = this.constructMatrixGenerator();
		const cacheGenerator = this.constructCacheGenerator();

		// Create the components for the simulator
		const placementPolicy = DemoBuilder.constructPlacementPolicy(
			this._associativity,
			this._cacheSize,
			this._cacheLineSize
		);
		const evictionPolicy = DemoBuilder.constructEvictionPolicy(
			this._evictionPolicy,
			this._cacheSize
		);
		const memory = new ArrayMemory(
			new Array(matrixX * matrixY).fill(0)
		);
		const cache = new ModularCache(
			this._cacheLineSize,
			this._cacheSize,
			placementPolicy,
			evictionPolicy
		);
		const cacheLineAllocator = new WriteThroughCacheLineAllocator(
			memory,
			this._cacheLineSize
		);
		const validator = new TransposeValidator(
			matrixX,
			matrixY,
		);
		validator.initializeMemory(memory);

		// Iterate over the matrix's values and set the initial values displayed
		//   in each matrix cell
		for (let y = 0; y < matrixY; ++y)
		{
			for (let x = 0; x < matrixX; ++x)
			{
				const value = memory.read(y * matrixX + x);
				DemoBuilder.setMatrixCellText(x, y, value.toString());
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
			this._simulationSpeedMs
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
		const matrixRenderer = DemoBuilder.constructMatrixRenderer(
			matrixX,
			matrixY
		);
		const cacheRenderer = DemoBuilder.constructCacheRenderer(
			this._cacheSize
		);
		const statsRenderer = this.constructStatsRenderer();
		const renderers = [
			matrixRenderer,
			cacheRenderer,
			statsRenderer
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

		// Construct the demo instance
		return new DemoInstance(
			matrixGenerator,
			cacheGenerator,
			cache,
			simulator,
			this._algorithm,
			playbackController,
			[matrixX, matrixY]
		);
	}

	/// Sets the container element for the matrix.
	/// @param id ID of the container element for the matrix.
	/// @throws Error If the element with the given ID does not exist.
	/// @returns `this`
	public setMatrixContainerElement(id: string): DemoBuilder
	{
		this._matrixContainerElement = DemoBuilder.getRequiredElementById(id);
		return this;
	}

	/// Sets the container element for the cache lines.
	/// @param id ID of the container element for the cache lines.
	/// @throws Error If the element with the given ID does not exist.
	/// @returns `this`
	public setCacheContainerElement(id: string): DemoBuilder
	{
		this._cacheContainerElement = DemoBuilder.getRequiredElementById(id);
		return this;
	}

	/// Sets the element that displays the number of memory accesses.
	/// @param id ID of the element that displays the number of memory accesses.
	/// @throws Error If the element with the given ID does not exist.
	/// @returns `this`
	public setMemoryAccessesElement(id: string): DemoBuilder
	{
		this._memoryAccessesElement = DemoBuilder.getRequiredElementById(id);
		return this;
	}

	/// Sets the element that displays the number of cache hits.
	/// @param id ID of the element that displays the number of cache hits.
	/// @throws Error If the element with the given ID does not exist.
	/// @returns `this`
	public setCacheHitsElement(id: string): DemoBuilder
	{
		this._cacheHitsElement = DemoBuilder.getRequiredElementById(id);
		return this;
	}

	/// Sets the element that displays the number of cache misses.
	/// @param id ID of the element that displays the number of cache misses.
	/// @throws Error If the element with the given ID does not exist.
	/// @returns `this`
	public setCacheMissesElement(id: string): DemoBuilder
	{
		this._cacheMissesElement = DemoBuilder.getRequiredElementById(id);
		return this;
	}

	/// Sets the element that displays the cache hit rate.
	/// @param id ID of the element that displays the cache hit rate.
	/// @throws Error If the element with the given ID does not exist.
	/// @returns `this`
	public setCacheHitRateElement(id: string): DemoBuilder
	{
		this._cacheHitRateElement = DemoBuilder.getRequiredElementById(id);
		return this;
	}

	/// Sets the element that displays the current cache usage.
	/// @param id ID of the element that displays the current cache usage.
	/// @throws Error If the element with the given ID does not exist.
	/// @returns `this`
	public setCacheUsageElement(id: string): DemoBuilder
	{
		this._cacheUsageElement = DemoBuilder.getRequiredElementById(id);
		return this;
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

	/// Sets the eviction policy of the cache.
	/// @param evictionPolicy The eviction policy of the cache.
	/// @returns `this`
	public setEvictionPolicy(policy: EEvictionPolicy): DemoBuilder
	{
		this._evictionPolicy = policy;
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

	/// Constructs the cache generator for the demo.
	/// @returns The constructed cache generator.
	private constructCacheGenerator(): ICacheGenerator
	{
		assert(this._cacheContainerElement !== null);
		const cacheContainerElement = this._cacheContainerElement;

		return new DemoCacheGenerator(
			// Callback for clearing the cache container element
			() => cacheContainerElement.innerHTML = "",
			// Callback for creating a new cache line element
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
				rowElement.id = DemoBuilder.generateCacheLineId(i);
				rowElement.className = DemoBuilder.CACHE_LINE_CSS;
				row.appendChild(rowElement);

				cacheContainerElement.appendChild(row);
				return row;
			}
		);
	}

	/// Constructs the matrix generator for the demo.
	/// @returns The constructed matrix generator.
	private constructMatrixGenerator(): IMatrixGenerator
	{
		assert(this._matrixContainerElement !== null);
		const matrixContainerElement = this._matrixContainerElement;

		// Create the matrix generator for the demo
		const matrixGenerator = new DemoMatrixGenerator(
			// Callback for clearing all matrix elements
			() => matrixContainerElement.innerHTML = "",
			// Callback for creating a new matrix row
			(y: number) =>
			{
				const row = document.createElement("div");
				matrixContainerElement.appendChild(row);
				return row;
			},
			// Callback for creating a new matrix cell
			(row: HTMLElement, x: number, y: number) =>
			{
				const cell = document.createElement("div");
				cell.id = DemoBuilder.generateMatrixCellId(x, y);

				// Create an inner element that will display the cell's value
				// This is necessary to ensure that the cell's size is not
				//   affected by the length of the value stored in the cell
				const cellInner = document.createElement("div");
				cellInner.className =
					DemoBuilder.MATRIX_CELL_TEXT_ELEMENT_CLASS +
					"position-absolute w-100 h-100 d-flex align-items-center " +
					"justify-content-center text-center overflow-hidden";
				cell.appendChild(cellInner);

				row.appendChild(cell);
				return cell;
			},
			// Row CSS
			"w-100 d-flex",
			// Cell CSS
			"flex-fill matrix-cell position-relative"
		);

		return matrixGenerator;
	}

	/// Constructs the cache renderer for the demo.
	/// @param cacheLineCount The number of cache lines in the cache.
	private static constructCacheRenderer(
		cacheLineCount: number): ICacheRenderer
	{
		return new DomCacheRenderer(
			(cacheLine: number, css: string) =>
			{
				const elementId = DemoBuilder.generateCacheLineId(cacheLine);
				const cacheLineElement = document.getElementById(elementId);
				assert(
					cacheLineElement != null,
					"Could not find cache line element with ID '" +
					elementId +
					"'."
				);
				cacheLineElement.className =
					`${DemoBuilder.CACHE_LINE_CSS} ${css}`;
			},
			cacheLineCount,
			"bg-success",
			""
		);
	}

	/// Constructs the eviction policy for the demo.
	/// @param evictionPolicy The eviction policy to use.
	/// @param cacheSize The size of the cache in number of cache lines.
	/// @returns The constructed eviction policy.
	private static constructEvictionPolicy(
		evictionPolicy: EEvictionPolicy,
		cacheSize: number):
		IEvictionPolicy
	{
		switch (evictionPolicy)
		{
		case EEvictionPolicy.LeastRecentlyUsed:
			return new LeastRecentlyUsedEvictionPolicy(
				cacheSize
			);
		}

		/// @todo Implement the other eviction policies
		throw new Error("Not implemented.");
	}

	/// Constructs the matrix renderer for the demo.
	/// @param matrixX The number of columns in the matrix.
	/// @param matrixY The number of rows in the matrix.
	/// @returns The constructed matrix renderer.
	private static constructMatrixRenderer(
		matrixX: number,
		matrixY: number): IMatrixRenderer
	{
		return new DomMatrixRenderer(
			(
				x: number,
				y: number,
				value: number | null,
				color: string,
				textColor: string
			) =>
			{
				const cellId = DemoBuilder.generateMatrixCellId(x, y);
				const cell = document.getElementById(cellId);
				assert(
					cell != null,
					`Could not find matrix cell with ID '${cellId}'.`
				);
				cell.style.backgroundColor = color;
				cell.style.color = textColor;

				// Update the cell's text if necessary
				if (value != null)
				{
					DemoBuilder.setMatrixCellText(x, y, value.toString());
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
			matrixX,
			matrixY
		);
	}

	/// Constructs the placement policy for the demo.
	/// @param associativity The associativity of the cache.
	/// @param cacheSize The size of the cache in number of cache lines.
	/// @param cacheLineSize The size of each cache line in number of elements.
	/// @returns The constructed placement policy.
	private static constructPlacementPolicy(
		associativity: EAssociativity,
		cacheSize: number,
		cacheLineSize: number):
		IPlacementPolicy
	{
		switch (associativity)
		{
		case EAssociativity.DirectMapped:
			return new DirectMappedPlacementPolicy(
				cacheLineSize,
				cacheSize
			);
		case EAssociativity.TwoWay:
			return new NWayAssociativePlacementPolicy(
				cacheLineSize,
				cacheSize,
				2
			);
		case EAssociativity.FourWay:
			return new NWayAssociativePlacementPolicy(
				cacheLineSize,
				cacheSize,
				4
			);
		case EAssociativity.EightWay:
			return new NWayAssociativePlacementPolicy(
				cacheLineSize,
				cacheSize,
				8
			);
		case EAssociativity.FullyAssociative:
			return new FullyAssociativePlacementPolicy(
				cacheSize
			);
		}
	}

	/// Constructs the stats renderer for the demo.
	/// @returns The constructed stats renderer.
	private constructStatsRenderer(): IStatsRenderer
	{
		assert(this._memoryAccessesElement != null);
		assert(this._cacheHitsElement != null);
		assert(this._cacheMissesElement != null);
		assert(this._cacheHitRateElement != null);
		assert(this._cacheUsageElement != null);

		const memoryAccessesElement = this._memoryAccessesElement;
		const cacheHitsElement = this._cacheHitsElement;
		const cacheMissesElement = this._cacheMissesElement;
		const cacheHitRateElement = this._cacheHitRateElement;
		const cacheUsageElement = this._cacheUsageElement;

		return new DomStatsRenderer(
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
			this._cacheSize
		);
	}

	/// Helper method for generating HTML element IDs for cache line elements.
	/// @param index The index of the cache line element.
	/// @returns The generated HTML element ID for the cache line element.
	private static generateCacheLineId(index: number): string
	{
		return `cache-line-${index}`;
	}

	/// Helper method for generating HTML element IDs for matrix cells.
	/// @param x The x-coordinate of the matrix cell.
	/// @param y The y-coordinate of the matrix cell.
	/// @returns The generated HTML element ID for the matrix cell.
	private static generateMatrixCellId(x: number, y: number): string
	{
		return `matrix-cell-${x}-${y}`;
	}

	/// Helper method for getting the X dimension of a matrix size.
	/// @param matrixSize The size of the matrix.
	/// @returns The X dimension of the matrix size.
	private static getMatrixX(matrixSize: EMatrixSize): number
	{
		switch (matrixSize)
		{
		case EMatrixSize.SIZE_16x16:
			return 16;
		case EMatrixSize.SIZE_32x32:
			return 32;
		case EMatrixSize.SIZE_64x64:
			return 64;
		case EMatrixSize.SIZE_63x63:
			return 63;
		}
	}

	/// Helper method for getting the Y dimension of a matrix size.
	/// @param matrixSize The size of the matrix.
	/// @returns The Y dimension of the matrix size.
	private static getMatrixY(matrixSize: EMatrixSize): number
	{
		switch (matrixSize)
		{
		case EMatrixSize.SIZE_16x16:
			return 16;
		case EMatrixSize.SIZE_32x32:
			return 32;
		case EMatrixSize.SIZE_64x64:
			return 64;
		case EMatrixSize.SIZE_63x63:
			return 63;
		}
	}

	private static getRequiredElementById(id: string): HTMLElement
	{
		const element = document.getElementById(id);
		assert(
			element != null,
			`Could not find element with ID '${id}'.`
		);
		return element;
	}

	// Helper method used to set the text of a matrix cell
	private static setMatrixCellText(x: number, y: number, text: string): void
	{
		// Get the cell element
		const cell = document.getElementById(
			DemoBuilder.generateMatrixCellId(x, y)
		);
		assert(
			cell != null,
			"Could not find matrix cell with ID " +
			`'${DemoBuilder.generateMatrixCellId(x, y)}'.`
		);

		// Get the inner element that displays the cell's value
		const innerElements = cell.getElementsByClassName(
			DemoBuilder.MATRIX_CELL_TEXT_ELEMENT_CLASS
		);
		assert(
			innerElements.length == 1,
			"Expected to find exactly one text element in matrix cell " +
			`with ID '${DemoBuilder.generateMatrixCellId(x, y)}'.`
		);

		// Update the text of the inner element
		const textElement = innerElements[0] as HTMLSpanElement;
		textElement.innerText = text;
	}
}
