import ICacheLineAllocator from "./CacheLines/CacheLineAllocator";
import WriteThroughCacheLineAllocator from "./CacheLines/WriteThroughCacheLineAllocator";
import ICache from "./Caches/Cache";
import ModularCache from "./Caches/ModularCache";
import OnCacheLineEvictedEventArgs from "./Events/OnCacheLineEvictedEventArgs";
import OnCacheLineLoadedEventArgs from "./Events/OnCacheLineLoadedEventArgs";
import OnMemoryAccessedEventArgs from "./Events/OnMemoryAccessedEventArgs";
import ArrayMemory from "./Memory/ArrayMemory";
import DirectMappedPlacementPolicy from "./Policies/DirectMappedPlacementPolicy";
import IEvictionPolicy from "./Policies/EvictionPolicy";
import LeastRecentlyUsedEvictionPolicy from "./Policies/LeastRecentlyUsedEvictionPolicy";
import IPlacementPolicy from "./Policies/PlacementPolicy";
import ISimulator from "./Simulator";
import TransposeSimulator from "./TransposeSimulator";
import IMemoryValidator from "./Validators/MemoryValidator";
import TransposeValidator from "./Validators/TransposeValidator";

class TransposeSimulatorTests
{
	// Test parameters
	public readonly lineSize: number;
	public readonly cacheSize: number;
	public readonly matrixX: number;
	public readonly matrixY: number;

	// Simulator objects
	public readonly memory: ArrayMemory;
	public readonly placementPolicy: IPlacementPolicy;
	public readonly evictionPolicy: IEvictionPolicy;
	public readonly cache: ICache;
	public readonly allocator: ICacheLineAllocator;
	public readonly validator: IMemoryValidator;
	public readonly simulator: TransposeSimulator;

	// Event counters
	public cacheLineLoadedEventCount = 0;
	public lastCacheLineLoadedSender: ISimulator | null = null;
	public lastCacheLineLoadedEventArgs: OnCacheLineLoadedEventArgs | null = null;
	public cacheLineEvictedEventCount = 0;
	public lastCacheLineEvictedSender: ISimulator | null = null;
	public lastCacheLineEvictedEventArgs: OnCacheLineEvictedEventArgs | null = null;
	public memoryAccessedEventCount = 0;
	public lastMemoryAccessedSender: ISimulator | null = null;
	public lastMemoryAccessedEventArgs: OnMemoryAccessedEventArgs | null = null;

	/// Initializes the test fixture.
	/// @param lineSize Size of each cache line, in number of elements.
	/// @param cacheSize Number of cache lines in the cache.
	/// @param memorySize Size of the memory to use for the simulation. If not
	///   set, defaults to the size of the cache.
	/// @param matrixX Width of the matrix to use for the simulation.
	/// @param matrixY Height of the matrix to use for the simulation.
	constructor(
		lineSize: number = 4,
		cacheSize: number = 1,
		memorySize: number | null = null,
		matrixX: number = 2,
		matrixY: number = 2)
	{
		this.lineSize = lineSize;
		this.cacheSize = cacheSize;
		this.matrixX = matrixX;
		this.matrixY = matrixY;

		// Set up simulator objects
		this.memory = new ArrayMemory(
			new Array<number>(memorySize ?? lineSize * cacheSize).fill(0)
		);
		this.placementPolicy = new DirectMappedPlacementPolicy(
			lineSize,
			cacheSize
		);
		this.evictionPolicy = new LeastRecentlyUsedEvictionPolicy(
			cacheSize
		);
		this.cache = new ModularCache(
			lineSize,
			cacheSize,
			this.placementPolicy,
			this.evictionPolicy
		);
		this.allocator = new WriteThroughCacheLineAllocator(
			this.memory,
			lineSize
		);

		const validator = new TransposeValidator(
			matrixX,
			matrixY
		);
		validator.initializeMemory(this.memory);
		this.validator = validator;

		this.simulator = new TransposeSimulator(
			this.memory,
			this.cache,
			this.allocator,
			this.validator
		);

		// Bind to simulator events
		this.simulator.OnCacheLineLoaded.subscribe((sender, args) =>
		{
			this.cacheLineLoadedEventCount++;
			this.lastCacheLineLoadedSender = sender;
			this.lastCacheLineLoadedEventArgs = args;
		});

		this.simulator.OnCacheLineEvicted.subscribe((sender, args) =>
		{
			this.cacheLineEvictedEventCount++;
			this.lastCacheLineEvictedSender = sender;
			this.lastCacheLineEvictedEventArgs = args;
		});

		this.simulator.OnMemoryAccessed.subscribe((sender, args) =>
		{
			this.memoryAccessedEventCount++;
			this.lastMemoryAccessedSender = sender;
			this.lastMemoryAccessedEventArgs = args;
		});
	}
}

