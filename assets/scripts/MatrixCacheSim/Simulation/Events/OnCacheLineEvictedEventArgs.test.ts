import OnCacheLineEvictedEventArgs from "./OnCacheLineEvictedEventArgs";

test("Properties match ctor args", () =>
{
	const CACHE_INDEX = 123;
	const MEMORY_INDEX = 456;
	const SIZE = 789;
	const args = new OnCacheLineEvictedEventArgs(
		CACHE_INDEX,
		MEMORY_INDEX,
		SIZE
	);

	expect(args.cacheIndex).toBe(CACHE_INDEX);
	expect(args.memoryIndex).toBe(MEMORY_INDEX);
	expect(args.size).toBe(SIZE);
});

test("Correct visitor method invoked", () =>
{
	const index = 123;
	const args = new OnCacheLineEvictedEventArgs(index, 0, 0);
	const visitor =
	{
		visitCacheLineLoadedEvent: jest.fn(),
		visitCacheLineEvictedEvent: jest.fn(),
		visitMemoryAccessedEvent: jest.fn()
	};

	args.accept(visitor);
	expect(visitor.visitCacheLineEvictedEvent.mock.calls.length).toBe(1);
	expect(visitor.visitCacheLineEvictedEvent.mock.calls[0][0]).toBe(index);

	expect(visitor.visitCacheLineLoadedEvent.mock.calls.length).toBe(0);
	expect(visitor.visitMemoryAccessedEvent.mock.calls.length).toBe(0);
});
