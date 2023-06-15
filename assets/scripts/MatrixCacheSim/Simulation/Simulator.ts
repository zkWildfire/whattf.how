import { IEvent } from "strongly-typed-events";
import OnCacheLineEvictedEventArgs from "./Events/OnCacheLineEvictedEventArgs";
import OnCacheLineLoadedEventArgs from "./Events/OnCacheLineLoadedEventArgs";
import OnMemoryAccessedEventArgs from "./Events/OnMemoryAccessedEventArgs";

/// Interface for classes that manage the simulation components for the demo.
export default interface ISimulator
{
	/// Event raised when a new cache line is loaded into the cache.
	get OnCacheLineLoaded(): IEvent<ISimulator, OnCacheLineLoadedEventArgs>;

	/// Event raised when a cache line is evicted from the cache.
	get OnCacheLineEvicted(): IEvent<ISimulator, OnCacheLineEvictedEventArgs>;

	/// Event raised when a memory location is accessed.
	/// This event will be raised *after* any cache events caused by the memory
	///   access have been raised.
	get OnMemoryAccessed(): IEvent<ISimulator, OnMemoryAccessedEventArgs>;

	/// Reads a value from memory.
	/// @param index Index of the value to read from memory.
	/// @throws RangeError Thrown if the given index is out of range.
	/// @returns The value at the given index.
	read(index: number): number;

	/// Writes a value to memory.
	/// @param index Index of the value to write to memory.
	/// @param value Value to write to memory.
	/// @throws RangeError Thrown if the given index is out of range.
	write(index: number, value: number): void;
}
