import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";
import OnMatrixSizeChangedEventArgs from "./Events/OnMatrixSizeChangedEventArgs";
import IMatrixSizeControls from "./MatrixSizeControls";
import assert from "assert";

/// Class used to manage the UI controls that change the matrix size.
export default class DemoMatrixCacheSizeControls implements IMatrixSizeControls
{
	/// ID of the button element that sets the matrix size to 32x32.
	public static readonly BUTTON_32X32_ID = "matrix-size-32x32";

	/// ID of the button element that sets the matrix size to 64x64.
	public static readonly BUTTON_64X64_ID = "matrix-size-64x64";

	/// ID of the button element that sets the matrix size to 63x63.
	public static readonly BUTTON_63X63_ID = "matrix-size-63x63";

	/// List of all button IDs that this class manages.
	public static readonly BUTTON_IDS = [
		DemoMatrixCacheSizeControls.BUTTON_32X32_ID,
		DemoMatrixCacheSizeControls.BUTTON_64X64_ID,
		DemoMatrixCacheSizeControls.BUTTON_63X63_ID
	]

	/// CSS to use for all buttons.
	public static readonly BUTTON_CSS = "btn col-2 rounded-0";

	/// CSS to use only on the active button.
	public static readonly ACTIVE_BUTTON_CSS =
		`${this.BUTTON_CSS} btn-primary`;

	/// CSS to use only on inactive buttons.
	public static readonly INACTIVE_BUTTON_CSS =
		`${this.BUTTON_CSS} btn-outline-primary`;

	/// Mappings of each button to the matrix size it sets.
	private readonly _buttonToSize: Map<string, [number, number]> = new Map([
		[DemoMatrixCacheSizeControls.BUTTON_32X32_ID, [32, 32]],
		[DemoMatrixCacheSizeControls.BUTTON_64X64_ID, [64, 64]],
		[DemoMatrixCacheSizeControls.BUTTON_63X63_ID, [63, 63]]
	]);

	/// Field backing the `OnMatrixSizeChanged` event.
	private readonly _onMatrixSizeChanged =
		new SimpleEventDispatcher<OnMatrixSizeChangedEventArgs>();

	/// ID of the currently active button.
	private _activeButtonId: string =
		DemoMatrixCacheSizeControls.BUTTON_32X32_ID;

	/// Currently selected matrix size.
	private _matrixSize: [number, number] = [32, 32];

	/// Map of button IDs to their corresponding elements.
	private readonly _buttonCallbacks: Map<string, (css: string) => void>;

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
	/// @param updateButtonCssCallbacks Callbacks to invoke when a button's CSS
	///   should be updated. This map must be indexed by each button ID. Each
	///   callback will be passed the CSS to use for the corresponding button.
	///   An entry must exist in this map for each button ID defined in this
	///   class.
	constructor(updateButtonCssCallbacks: Map<string, (css: string) => void>)
	{
		// Make sure each of the buttons has a corresponding callback
		for (const buttonId of DemoMatrixCacheSizeControls.BUTTON_IDS)
		{
			assert(
				updateButtonCssCallbacks.has(buttonId),
				`No callback found for button ID '${buttonId}'.`
			);
		}

		this._buttonCallbacks = updateButtonCssCallbacks;
		this.updateButtonCss();
	}

	/// Callback invoked when a button is clicked.
	/// @param buttonId ID of the button that was clicked.
	public onButtonClick(buttonId: string): void
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
	public updateButtonCss(): void
	{
		for (const [buttonId, setClasses] of this._buttonCallbacks)
		{
			if (buttonId === this._activeButtonId)
			{
				setClasses(DemoMatrixCacheSizeControls.ACTIVE_BUTTON_CSS);
			}
			else
			{
				setClasses(DemoMatrixCacheSizeControls.INACTIVE_BUTTON_CSS);
			}
		}
	}
}
