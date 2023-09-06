import { ISignal, SignalDispatcher } from "strongly-typed-events";

/// Class that never changes the visibility of the input text.
export class ConstAssistanceComponent
{
	/// Event broadcast when the input text should be displayed.
	get OnShouldDisplayAssistance(): ISignal
	{
		return this._onShouldDisplayAssistance.asEvent();
	}

	/// Event broadcast when the input text should be hidden.
	get OnShouldHideAssistance(): ISignal
	{
		return this._onShouldHideAssistance.asEvent();
	}

	/// Gets whether or not the input text should be visible.
	get IsInputTextVisible(): boolean
	{
		return this._isInputTextVisible;
	}

	/// Dispatcher for the `OnShouldDisplayAssistance` event.
	private readonly _onShouldDisplayAssistance: SignalDispatcher;

	/// Dispatcher for the `OnShouldHideAssistance` event.
	private readonly _onShouldHideAssistance: SignalDispatcher;

	/// Visibility to use for the input text.
	private readonly _isInputTextVisible: boolean;

	/// Initializes a new instance of the class.
	/// @param visibility Whether or not the input text should be visible.
	constructor(visibility: boolean)
	{
		this._onShouldDisplayAssistance = new SignalDispatcher();
		this._onShouldHideAssistance = new SignalDispatcher();
		this._isInputTextVisible = visibility;
	}

	/// Updates the component with the current position of the character set.
	/// @param position The current position of the character set.
	public Update(position: { x: number, y: number }): void
	{
		// Do nothing
	}
}
