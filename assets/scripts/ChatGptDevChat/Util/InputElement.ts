/// Base class for wrappers that manage an input element.
export interface IInputElement
{
	/// Whether the current value of the input element is valid.
	get IsValid(): boolean;

	/// Validates the current value of the input element.
	/// If the input is valid, the method will clear any displayed error
	///   messages. If the input is invalid, the method will display an error
	///   message.
	/// @returns Whether the input is valid.
	Validate(): boolean;
}
