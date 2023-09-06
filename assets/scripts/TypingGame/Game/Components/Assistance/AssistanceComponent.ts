import { ISignal } from "strongly-typed-events";

/// Component that keeps track of whether or not the input text should be
///   visible.
export interface IAssistanceComponent
{
	/// Event broadcast when the input text should be displayed.
	get OnShouldDisplayAssistance(): ISignal;

	/// Event broadcast when the input text should be hidden.
	get OnShouldHideAssistance(): ISignal;

	/// Gets whether or not the input text should be visible.
	get IsInputTextVisible(): boolean;

	/// Updates the component with the current position of the character set.
	/// @param position The current position of the character set.
	Update(position: { x: number, y: number }): void;
}
