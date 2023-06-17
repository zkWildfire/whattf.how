import OnMemoryAccessedEventArgs from "./OnMemoryAccessedEventArgs";

test("Properties match ctor args", () =>
{
	const index = 123;
	const isHit = true;
	const value = 456;
	const args = new OnMemoryAccessedEventArgs(index, isHit, value);
	expect(args.index).toBe(index);
	expect(args.isHit).toBe(isHit);
	expect(args.value).toBe(value);
});

test("Correct visitor method invoked", () =>
{
	const index = 123;
	const isHit = true;
	const value = 456;
	const args = new OnMemoryAccessedEventArgs(index, isHit, value);
	const visitor =
	{
		visitCacheLineLoadedEvent: jest.fn(),
		visitCacheLineEvictedEvent: jest.fn(),
		visitMemoryAccessedEvent: jest.fn()
	};

	args.accept(visitor);
	expect(visitor.visitMemoryAccessedEvent.mock.calls.length).toBe(1);
	expect(visitor.visitMemoryAccessedEvent.mock.calls[0][0]).toBe(index);
	expect(visitor.visitMemoryAccessedEvent.mock.calls[0][1]).toBe(isHit);
	expect(visitor.visitMemoryAccessedEvent.mock.calls[0][2]).toBe(value);

	expect(visitor.visitCacheLineLoadedEvent.mock.calls.length).toBe(0);
	expect(visitor.visitCacheLineEvictedEvent.mock.calls.length).toBe(0);
});
