import OnMemoryAccessedEventArgs from "./OnMemoryAccessedEventArgs";

test("Properties match ctor args", () =>
{
	const index = 123;
	const isHit = true;
	const newValue = 456;
	const oldValue = 789;
	const args = new OnMemoryAccessedEventArgs(index, isHit, newValue, oldValue);
	expect(args.index).toBe(index);
	expect(args.isHit).toBe(isHit);
	expect(args.newValue).toBe(newValue);
	expect(args.oldValue).toBe(oldValue);
});

test("Correct visitor method invoked", () =>
{
	const index = 123;
	const isHit = true;
	const newValue = 456;
	const oldValue = 789;
	const args = new OnMemoryAccessedEventArgs(index, isHit, newValue, oldValue);
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
	expect(visitor.visitMemoryAccessedEvent.mock.calls[0][2]).toBe(newValue);
	expect(visitor.visitMemoryAccessedEvent.mock.calls[0][3]).toBe(oldValue);

	expect(visitor.visitCacheLineLoadedEvent.mock.calls.length).toBe(0);
	expect(visitor.visitCacheLineEvictedEvent.mock.calls.length).toBe(0);
});
