import ArrayMemory from "./ArrayMemory";

test("Read valid index", () =>
{
	const VALUES = [1, 2, 3, 4, 5];
	const memory = new ArrayMemory(VALUES);
	for (let i = 0; i < VALUES.length; ++i)
	{
		expect(memory.read(i)).toBe(VALUES[i]);
	}
});

test("Write to memory", () =>
{
	const VALUES = [1, 2, 3, 4, 5];
	const memory = new ArrayMemory(VALUES);

	const INDEX = 2;
	const VALUE = 42;
	memory.write(INDEX, VALUE);

	expect(memory.read(INDEX)).toBe(VALUE);
});

test("Read invalid index", () =>
{
	const VALUES = [1, 2, 3, 4, 5];
	const memory = new ArrayMemory(VALUES);

	const INDEX = 42;
	expect(() => memory.read(INDEX)).toThrow(RangeError);
});

test("Write invalid index", () =>
{
	const VALUES = [1, 2, 3, 4, 5];
	const memory = new ArrayMemory(VALUES);

	const INDEX = 42;
	const VALUE = 42;
	expect(() => memory.write(INDEX, VALUE)).toThrow(RangeError);
});
