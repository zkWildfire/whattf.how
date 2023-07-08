import ArrayMemory from "../Memory/ArrayMemory";
import WriteThroughCacheLine from "./WriteThroughCacheLine";

test("PropertiesMatchCtorArgs", () =>
{
	const INDEX = 1;
	const SIZE = 3;

	const memory = new ArrayMemory([1, 2, 3, 4, 5]);
	const cacheLine = new WriteThroughCacheLine(memory, INDEX, SIZE);

	expect(cacheLine.startIndex).toBe(INDEX);
	expect(cacheLine.endIndex).toBe(INDEX + SIZE);
	expect(cacheLine.size).toBe(SIZE);
})

test("Contains", () =>
{
	const memory = new ArrayMemory([1, 2, 3, 4, 5]);
	const cacheLine = new WriteThroughCacheLine(memory, 1, 3);

	expect(cacheLine.contains(0)).toBe(false);
	expect(cacheLine.contains(1)).toBe(true);
	expect(cacheLine.contains(2)).toBe(true);
	expect(cacheLine.contains(3)).toBe(true);
	expect(cacheLine.contains(4)).toBe(false);
});

test("Read value in cache line", () =>
{
	const VALUES = [1, 2, 3, 4, 5];
	const memory = new ArrayMemory(VALUES);
	const cacheLine = new WriteThroughCacheLine(memory, 1, 3);

	const INDEX = 2;
	expect(cacheLine.read(INDEX)).toBe(VALUES[INDEX]);
});

test("Read value not in cache line", () =>
{
	const VALUES = [1, 2, 3, 4, 5];
	const memory = new ArrayMemory(VALUES);
	const cacheLine = new WriteThroughCacheLine(memory, 1, 3);

	const INDEX = 0;
	expect(() => cacheLine.read(INDEX)).toThrow(RangeError);
});

test("Write value in cache line", () =>
{
	const VALUES = [1, 2, 3, 4, 5];
	const memory = new ArrayMemory(VALUES);
	const cacheLine = new WriteThroughCacheLine(memory, 1, 3);

	const INDEX = 2;
	const VALUE = 42;
	cacheLine.write(INDEX, VALUE);
	cacheLine.flush();

	expect(memory.read(INDEX)).toBe(VALUE);
});

test("Write value not in cache line", () =>
{
	const VALUES = [1, 2, 3, 4, 5];
	const memory = new ArrayMemory(VALUES);
	const cacheLine = new WriteThroughCacheLine(memory, 1, 3);

	const INDEX = 0;
	const VALUE = 42;
	expect(() => cacheLine.write(INDEX, VALUE)).toThrow(RangeError);
});

test("OnCacheLineAccessed event raised when reading value in cache line", () =>
{
	const VALUES = [1, 2, 3, 4, 5];
	const memory = new ArrayMemory(VALUES);
	const cacheLine = new WriteThroughCacheLine(memory, 1, 3);

	const INDEX = 2;

	let eventRaised = false;
	cacheLine.OnCacheLineAccessed.subscribe((sender, args) => {
		expect(sender).toBe(cacheLine);
		expect(args.index).toBe(INDEX);
		expect(args.newValue).toBe(VALUES[INDEX]);
		expect(args.oldValue).toBe(VALUES[INDEX]);
		eventRaised = true;
	});

	cacheLine.read(INDEX);
	expect(eventRaised).toBe(true);
});

test("OnCacheLineAccessed event raised when writing value in cache line", () =>
{
	const VALUES = [1, 2, 3, 4, 5];
	const memory = new ArrayMemory(VALUES);
	const cacheLine = new WriteThroughCacheLine(memory, 1, 3);

	const INDEX = 2;
	const NEW_VALUE = 42;
	const OLD_VALUE = VALUES[INDEX];

	let eventRaised = false;
	cacheLine.OnCacheLineAccessed.subscribe((sender, args) => {
		expect(sender).toBe(cacheLine);
		expect(args.index).toBe(INDEX);
		expect(args.newValue).toBe(NEW_VALUE);
		expect(args.oldValue).toBe(OLD_VALUE);
		eventRaised = true;
	});

	cacheLine.write(INDEX, NEW_VALUE);
	expect(eventRaised).toBe(true);
});
