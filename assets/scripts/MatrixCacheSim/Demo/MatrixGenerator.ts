/// Interface for classes that generate the initial DOM elements for the matrix.
/// Matrix generator implementations are responsible for generating the initial
///   DOM elements that make up the matrix visualization.
export default interface IMatrixGenerator
{
	/// Called to generate the DOM elements for the matrix.
	/// This should clear existing elements if any exist and reset the matrix
	///   to its initial state.
	/// @param x Number of columns in the matrix.
	/// @param y Number of rows in the matrix.
	generateMatrix(x: number, y: number): void;
}
