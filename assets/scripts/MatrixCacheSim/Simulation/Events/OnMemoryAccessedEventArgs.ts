/// Event raised when a memory location is accessed.
export default interface OnMemoryAccessedEventArgs
{
	/// Index of the memory location that was accessed.
	index: number;

	/// Whether the memory access was a cache hit or miss.
	isHit: boolean;
}
