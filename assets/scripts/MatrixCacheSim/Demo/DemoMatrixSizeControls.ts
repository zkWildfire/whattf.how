import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";
import OnMatrixSizeChangedEventArgs from "./Events/OnMatrixSizeChangedEventArgs";
import IMatrixSizeControls from "./MatrixSizeControls";
import assert from "assert";

/// Class used to manage the UI controls that change the matrix size.
export default class DemoMatrixCacheSizeControls implements IMatrixSizeControls
{
	/// ID of the button element that sets the matrix size to 32x32.
	private readonly BUTTON_32X32_ID = "matrix-size-32x32";

	/// ID of the button element that sets the matrix size to 64x64.
	private readonly BUTTON_64X64_ID = "matrix-size-64x64";

	/// ID of the button element that sets the matrix size to 63x63.
	private readonly BUTTON_63X63_ID = "matrix-size-63x63";

	/// CSS to use for all buttons.
	private readonly BUTTON_CSS = "btn col-auto rounded-0";

	/// CSS to use only on the active button.
	private readonly ACTIVE_BUTTON_CSS = "btn-primary";

	/// CSS to use only on inactive buttons.
	private readonly INACTIVE_BUTTON_CSS = "btn-outline-primary";

	/// Mappings of each button to the matrix size it sets.
	private readonly _buttonToSize: Map<string, [number, number]> = new Map([
		[this.BUTTON_32X32_ID, [32, 32]],
		[this.BUTTON_64X64_ID, [64, 64]],
		[this.BUTTON_63X63_ID, [63, 63]]
	]);

	/// Field backing the `OnMatrixSizeChanged` event.
	private readonly _onMatrixSizeChanged =
		new SimpleEventDispatcher<OnMatrixSizeChangedEventArgs>();

	/// ID of the currently active button.
	private _activeButtonId: string = this.BUTTON_32X32_ID;

	/// Currently selected matrix size.
	private _matrixSize: [number, number] = [32, 32];

	/// Map of button IDs to their corresponding elements.
	private readonly _buttons: Map<string, HTMLButtonElement> = new Map();

	/// Event raised when the matrix size should change.
	get OnMatrixSizeChanged(): ISimpleEvent<OnMatrixSizeChangedEventArgs>
	{
		return this._onMatrixSizeChanged.asEvent();
	}

	/// Currently selected matrix size.
	/// This tuple consists of the matrix's x and y dimensions, respectively.
	get matrixSize(): [number, number]
	{
		return this._matrixSize;
	}

	/// Initializes the matrix size controls.
	constructor()
	{
		// Find each button element and add it to the map.
		for (const [buttonId, size] of this._buttonToSize)
		{
			const button = document.getElementById(buttonId) as HTMLButtonElement;
			assert(button != null, `Could not find button with ID '${buttonId}'.`);
			this._buttons.set(buttonId, button);

			// Add a click event listener to each button.
			button.addEventListener("click", () =>
			{
				this.onButtonClick(buttonId);
			});
		}

		// Update the button CSS using the initial state of this class
		this.updateButtonCss();
	}

	/// Callback invoked when a button is clicked.
	/// @param buttonId ID of the button that was clicked.
	private onButtonClick(buttonId: string): void
	{
		// Update the active button ID
		this._activeButtonId = buttonId;

		// Update the matrix size
		const matrixSize = this._buttonToSize.get(buttonId);
		assert(
			matrixSize != null,
			`Could not find matrix size for button ID '${buttonId}'.`
		);
		this._matrixSize = matrixSize;

		// Update each button's CSS
		this.updateButtonCss();
	}

	/// Updates all matrix size control elements' CSS.
	private updateButtonCss(): void
	{
		for (const [buttonId, button] of this._buttons)
		{
			if (buttonId === this._activeButtonId)
			{
				button.className =
					`${this.BUTTON_CSS} ${this.ACTIVE_BUTTON_CSS}`;
			}
			else
			{
				button.className =
					`${this.BUTTON_CSS} ${this.INACTIVE_BUTTON_CSS}`;
			}
		}
	}
}
