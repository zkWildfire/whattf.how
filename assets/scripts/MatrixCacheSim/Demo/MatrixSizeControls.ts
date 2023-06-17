import { ISimpleEvent } from "strongly-typed-events";
import OnMatrixSizeChangedEventArgs from "./Events/OnMatrixSizeChangedEventArgs";

/// Interface for classes that manage the matrix size control elements.
export default interface IMatrixSizeControls
{
	/// Currently selected matrix size.
	/// This tuple consists of the matrix's x and y dimensions, respectively.
	get matrixSize(): [number, number];

	/// Event raised when the matrix size should change.
	get OnMatrixSizeChanged(): ISimpleEvent<OnMatrixSizeChangedEventArgs>;
}
