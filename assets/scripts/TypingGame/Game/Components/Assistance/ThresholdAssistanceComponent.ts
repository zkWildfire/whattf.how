import { ISignal, SignalDispatcher } from "strongly-typed-events";

/// Class that enables assistance when the character set is below a certain
///   Y-value.
export class ThresholdAssistanceComponent
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

	/// Threshold Y-value at which the input text should be displayed.
	private readonly _threshold: number;

	/// Current visibility of the input text.
	private _isInputTextVisible: boolean;

	/// Initializes a new instance of the class.
	/// @param threshold The threshold Y-value at which the input text should be
	///   displayed.
	constructor(threshold: number)
	{
		this._onShouldDisplayAssistance = new SignalDispatcher();
		this._onShouldHideAssistance = new SignalDispatcher();
		this._threshold = threshold;

		// Assume the input text is not visible at the start.
		this._isInputTextVisible = false;
	}

	/// Updates the component with the current position of the character set.
	/// @param position The current position of the character set.
	public Update(position: { x: number, y: number }): void
	{
		const newVisibility = position.y < this._threshold;
		if (newVisibility !== this._isInputTextVisible)
		{
			// If the visibility has changed, broadcast the appropriate event
			if (newVisibility)
			{
				this._onShouldDisplayAssistance.dispatch();
			}
			else
			{
				this._onShouldHideAssistance.dispatch();
			}

			this._isInputTextVisible = newVisibility;
		}
	}
}
