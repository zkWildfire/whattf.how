/// Interface for classes that represent blocks of main memory.
/// Implementations of this interface are used to back `ICache` instances since
///   `ICache` instances only keep track of memory loaded into cache lines. Any
///   memory not currently in the cache is tracked by instances of this
///   interface instead.
export default interface IMemory
{
	/// Reads a value from memory.
	/// @param index Index of the value to read from memory.
	/// @returns The value at the given index.
	/// @throws RangeError Thrown if the given index is outside of the memory
	///   block that was originally allocated to back the cache.
	read(index: number): number;

	/// Writes a value to memory.
	/// @param index Index of the value to write to memory.
	/// @param value Value to write to memory.
	/// @throws RangeError Thrown if the given index is outside of the memory
	///   block that was originally allocated to back the cache.
	write(index: number, value: number): void;
}
