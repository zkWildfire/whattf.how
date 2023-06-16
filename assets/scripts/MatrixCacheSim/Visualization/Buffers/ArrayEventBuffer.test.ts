import OnCacheLineEvictedEventArgs from "../../Simulation/Events/OnCacheLineEvictedEventArgs";
import OnCacheLineLoadedEventArgs from "../../Simulation/Events/OnCacheLineLoadedEventArgs";
import OnMemoryAccessedEventArgs from "../../Simulation/Events/OnMemoryAccessedEventArgs";
import ArrayEventBuffer from "./ArrayEventBuffer";

test("Length is 0 after initialization", () =>
{
	const buffer = new ArrayEventBuffer();
	expect(buffer.length).toBe(0);
});

test("Length is non-zero after adding cache line loaded events", () =>
{
	const COUNT = 3;
	const buffer = new ArrayEventBuffer();
	for (let i = 0; i < COUNT; ++i)
	{
		buffer.onCacheLineLoaded(new OnCacheLineLoadedEventArgs(i));
		expect(buffer.length).toBe(i + 1);
	}
});

test("Length is non-zero after adding cache line evicted events", () =>
{
	const COUNT = 3;
	const buffer = new ArrayEventBuffer();
	for (let i = 0; i < COUNT; ++i)
	{
		buffer.onCacheLineEvicted(new OnCacheLineEvictedEventArgs(i));
		expect(buffer.length).toBe(i + 1);
	}
});

test("Length is non-zero after adding memory accessed events", () =>
{
	const COUNT = 3;
	const buffer = new ArrayEventBuffer();
	for (let i = 0; i < COUNT; ++i)
	{
		buffer.onMemoryAccessed(new OnMemoryAccessedEventArgs(i, true));
		expect(buffer.length).toBe(i + 1);
	}
});

test("Get events", () =>
{
	const buffer = new ArrayEventBuffer();
	const cacheLineLoadedEvent = new OnCacheLineLoadedEventArgs(0);
	const cacheLineEvictedEvent = new OnCacheLineEvictedEventArgs(1);
	const memoryAccessedEvent = new OnMemoryAccessedEventArgs(2, false);

	buffer.onCacheLineLoaded(cacheLineLoadedEvent);
	buffer.onCacheLineEvicted(cacheLineEvictedEvent);
	buffer.onMemoryAccessed(memoryAccessedEvent);

	expect(buffer.getEvent(0)).toBe(cacheLineLoadedEvent);
	expect(buffer.getEvent(1)).toBe(cacheLineEvictedEvent);
	expect(buffer.getEvent(2)).toBe(memoryAccessedEvent);
});

test("Get event throws RangeError if index is negative", () =>
{
	const buffer = new ArrayEventBuffer();
	expect(() => buffer.getEvent(-1)).toThrow(RangeError);
});
