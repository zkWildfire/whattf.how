import ICacheLine from "./CacheLine";
import IMemory from "../Memory/Memory";
import OnMemoryAccessedEventArgs from "../Events/OnMemoryAccessedEventArgs";
import { EventDispatcher, IEvent } from "ste-events";

/// Cache line that writes directly to main memory when written to.
export default class WriteThroughCacheLine implements ICacheLine
{
	/// Property backing the `OnCacheLineAccessed` event.
	private readonly _onCacheLineAccessed =
		new EventDispatcher<ICacheLine, OnMemoryAccessedEventArgs>();

	/// Memory instance backing the cache line.
	private readonly _memory: IMemory;

	/// Memory index that the cache line starts at.
	private readonly _startingIndex: number;

	/// Size of the cache line in number of elements.
	private readonly _size: number;

	/// Event raised when the cache line is read from or written to.
	get OnCacheLineAccessed(): IEvent<ICacheLine, OnMemoryAccessedEventArgs>
	{
		return this._onCacheLineAccessed.asEvent();
	}

	/// Gets the memory index of the first value in the cache line.
	get startIndex(): number
	{
		return this._startingIndex;
	}

	/// Gets the memory index of the past-the-end value in the cache line.
	get endIndex(): number
	{
		return this._startingIndex + this._size;
	}

	/// Gets the size in number of values of the cache line.
	get size(): number
	{
		return this._size;
	}

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

	/// Whether the cache line contains the memory address.
	public contains(index: number): boolean
	{
		return index >= this._startingIndex && index < this.endIndex;
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
		const currValue = this._memory.read(index);
		this._onCacheLineAccessed.dispatch(
			this,
			new OnMemoryAccessedEventArgs(
				index,
				true,
				currValue,
				currValue
			)
		);
		return this._memory.read(index);
	}

	/// Writes a value to the cache line.
	/// @param index Memory index of the value to write to the cache line.
	/// @param value Value to write to the cache line.
	/// @throws RangeError Thrown if the given index is not in the cache line.
	public write(index: number, value: number): void
	{
		this.checkIndex(index);
		const oldValue = this._memory.read(index);
		this._onCacheLineAccessed.dispatch(
			this,
			new OnMemoryAccessedEventArgs(
				index,
				true,
				value,
				oldValue
			)
		);
		this._memory.write(index, value);
	}

	/// Verifies that the index is in the cache line.
	/// @param index Memory index to check.
	/// @throws RangeError Thrown if the given index is not in the cache line.
	private checkIndex(index: number): void
	{
		if (!this.contains(index))
		{
			throw new RangeError(`Index ${index} is not in cache line ` +
				`[${this._startingIndex}, ${this.endIndex}).`
			);
		}
	}
}
