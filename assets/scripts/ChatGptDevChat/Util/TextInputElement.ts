import { IInputElement } from "./InputElement";

/// Helper class for managing a text input element.
export abstract class ITextInputElement implements IInputElement
{
	/// The current value of the input element.
	get Value(): string
	{
		return this._inputElement.value;
	}

	/// Sets the current value of the input element.
	set Value(value: string)
	{
		this._inputElement.value = value;
	}

	/// Whether the current value of the input element is valid.
	get IsValid(): boolean
	{
		return this.Validate() === null;
	}

	/// Input element to manage.
	private readonly _inputElement: HTMLInputElement;

	/// Error element to display error messages in.
	private readonly _errorElement: HTMLElement | null;

	/// Initializes the class.
	constructor(inputElement: HTMLInputElement, errorElement: HTMLElement | null)
	{
		this._inputElement = inputElement;
		this._errorElement = errorElement;
	}

	/// Validates the current value of the input element.
	/// If the input is valid, the method will clear any displayed error
	///   messages. If the input is invalid, the method will display an error
	///   message.
	/// @returns Whether the input is valid.
	public Validate(): boolean
	{
		const errorMessage = this.ValidateInput();
		this.SetErrorMessage(errorMessage);
		return !errorMessage;
	}

	/// Validates the current value of the input element.
	/// @returns If the input is valid, the method will return `null`. If the
	///   input is invalid, the method will return an error message.
	protected abstract ValidateInput(): string | null;

	/// Sets the error message to display.
	/// @param message The error message to display, or `null` to clear the
	///   error message.
	private SetErrorMessage(message: string | null): void
	{
		// If no error element is set, do nothing
		if (!this._errorElement)
		{
			return;
		}

		// Figure out which class is being added and which is being removed
		const validClass = "is-valid";
		const invalidClass = "is-invalid";
		const addClass = message ? invalidClass : validClass;
		const removeClass = message ? validClass : invalidClass;

		// Update the error message
		this._errorElement.innerText = message ?? "";

		// Update the input element's classes
		this._inputElement.classList.remove(removeClass);
		this._inputElement.classList.add(addClass);
	}
}
