import WriteThroughCacheLine from "../CacheLines/WriteThroughCacheLine";
import ArrayMemory from "../Memory/ArrayMemory";
import DirectMappedPlacementPolicy from "../Policies/DirectMappedPlacementPolicy";
import LeastRecentlyUsedEvictionPolicy from "../Policies/LeastRecentlyUsedEvictionPolicy";
import ModularCache from "./ModularCache";

test("Properties match ctor args", () =>
{
	const LINE_SIZE = 4;
	const CACHE_SIZE = 8;
	const placementPolicy = new DirectMappedPlacementPolicy(
		LINE_SIZE,
		CACHE_SIZE
	);
	const evictionPolicy = new LeastRecentlyUsedEvictionPolicy(
		CACHE_SIZE
	);

	const cache = new ModularCache(
		LINE_SIZE,
		CACHE_SIZE,
		placementPolicy,
		evictionPolicy
	);

	expect(cache.lineSize).toBe(LINE_SIZE);
	expect(cache.totalLineCount).toBe(CACHE_SIZE);
});

test("Load cache line with empty space", () =>
{
	const LINE_SIZE = 4;
	const CACHE_SIZE = 8;
	const placementPolicy = new DirectMappedPlacementPolicy(
		LINE_SIZE,
		CACHE_SIZE
	);
	const evictionPolicy = new LeastRecentlyUsedEvictionPolicy(
		CACHE_SIZE
	);
	const memory = new ArrayMemory(
		new Array<number>(CACHE_SIZE * LINE_SIZE).fill(0)
	);
	const cache = new ModularCache(
		LINE_SIZE,
		CACHE_SIZE,
		placementPolicy,
		evictionPolicy
	);

	const cacheLine = new WriteThroughCacheLine(memory, 0, LINE_SIZE);
	const loadResult = cache.loadCacheLine(cacheLine);

	expect(loadResult.index).toBeGreaterThanOrEqual(0);
	expect(loadResult.index).toBeLessThan(CACHE_SIZE);
	expect(loadResult.evictedCacheLine).toBeNull();
});

test("Load cache line evicts existing line if full", () =>
{
	const LINE_SIZE = 4;
	const CACHE_SIZE = 1;
	const placementPolicy = new DirectMappedPlacementPolicy(
		LINE_SIZE,
		CACHE_SIZE
	);
	const evictionPolicy = new LeastRecentlyUsedEvictionPolicy(
		CACHE_SIZE
	);
	const memory = new ArrayMemory(
		new Array<number>(CACHE_SIZE * LINE_SIZE).fill(0)
	);
	const cache = new ModularCache(
		LINE_SIZE,
		CACHE_SIZE,
		placementPolicy,
		evictionPolicy
	);

	const cacheLine = new WriteThroughCacheLine(memory, 0, LINE_SIZE);
	// Ignore the first call to `loadCacheLine()` since the cache will have
	//   space for this cache line
	cache.loadCacheLine(cacheLine);
	const loadResult = cache.loadCacheLine(cacheLine);

	expect(loadResult.index).toBeGreaterThanOrEqual(0);
	expect(loadResult.index).toBeLessThan(CACHE_SIZE);
	expect(loadResult.evictedCacheLine).not.toBeNull();
});

test("Is present returns false if never loaded", () =>
{
	const LINE_SIZE = 4;
	const CACHE_SIZE = 1;
	const placementPolicy = new DirectMappedPlacementPolicy(
		LINE_SIZE,
		CACHE_SIZE
	);
	const evictionPolicy = new LeastRecentlyUsedEvictionPolicy(
		CACHE_SIZE
	);
	const cache = new ModularCache(
		LINE_SIZE,
		CACHE_SIZE,
		placementPolicy,
		evictionPolicy
	);

	expect(cache.isPresent(0)).toBe(false);
});

test("Is present returns true if loaded", () =>
{
	const LINE_SIZE = 4;
	const CACHE_SIZE = 8;
	const placementPolicy = new DirectMappedPlacementPolicy(
		LINE_SIZE,
		CACHE_SIZE
	);
	const evictionPolicy = new LeastRecentlyUsedEvictionPolicy(
		CACHE_SIZE
	);
	const memory = new ArrayMemory(
		new Array<number>(CACHE_SIZE * LINE_SIZE).fill(0)
	);
	const cache = new ModularCache(
		LINE_SIZE,
		CACHE_SIZE,
		placementPolicy,
		evictionPolicy
	);

	const cacheLine = new WriteThroughCacheLine(memory, 0, LINE_SIZE);
	cache.loadCacheLine(cacheLine);

	expect(cache.isPresent(0)).toBe(true);
});