test("Read new address causes cache line loaded event", () =>
{
	let test = new TransposeSimulatorTests();
	const simulator = test.simulator;
	simulator.read(1);

	expect(test.cacheLineLoadedEventCount).toBe(1);
	expect(test.lastCacheLineLoadedSender).toBe(simulator);
	expect(test.lastCacheLineLoadedEventArgs?.cacheIndex).toBe(
		// This should be the index of the cache line within the cache, not
		//   the index of the memory address
		0
	);
	expect(test.cacheLineEvictedEventCount).toBe(0);
});

test("Read loaded address does not cause cache line loaded event", () =>
{
	let test = new TransposeSimulatorTests();
	const simulator = test.simulator;
	simulator.read(1);
	simulator.read(2);

	// The event data for the cache line loaded event should match the test
	//   where only one read is performed since the second read shouldn't cause
	//   a new cache line to be loaded
	expect(test.cacheLineLoadedEventCount).toBe(1);
	expect(test.lastCacheLineLoadedSender).toBe(simulator);
	expect(test.lastCacheLineLoadedEventArgs?.cacheIndex).toBe(
		// This should be the index of the cache line within the cache, not
		//   the index of the memory address
		0
	);
	expect(test.cacheLineEvictedEventCount).toBe(0);
});

test("Read different address in loaded cache line does not cause cache line loaded event", () =>
{
	let test = new TransposeSimulatorTests();
	const simulator = test.simulator;
	simulator.read(1);
	simulator.read(2);

	expect(test.cacheLineLoadedEventCount).toBe(1);
	expect(test.lastCacheLineLoadedSender).toBe(simulator);
	expect(test.lastCacheLineLoadedEventArgs?.cacheIndex).toBe(
		// This should be the index of the cache line within the cache, not
		//   the index of the memory address
		0
	);
	expect(test.cacheLineEvictedEventCount).toBe(0);
});

test("Write new address causes cache line loaded event", () =>
{
	let test = new TransposeSimulatorTests();
	const simulator = test.simulator;
	simulator.write(1, 1);

	expect(test.cacheLineLoadedEventCount).toBe(1);
	expect(test.lastCacheLineLoadedSender).toBe(simulator);
	expect(test.lastCacheLineLoadedEventArgs?.cacheIndex).toBe(
		// This should be the index of the cache line within the cache, not
		//   the index of the memory address
		0
	);
	expect(test.cacheLineEvictedEventCount).toBe(0);
});

test("Write loaded address does not cause cache line loaded event", () =>
{
	let test = new TransposeSimulatorTests();
	const simulator = test.simulator;
	simulator.write(1, 1);
	simulator.write(1, 2);

	// The event data for the cache line loaded event should match the test
	//   where only one write is performed since the second write shouldn't
	//   cause a new cache line to be loaded
	expect(test.cacheLineLoadedEventCount).toBe(1);
	expect(test.lastCacheLineLoadedSender).toBe(simulator);
	expect(test.lastCacheLineLoadedEventArgs?.cacheIndex).toBe(
		// This should be the index of the cache line within the cache, not
		//   the index of the memory address
		0
	);
	expect(test.cacheLineEvictedEventCount).toBe(0);
});

test("Write different address in loaded cache line does not cause cache line loaded event", () =>
{
	let test = new TransposeSimulatorTests();
	const simulator = test.simulator;
	simulator.write(1, 1);
	simulator.write(2, 2);

	expect(test.cacheLineLoadedEventCount).toBe(1);
	expect(test.lastCacheLineLoadedSender).toBe(simulator);
	expect(test.lastCacheLineLoadedEventArgs?.cacheIndex).toBe(
		// This should be the index of the cache line within the cache, not
		//   the index of the memory address
		0
	);
	expect(test.cacheLineEvictedEventCount).toBe(0);
});

test("Read new address causes memory accessed event", () =>
{
	const INDEX = 1;
	let test = new TransposeSimulatorTests();
	const simulator = test.simulator;
	simulator.read(INDEX);

	expect(test.memoryAccessedEventCount).toBe(1);
	expect(test.lastMemoryAccessedSender).toBe(simulator);
	expect(test.lastMemoryAccessedEventArgs?.index).toBe(
		INDEX
	);
	expect(test.lastMemoryAccessedEventArgs?.isHit).toBe(
		false
	);
});

