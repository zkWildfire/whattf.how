import IMatrixGenerator from "./MatrixGenerator";

/// Matrix generator implementation used by the demo.
export default class DemoMatrixGenerator implements IMatrixGenerator
{
	/// Function that clears the matrix by removing all existing elements.
	private readonly _clearMatrix: () => void;

	/// Function that adds a new row to the matrix.
	private readonly _addMatrixRow: (y: number) => HTMLElement;

	/// Function that adds a new cell to the matrix.
	private readonly _addMatrixCell:
		(row: HTMLElement, x: number, y: number) => HTMLElement;

	/// CSS class to apply to each row element.
	private readonly _rowCss: string;

	/// CSS class to apply to each cell element.
	private readonly _cellCss: string;

	/// Initializes the generator.
	/// @param clearMatrix Function that clears the matrix by removing all
	///   existing elements.
	/// @param addMatrixRow Function that adds a new row to the matrix. This
	///   callback will be passed the row index and should return the row
	///   element that was created.
	/// @param addMatrixCell Function that adds a new cell to the matrix.
	///   This callback will be passed the row element to add the cell element
	///   to, the column index, and the row index. The callback should return
	///   the cell element that was created.
	/// @param rowCss CSS class to apply to each row element.
	/// @param cellCss CSS class to apply to each cell element.
	constructor(
		clearMatrix: () => void,
		addMatrixRow: (y: number) => HTMLElement,
		addMatrixCell: (row: HTMLElement, x: number, y: number) => HTMLElement,
		rowCss: string,
		cellCss: string)
	{
		this._clearMatrix = clearMatrix;
		this._addMatrixRow = addMatrixRow;
		this._addMatrixCell = addMatrixCell;
		this._rowCss = rowCss;
		this._cellCss = cellCss;
	}

	/// Called to generate the DOM elements for the matrix.
	/// This should clear existing elements if any exist and reset the matrix
	///   to its initial state.
	/// @param x Number of columns in the matrix.
	/// @param y Number of rows in the matrix.
	public generateMatrix(x: number, y: number): void
	{
		this._clearMatrix();

		// Calculate the width of each cell
		const cellWidth = 100 / x;

		// Unicode character for a non-breaking space
		const nonBreakingSpace = "\u00A0";

		// Generate the matrix and configure each generated element
		for (let row = 0; row < y; ++row)
		{
			const rowElement = this._addMatrixRow(row);
			rowElement.className = this._rowCss;

			for (let column = 0; column < x; ++column)
			{
				const cellElement = this._addMatrixCell(
					rowElement,
					column,
					row
				);
				cellElement.className = this._cellCss;
			}
		}
	}
}
