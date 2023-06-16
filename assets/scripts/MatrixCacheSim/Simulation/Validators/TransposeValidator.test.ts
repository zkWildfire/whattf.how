import ArrayMemory from "../Memory/ArrayMemory";
import TransposeValidator from "./TransposeValidator";

test("Initialize memory generates expected pattern", () =>
{
	const X = 2;
	const Y = 2;
	const memory = new ArrayMemory(new Array<number>(X * Y).fill(0));
	const validator = new TransposeValidator(X, Y);

	validator.initializeMemory(memory);

	// The validator should have generated a 2x2 matrix with the following
	//   values:
	// ---------
	// | 0 | 1 |
	// ---------
	// | 2 | 3 |
	// ---------
	expect(memory.read(0)).toBe(0);
	expect(memory.read(1)).toBe(1);
	expect(memory.read(2)).toBe(2);
	expect(memory.read(3)).toBe(3);
});

test("Validate returns errors for initial matrix", () =>
{
	const X = 2;
	const Y = 2;
	const memory = new ArrayMemory(new Array<number>(X * Y).fill(0));
	const validator = new TransposeValidator(X, Y);

	validator.initializeMemory(memory);

	// The initial matrix should not be a valid solution
	expect(validator.validateMemory(memory).length).toBeGreaterThan(0);
});

test("Validate returns no errors for transposed matrix", () =>
{
	const X = 2;
	const Y = 2;
	const memory = new ArrayMemory(new Array<number>(X * Y).fill(0));
	const validator = new TransposeValidator(X, Y);

	validator.initializeMemory(memory);

	// Transpose the matrix
	memory.write(1, 2);
	memory.write(2, 1);

	// The transposed matrix should be a valid solution
	expect(validator.validateMemory(memory).length).toBe(0);
});
