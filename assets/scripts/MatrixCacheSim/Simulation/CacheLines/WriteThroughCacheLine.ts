import ICacheLine from "./CacheLine";
import IMemory from "../Memory";

/// Cache line that writes directly to main memory when written to.
export default class WriteThroughCacheLine implements ICacheLine
{
	/// Memory instance backing the cache line.
	private readonly _memory: IMemory;

	/// Memory index that the cache line starts at.
	private readonly _startingIndex: number;

	/// Size of the cache line in number of elements.
	private readonly _size: number;

	/// Constructs a new cache line.
	/// @param memory Memory instance to use for backing the cache line.
	/// @param index Index within the memory where the cache line begins.
	/// @param size Size of the cache line in bytes.
	public constructor(memory: IMemory, index: number, size: number)
	{
		this._memory = memory;
		this._startingIndex = index;
		this._size = size;
	}

	/// Flushes the cache line's values to main memory.
	public flush(): void
	{
		// Do nothing; a write-through cache line always writes to main memory.
	}

	/// Reads a value from the cache line.
	/// @param index Memory index of the value to read.
	/// @throws RangeError Thrown if the given index is not in the cache line.
	/// @returns The value at the given memory index.
	public read(index: number): number
	{
		this.checkIndex(index);
		return this._memory.read(index);
	}

	/// Writes a value to the cache line.
	/// @param index Memory index of the value to write to the cache line.
	/// @param value Value to write to the cache line.
	/// @throws RangeError Thrown if the given index is not in the cache line.
	public write(index: number, value: number): void
	{
		this.checkIndex(index);
		this._memory.write(index, value);
	}

	/// Verifies that the index is in the cache line.
	/// @param index Memory index to check.
	/// @throws RangeError Thrown if the given index is not in the cache line.
	private checkIndex(index: number): void
	{
		const endIndex = this._startingIndex + this._size;
		if (index < this._startingIndex || index >= endIndex)
		{
			throw new RangeError(`Index ${index} is not in cache line ` +
				`[${this._startingIndex}, ${endIndex}).`
			);
		}
	}
}
