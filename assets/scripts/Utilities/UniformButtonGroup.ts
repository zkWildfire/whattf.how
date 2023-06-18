import { EventDispatcher, IEvent } from "strongly-typed-events";
import IButtonGroup from "./ButtonGroup";

/// Button group that uses the same styles for all buttons.
export default class UniformButtonGroup<T> implements IButtonGroup<T>
{
	/// Field backing the `OnButtonClicked` event.
	private _onButtonClicked: EventDispatcher<IButtonGroup<T>, T> =
		new EventDispatcher<IButtonGroup<T>, T>();

	/// Map of buttons that are managed by the group.
	/// Each button is mapped to the data associated with it.
	private _buttons: Map<HTMLButtonElement, T>;

	/// CSS to use for the active button.
	private _activeCss: string;

	/// CSS to use for inactive buttons.
	private _inactiveCss: string;

	/// Data for the active button.
	private _active: [HTMLButtonElement, T] | null = null;

	/// Data for the currently active button.
	/// If no button is active, this will be `null`.
	get ActiveData(): T | null
	{
		return this._active ? this._active[1] : null;
	}

	/// Event raised when one of the buttons is clicked.
	/// The sender will be the button group and the argument will be the data
	///   associated with the button.
	get OnButtonClicked(): IEvent<IButtonGroup<T>, T>
	{
		return this._onButtonClicked.asEvent();
	}

	/// Initializes the button group.
	/// @param buttons The buttons to manage. Each button must be associated
	///   with the data to be passed to the `OnButtonClicked` event when the
	///   button is clicked.
	/// @param commonCss The CSS to use for all buttons.
	/// @param activeCss The CSS classes to use only on the active button. This
	///   will be combined with `commonCss` to form the full set of CSS classes
	///   to use on the active button.
	/// @param inactiveCss The CSS classes to use only on inactive buttons.
	///   This will be combined with `commonCss` to form the full set of CSS
	///   classes to use on inactive buttons.
	/// @param activeButton The button that should be active initially. Must be
	///   one of the buttons in `buttons`. If `null`, no button will be active
	///   initially.
	constructor(
		buttons: Map<HTMLButtonElement, T>,
		commonCss: string,
		activeCss: string,
		inactiveCss: string,
		activeButton: HTMLButtonElement | null = null)
	{
		this._buttons = buttons;
		this._activeCss = `${commonCss} ${activeCss}`;
		this._inactiveCss = `${commonCss} ${inactiveCss}`;
		this._active = null;

		if (activeButton !== null)
		{
			const activeButtonData = buttons.get(activeButton);
			if (activeButtonData === undefined)
			{
				throw new Error(
					"The active button must be one of the buttons in `buttons`."
				);
			}

			this._active = [activeButton, activeButtonData];
		}

		// Bind to each button's events and configure the callback to provide
		//   the correct data to the `OnButtonClicked` event.
		for (const [button, data] of buttons)
		{
			button.addEventListener("click", () =>
			{
				this._active = [button, data];
				this._onButtonClicked.dispatch(this, data);
				this.updateButtons();
			});
		}

		// Update all buttons to their initial state
		this.updateButtons();
	}

	/// Updates the button group to reflect the current state.
	private updateButtons(): void
	{
		for (const [button, _] of this._buttons)
		{
			if (this._active == null)
			{
				// No button is active; therefore, this button must be an
				//   inactive button
				button.className = this._inactiveCss;
			}
			else if (this._active[0] === button)
			{
				// This button is active
				button.className = this._activeCss;
			}
			else
			{
				// This button is inactive
				button.className = this._inactiveCss;
			}
		}
	}
}
