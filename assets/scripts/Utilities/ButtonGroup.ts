import { IEvent } from "strongly-typed-events";

/// Interface for classes that manage a set of mutually exclusive buttons.
export default interface IButtonGroup<T>
{
	/// Data for the currently active button.
	/// If no button is active, this will be `null`.
	get ActiveData(): T | null;

	/// Event raised when one of the buttons is clicked.
	/// The sender will be the button group and the argument will be the data
	///   associated with the button.
	get OnButtonClicked(): IEvent<IButtonGroup<T>, T>;
}
