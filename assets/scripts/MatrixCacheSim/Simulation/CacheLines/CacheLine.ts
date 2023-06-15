/// Interface used to represent a single processor cache line.
export default interface ICacheLine
{
	/// Gets the memory index of the first value in the cache line.
	get startIndex(): number;

	/// Gets the memory index of the past-the-end value in the cache line.
	get endIndex(): number;

	/// Gets the size in number of values of the cache line.
	get size(): number;

	/// Flushes the cache line's values to main memory.
	flush(): void;

	/// Reads a value from the cache line.
	/// @param index Memory index of the value to read.
	/// @throws RangeError Thrown if the given index is not in the cache line.
	/// @returns The value at the given memory index.
	read(index: number): number;

	/// Writes a value to the cache line.
	/// @param index Memory index of the value to write to the cache line.
	/// @param value Value to write to the cache line.
	/// @throws RangeError Thrown if the given index is not in the cache line.
	write(index: number, value: number): void;
}
