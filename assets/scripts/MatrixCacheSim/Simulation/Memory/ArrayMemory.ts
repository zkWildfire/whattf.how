import IMemory from "./Memory";

/// Memory implementation backed by an array.
export default class ArrayMemory implements IMemory
{
	/// Array backing the memory.
	private readonly _memory: number[];

	/// Constructs a new memory instance.
	/// @param data Array to use for backing the memory.
	public constructor(data: number[])
	{
		this._memory = data;
	}

	/// Reads a value from memory.
	/// @param index Index of the value to read from memory.
	/// @returns The value at the given index.
	/// @throws RangeError Thrown if the given index is outside of the memory
	///   block that was originally allocated to back the cache.
	public read(index: number): number
	{
		this.checkIndex(index);
		return this._memory[index];
	}

	/// Writes a value to memory.
	/// @param index Index of the value to write to memory.
	/// @param value Value to write to memory.
	/// @throws RangeError Thrown if the given index is outside of the memory
	///   block that was originally allocated to back the cache.
	public write(index: number, value: number): void
	{
		this.checkIndex(index);
		this._memory[index] = value;
	}

	/// Checks if the index is within the memory block.
	/// @param index Index to check.
	/// @throws RangeError Thrown if the given index is outside of the memory
	///   block that was originally allocated to back the cache.
	private checkIndex(index: number): void
	{
		if (index < 0 || index >= this._memory.length)
		{
			throw new RangeError("Index out of range.");
		}
	}
}
