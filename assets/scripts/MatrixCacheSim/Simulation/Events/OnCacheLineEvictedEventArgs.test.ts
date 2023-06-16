import OnCacheLineEvictedEventArgs from "./OnCacheLineEvictedEventArgs";

test("Properties match ctor args", () =>
{
	const index = 123;
	const args = new OnCacheLineEvictedEventArgs(index);
	expect(args.index).toBe(index);
});

test("Correct visitor method invoked", () =>
{
	const index = 123;
	const args = new OnCacheLineEvictedEventArgs(index);
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
