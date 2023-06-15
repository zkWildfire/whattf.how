import ArrayMemory from '../Memory/ArrayMemory';
import WriteThroughCacheLineAllocator from './WriteThroughCacheLineAllocator';

test("Create aligned cache line", () => {
	const VALUES = [1, 2, 3, 4];
	const INDEX = 2;
	const CACHE_LINE_SIZE = 2;
	const memory = new ArrayMemory(VALUES);

	const allocator = new WriteThroughCacheLineAllocator(memory, CACHE_LINE_SIZE);
	const cacheLine = allocator.allocate(INDEX);

	// Since the index is the same as the cache line size, the starting index
	//   of the returned cache line should be the same as the index
	expect(cacheLine.startIndex).toBe(INDEX);
	expect(cacheLine.endIndex).toBe(INDEX + CACHE_LINE_SIZE);
	expect(cacheLine.size).toBe(CACHE_LINE_SIZE);
});

test("Create unaligned cache line", () => {
	const VALUES = [1, 2, 3, 4];
	const INDEX = 1;
	const CACHE_LINE_SIZE = 2;
	const memory = new ArrayMemory(VALUES);

	const allocator = new WriteThroughCacheLineAllocator(memory, CACHE_LINE_SIZE);
	const cacheLine = allocator.allocate(INDEX);

	// Cache lines will be aligned based on the cache line size, so the starting
	//   index of the returned cache line should not be the same as the index
	expect(cacheLine.startIndex).toBe(0);
	expect(cacheLine.endIndex).toBe(CACHE_LINE_SIZE);
	expect(cacheLine.size).toBe(CACHE_LINE_SIZE);
});
