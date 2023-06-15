import ArrayMemory from "./ArrayMemory";

test("Read valid index", () => {
	const VALUES = [1, 2, 3, 4, 5];
	const memory = new ArrayMemory(VALUES);
	for (let i = 0; i < VALUES.length; ++i)
	{
		expect(memory.read(i)).toBe(VALUES[i]);
	}
});
