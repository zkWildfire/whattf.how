import WriteThroughCacheLine from "../CacheLines/WriteThroughCacheLine";
import ArrayMemory from "../Memory/ArrayMemory";
import DirectMappedPlacementPolicy from "./DirectMappedPlacementPolicy";

test("Place cache line with low starting index", () =>
{
	const CACHE_LINE_SIZE = 2;
	const CACHE_SIZE = 4;
	const memory = new ArrayMemory(
		new Array(CACHE_SIZE * CACHE_LINE_SIZE).fill(0)
	);
	const policy = new DirectMappedPlacementPolicy(CACHE_LINE_SIZE, CACHE_SIZE);

	// For cache lines whose memory is within [0, CACHE_SIZE * CACHE_LINE_SIZE],
	//   the starting index of the cache line should be the same as the index
	for (let i = 0; i < CACHE_SIZE; i++)
	{
		const cacheLine = new WriteThroughCacheLine(
			memory,
			i * CACHE_LINE_SIZE,
			CACHE_LINE_SIZE
		);
		const indices = policy.getIndices(cacheLine);

		expect(indices.length).toBe(1);
		expect(indices[0]).toBe(i);
	}
});

test("Place cache line with high starting index", () =>
{
	const CACHE_LINE_SIZE = 2;
	const CACHE_SIZE = 4;
	const memory = new ArrayMemory(
		new Array(CACHE_SIZE * CACHE_LINE_SIZE * 2).fill(0)
	);
	const policy = new DirectMappedPlacementPolicy(CACHE_LINE_SIZE, CACHE_SIZE);

	// The placement policy should handle mapping cache lines whose memory is
	//   outside of [0, CACHE_SIZE * CACHE_LINE_SIZE] into the cache
	const STARTING_OFFSET = CACHE_SIZE * CACHE_LINE_SIZE;
	for (let i = 0; i < CACHE_SIZE; i++)
	{
		const cacheLine = new WriteThroughCacheLine(
			memory,
			STARTING_OFFSET + i * CACHE_LINE_SIZE,
			CACHE_LINE_SIZE
		);
		const indices = policy.getIndices(cacheLine);

		expect(indices.length).toBe(1);
		expect(indices[0]).toBe(i);
	}
});