test("Is present returns false if unloaded", () =>
{
	const LINE_SIZE = 4;
	const CACHE_SIZE = 1;
	const placementPolicy = new DirectMappedPlacementPolicy(
		LINE_SIZE,
		CACHE_SIZE
	);
	const evictionPolicy = new LeastRecentlyUsedEvictionPolicy(
		CACHE_SIZE
	);
	const cache = new ModularCache(
		LINE_SIZE,
		CACHE_SIZE,
		placementPolicy,
		evictionPolicy
	);
	const memory = new ArrayMemory(
		new Array<number>(CACHE_SIZE * LINE_SIZE * 2).fill(0)
	);

	// Load a cache line to be evicted
	cache.loadCacheLine(new WriteThroughCacheLine(memory, 0, LINE_SIZE));

	// Sanity check - this should be true now and then false later
	expect(cache.isPresent(0)).toBe(true);

	// Evict the cache line
	cache.loadCacheLine(new WriteThroughCacheLine(memory, LINE_SIZE, LINE_SIZE));
	expect(cache.isPresent(0)).toBe(false);
});

test("Get loaded cache line", () =>
{
	const LINE_SIZE = 4;
	const CACHE_SIZE = 1;
	const placementPolicy = new DirectMappedPlacementPolicy(
		LINE_SIZE,
		CACHE_SIZE
	);
	const evictionPolicy = new LeastRecentlyUsedEvictionPolicy(
		CACHE_SIZE
	);
	const cache = new ModularCache(
		LINE_SIZE,
		CACHE_SIZE,
		placementPolicy,
		evictionPolicy
	);
	const memory = new ArrayMemory(
		new Array<number>(CACHE_SIZE * LINE_SIZE * 2).fill(0)
	);

	// Load the cache line to retrieve
	const cacheLine = new WriteThroughCacheLine(memory, 0, LINE_SIZE);
	cache.loadCacheLine(cacheLine);

	expect(cache.getCacheLine(0)).toBe(cacheLine);
});

test("Try get never loaded cache line", () =>
{
	const LINE_SIZE = 4;
	const CACHE_SIZE = 1;
	const placementPolicy = new DirectMappedPlacementPolicy(
		LINE_SIZE,
		CACHE_SIZE
	);
	const evictionPolicy = new LeastRecentlyUsedEvictionPolicy(
		CACHE_SIZE
	);
	const cache = new ModularCache(
		LINE_SIZE,
		CACHE_SIZE,
		placementPolicy,
		evictionPolicy
	);

	expect(cache.tryGetCacheLine(0)).toBe(null);
});

test("Try get loaded cache line", () =>
{
	const LINE_SIZE = 4;
	const CACHE_SIZE = 1;
	const placementPolicy = new DirectMappedPlacementPolicy(
		LINE_SIZE,
		CACHE_SIZE
	);
	const evictionPolicy = new LeastRecentlyUsedEvictionPolicy(
		CACHE_SIZE
	);
	const cache = new ModularCache(
		LINE_SIZE,
		CACHE_SIZE,
		placementPolicy,
		evictionPolicy
	);
	const memory = new ArrayMemory(
		new Array<number>(CACHE_SIZE * LINE_SIZE * 2).fill(0)
	);

	// Load the cache line to retrieve
	const cacheLine = new WriteThroughCacheLine(memory, 0, LINE_SIZE);
	cache.loadCacheLine(cacheLine);

	expect(cache.tryGetCacheLine(0)).toBe(cacheLine);
});

test("Try get unloaded cache line", () =>
{
	const LINE_SIZE = 4;
	const CACHE_SIZE = 1;
	const placementPolicy = new DirectMappedPlacementPolicy(
		LINE_SIZE,
		CACHE_SIZE
	);
	const evictionPolicy = new LeastRecentlyUsedEvictionPolicy(
		CACHE_SIZE
	);
	const cache = new ModularCache(
		LINE_SIZE,
		CACHE_SIZE,
		placementPolicy,
		evictionPolicy
	);
	const memory = new ArrayMemory(
		new Array<number>(CACHE_SIZE * LINE_SIZE * 2).fill(0)
	);

	// Load a cache line to be evicted
	cache.loadCacheLine(new WriteThroughCacheLine(memory, 0, LINE_SIZE));

	// Sanity check - this should be non-null now and then null later
	expect(cache.tryGetCacheLine(0)).not.toBe(null);

	// Evict the cache line
	cache.loadCacheLine(new WriteThroughCacheLine(memory, LINE_SIZE, LINE_SIZE));
	expect(cache.tryGetCacheLine(0)).toBe(null);
});