test("Read loaded address causes memory accessed event", () =>
{
	let test = new TransposeSimulatorTests();
	const simulator = test.simulator;
	simulator.read(1);
	// This should result in a cache hit since it's in the same cache line as
	//   the previous read
	simulator.read(2);

	expect(test.memoryAccessedEventCount).toBe(2);
	expect(test.lastMemoryAccessedSender).toBe(simulator);
	expect(test.lastMemoryAccessedEventArgs?.index).toBe(
		2
	);
	expect(test.lastMemoryAccessedEventArgs?.isHit).toBe(
		true
	);
});

test("Write new address causes memory accessed event", () =>
{
	const INDEX = 1;
	let test = new TransposeSimulatorTests();
	const simulator = test.simulator;
	simulator.write(INDEX, 1);

	expect(test.memoryAccessedEventCount).toBe(1);
	expect(test.lastMemoryAccessedSender).toBe(simulator);
	expect(test.lastMemoryAccessedEventArgs?.index).toBe(
		INDEX
	);
	expect(test.lastMemoryAccessedEventArgs?.isHit).toBe(
		false
	);
});

test("Write loaded address causes memory accessed event", () =>
{
	let test = new TransposeSimulatorTests();
	const simulator = test.simulator;
	simulator.read(1);
	// This should result in a cache hit since it's in the same cache line as
	//   the previous cache access
	simulator.write(2, 2);

	expect(test.memoryAccessedEventCount).toBe(2);
	expect(test.lastMemoryAccessedSender).toBe(simulator);
	expect(test.lastMemoryAccessedEventArgs?.index).toBe(
		2
	);
	expect(test.lastMemoryAccessedEventArgs?.isHit).toBe(
		true
	);
});

test("Reading new address when cache is full causes cache line evicted event", () =>
{
	// Create a simulator whose memory is twice as large as the cache size
	let test = new TransposeSimulatorTests(4, 1, 8);
	const simulator = test.simulator;
	simulator.read(Math.floor(test.lineSize / 2));
	// This should cause the first cache line that was loaded to be evicted
	simulator.read(test.lineSize);

	expect(test.cacheLineLoadedEventCount).toBe(2);
	expect(test.cacheLineEvictedEventCount).toBe(1);
	expect(test.lastCacheLineEvictedSender).toBe(simulator);
	expect(test.lastCacheLineEvictedEventArgs?.cacheIndex).toBe(
		// This should be the index of the cache line within the cache, not
		//   the index of the memory address
		0
	);
});

test("Writing new address when cache is full causes cache line evicted event", () =>
{
	// Create a simulator whose memory is twice as large as the cache size
	let test = new TransposeSimulatorTests(4, 1, 8);
	const simulator = test.simulator;
	simulator.read(Math.floor(test.lineSize / 2));
	// This should cause the first cache line that was loaded to be evicted
	simulator.write(test.lineSize, 1);

	expect(test.cacheLineLoadedEventCount).toBe(2);
	expect(test.cacheLineEvictedEventCount).toBe(1);
	expect(test.lastCacheLineEvictedSender).toBe(simulator);
	expect(test.lastCacheLineEvictedEventArgs?.cacheIndex).toBe(
		// This should be the index of the cache line within the cache, not
		//   the index of the memory address
		0
	);
});

test("Validate unchanged memory fails", () =>
{
	let test = new TransposeSimulatorTests();
	const simulator = test.simulator;

	const results = simulator.validateMemory();
	expect(results.length).toBeGreaterThan(0);
});

test("Validate successfully transposed memory succeeds", () =>
{
	let test = new TransposeSimulatorTests(4, 1, 4, 2, 2);
	const simulator = test.simulator;

	// Transpose the matrix
	test.memory.write(1, 2);
	test.memory.write(2, 1);

	const results = simulator.validateMemory();
	expect(results.length).toBe(0);
});

test("Read invalid memory address throws exception", () =>
{
	const CACHE_SIZE = 4;
	const LINE_SIZE = 1;
	const MEMORY_SIZE = 4;
	let test = new TransposeSimulatorTests(
		CACHE_SIZE,
		LINE_SIZE,
		MEMORY_SIZE
	);
	const simulator = test.simulator;

	expect(() => simulator.read(-1)).toThrow(RangeError);
	expect(() => simulator.read(MEMORY_SIZE)).toThrow(RangeError);
});

test("Write invalid memory address throws exception", () =>
{
	const CACHE_SIZE = 4;
	const LINE_SIZE = 1;
	const MEMORY_SIZE = 4;
	let test = new TransposeSimulatorTests(
		CACHE_SIZE,
		LINE_SIZE,
		MEMORY_SIZE
	);
	const simulator = test.simulator;

	expect(() => simulator.write(-1, 1)).toThrow(RangeError);
	expect(() => simulator.write(MEMORY_SIZE, 1)).toThrow(RangeError);
});
