/// Class that defines the interface used by matrix transpose algorithms.
export default interface IMatrix
{
	/// Size of the matrix's X dimension.
	get X(): number;

	/// Size of the matrix's Y dimension.
	get Y(): number;

	/// Swaps the values at the two locations.
	/// @param x1 X coordinate of the first location.
	/// @param y1 Y coordinate of the first location.
	/// @param x2 X coordinate of the second location.
	/// @param y2 Y coordinate of the second location.
	swap(x1: number, y1: number, x2: number, y2: number): void
}
