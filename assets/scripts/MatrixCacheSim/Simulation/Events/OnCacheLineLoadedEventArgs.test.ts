import OnCacheLineLoadedEventArgs from "./OnCacheLineLoadedEventArgs";

test("Properties match ctor args", () =>
{
	const index = 123;
	const args = new OnCacheLineLoadedEventArgs(index);
	expect(args.index).toBe(index);
});

test("Correct visitor method invoked", () =>
{
	const index = 123;
	const args = new OnCacheLineLoadedEventArgs(index);
	const visitor =
	{
		visitCacheLineLoadedEvent: jest.fn(),
		visitCacheLineEvictedEvent: jest.fn(),
		visitMemoryAccessedEvent: jest.fn()
	};

	args.accept(visitor);
	expect(visitor.visitCacheLineLoadedEvent.mock.calls.length).toBe(1);
	expect(visitor.visitCacheLineLoadedEvent.mock.calls[0][0]).toBe(index);

	expect(visitor.visitCacheLineEvictedEvent.mock.calls.length).toBe(0);
	expect(visitor.visitMemoryAccessedEvent.mock.calls.length).toBe(0);
});
