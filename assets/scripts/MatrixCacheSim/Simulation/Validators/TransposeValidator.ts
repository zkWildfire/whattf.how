import IMemory from "../Memory/Memory";
import IMemoryValidator from "./MemoryValidator";

/// Validator for matrix transpose operations.
export default class TransposeValidator implements IMemoryValidator
{
	/// Size of the matrix's X dimension.
	private readonly _x: number;

	/// Size of the matrix's Y dimension.
	private readonly _y: number;

	/// Initializes the validator.
	/// @param x Size of the matrix's X dimension.
	/// @param y Size of the matrix's Y dimension.
	constructor(x: number, y: number)
	{
		this._x = x;
		this._y = y;
	}

	/// Initializes the memory to its initial state.
	/// @param memory Memory instance to initialize.
	public initializeMemory(memory: IMemory): void
	{
		for (let y = 0; y < this._y; y++)
		{
			for (let x = 0; x < this._x; x++)
			{
				memory.write(this.calculateMemoryIndex(x, y), x + y * this._x);
			}
		}
	}

	/// Checks if the simulator memory is in the expected final state.
	/// @returns An array of error messages describing any issues detected with
	///   the simulator memory, or an empty array if no issues were detected.
	public validateMemory(memory: IMemory): string[]
	{
		const errors: string[] = [];

		// Check each memory location and verify that the expected value is
		//   present
		for (let y = 0; y < this._y; y++)
		{
			for (let x = 0; x < this._x; x++)
			{
				const index = this.calculateMemoryIndex(x, y);
				// Since the matrix is expected to be transposed at this point,
				//   the X and Y dimensions are swapped when calculating the
				//   expected value
				const expectedValue = x * this._x + y;
				const actualValue = memory.read(index);

				if (expectedValue !== actualValue)
				{
					errors.push(
						`Expected memory[${index}] for location (${x}, ${y}) ` +
						`to be ${expectedValue}, but found ${actualValue}.`
					);
				}
			}
		}

		return errors;
	}

	/// Calculates the memory index of the matrix element at the given position.
	/// @param x X position of the element.
	/// @param y Y position of the element.
	/// @returns The memory index of the element at the given position.
	private calculateMemoryIndex(x: number, y: number): number
	{
		return y * this._x + x;
	}
}
