import { cache } from "webpack";
import WriteThroughCacheLine from "../CacheLines/WriteThroughCacheLine";
import ArrayMemory from "../Memory/ArrayMemory";
import DirectMappedPlacementPolicy from "./DirectMappedPlacementPolicy";
import FullyAssociativePlacementPolicy from "./FullyAssociativePlacementPolicy";
import NWayAssociativePlacementPolicy from "./NWayAssociativePlacementPolicy";

test("1-way associative placement", () =>
{
	// With the cache configured to be 1-way associative, the N-way associative
	//   placement policy should behave identically to the fully associative
	//   placement policy
	const CACHE_SIZE = 4;
	const LINE_SIZE = 4;
	const ASSOCIATIVITY = 1;
	const nWayPolicy = new NWayAssociativePlacementPolicy(
		LINE_SIZE,
		CACHE_SIZE,
		ASSOCIATIVITY
	);
	const fullyAssociativePolicy = new FullyAssociativePlacementPolicy(
		CACHE_SIZE
	);
	const memory = new ArrayMemory(new Array(CACHE_SIZE).fill(0));

	for (let i = 0; i < CACHE_SIZE; i++)
	{
		const cacheLine = new WriteThroughCacheLine(
			memory,
			i * LINE_SIZE,
			LINE_SIZE
		);
		expect(nWayPolicy.getIndices(cacheLine)).toEqual(
			fullyAssociativePolicy.getIndices(cacheLine)
		);
	}
});

test("Direct mapped placement", () =>
{
	// With the N-way associative placement policy configured with the same
	//   associativity as the cache size, it should behave identically to the
	//   direct mapped placement policy
	const CACHE_SIZE = 4;
	const LINE_SIZE = 4;
	const ASSOCIATIVITY = CACHE_SIZE;
	const nWayPolicy = new NWayAssociativePlacementPolicy(
		LINE_SIZE,
		CACHE_SIZE,
		ASSOCIATIVITY
	);
	const directMappedPolicy = new DirectMappedPlacementPolicy(
		LINE_SIZE,
		CACHE_SIZE
	);
	const memory = new ArrayMemory(new Array(CACHE_SIZE).fill(0));

	// Iterate over the cache in reverse order
	// This is done to ensure that the test can't have a false positive if the
	//   n-way associative placement policy fills cache lines sequentially
	for (let i = CACHE_SIZE - 1; i >= 0; i--)
	{
		const cacheLine = new WriteThroughCacheLine(
			memory,
			i * LINE_SIZE,
			LINE_SIZE
		);
		expect(nWayPolicy.getIndices(cacheLine)).toEqual(
			directMappedPolicy.getIndices(cacheLine)
		);
	}
});

test("2-way associative placement", () =>
{
	const CACHE_SIZE = 4;
	const LINE_SIZE = 4;
	const ASSOCIATIVITY = 2;
	const nWayPolicy = new NWayAssociativePlacementPolicy(
		LINE_SIZE,
		CACHE_SIZE,
		ASSOCIATIVITY
	);

	// With the cache configured to be 2 way associative with a cache size of
	//   4, these two cache lines should map to the same set of indices within
	//   the cache
	const memory = new ArrayMemory(new Array(CACHE_SIZE).fill(0));
	const cacheLine1 = new WriteThroughCacheLine(
		memory,
		0,
		LINE_SIZE
	);
	const cacheLine2 = new WriteThroughCacheLine(
		memory,
		LINE_SIZE * 2,
		LINE_SIZE
	);

	expect(nWayPolicy.getIndices(cacheLine1)).toEqual(
		nWayPolicy.getIndices(cacheLine2)
	);
});

test("Ctor throws if cache size is not a multiple of associativity", () =>
{
	expect(() => new NWayAssociativePlacementPolicy(4, 3, 2)).toThrow(Error);
});
