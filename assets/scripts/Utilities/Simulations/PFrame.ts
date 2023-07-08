import IFrame from "./Frame";

/// Defines the interface required to be implemented by any P-Frame type.
export default interface IPFrame extends IFrame
{
	/// Frame number that this P-Frame references.
	get ReferenceFrameNumber(): number;
}
