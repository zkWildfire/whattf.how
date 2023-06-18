import UniformButtonGroup from "./UniformButtonGroup";

/// Builder class used to construct uniform button groups.
export default class UniformButtonGroupBuilder<T>
{
	/// CSS to use for all buttons.
	private _commonCss: string;

	/// CSS classes to use only on the active button.
	private _activeCss: string;

	/// CSS classes to use only on inactive buttons.
	private _inactiveCss: string;

	/// Buttons that should be managed by the group.
	private _buttons: Map<HTMLButtonElement, T> = new Map();

	/// Data for the active button.
	private _active: [HTMLButtonElement, T] | null = null;

	/// Initializes the builder.
	/// @param commonCss The CSS to use for all buttons.
	/// @param activeCss The CSS classes to use only on the active button. This
	///   will be combined with `commonCss` to form the full set of CSS classes
	///   to use on the active button.
	/// @param inactiveCss The CSS classes to use only on inactive buttons. This
	///   will be combined with `commonCss` to form the full set of CSS classes
	///   to use on inactive buttons.
	constructor(
		commonCss: string,
		activeCss: string,
		inactiveCss: string)
	{
		this._commonCss = commonCss;
		this._activeCss = activeCss;
		this._inactiveCss = inactiveCss;
	}

	/// Adds a button to the group.
	/// @param buttonId The ID of the button to add.
	/// @param data The data to associate with the button.
	/// @param setAsActive Whether the button should be set as the active
	///   button. If this method is called more than once with this parameter
	///   set to `true`, the last button that was added with this parameter set
	///   to `true` will be the active button.
	/// @throws Error If no button with the given ID exists.
	/// @returns This builder.
	public addButton(
		buttonId: string,
		data: T,
		setAsActive: boolean = false): UniformButtonGroupBuilder<T>
	{
		// Try and find the button
		const button = document.getElementById(buttonId) as HTMLButtonElement;
		if (!button)
		{
			throw new Error(`No button with ID '${buttonId}' exists.`);
		}

		// Add the button
		this._buttons.set(button, data);
		if (setAsActive)
		{
			this._active = [button, data];
		}
		return this;
	}

	/// Constructs a new uniform button group instance.
	/// @returns The constructed uniform button group instance.
	public construct(): UniformButtonGroup<T>
	{
		return new UniformButtonGroup<T>(
			this._buttons,
			this._commonCss,
			this._activeCss,
			this._inactiveCss
		);
	}
}
