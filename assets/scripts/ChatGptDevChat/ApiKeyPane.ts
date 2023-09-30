import { IApiKeyProvider } from "./Auth/ApiKeyProvider";
import { IPageElementLocator } from "./Util/PageElementLocator";
import { ITextInputElement } from "./Util/TextInputElement";

/// Initializes all generic navigation elements for the dev chat interface.
/// @param apiKeyProvider The provider used to manage the API key.
export const BindApiPaneEventHandlers = (apiKeyProvider: IApiKeyProvider) =>
{
	// Find key UI elements
	const pageElements = new ApiKeyPaneElements();

	// Bind to service events
	apiKeyProvider.OnApiKeyChanged.subscribe(() =>
		{
			UpdateApiKeyLabel(pageElements, apiKeyProvider)
		}
	);

	// Bind to UI events
	pageElements.SaveApiKeyButton.addEventListener("click", () =>
	{
		OnSaveApiKeyClicked(pageElements, apiKeyProvider)
	});
	pageElements.ClearApiKeyButton.addEventListener("click", () =>
	{
		OnClearApiKeyClicked(apiKeyProvider)
	});

	// Also update the API key label on page load
	UpdateApiKeyLabel(pageElements, apiKeyProvider);
}

/// Helper class for locating all elements on the API key pane.
class ApiKeyPaneElements extends IPageElementLocator
{
	/// Wrapper for the API key input element.
	get ApiKeyInput(): ApiKeyInput
	{
		return this._apiKeyInput;
	}

	/// Checkbox that determines whether to save the API key to local storage
	get ApiKeySaveCheckbox(): HTMLInputElement
	{
		return this.GetElementById<HTMLInputElement>(
			ApiKeyPaneElements.ID_API_KEY_SAVE_CHECKBOX
		);
	}

	/// Button for saving an API key to local storage
	get SaveApiKeyButton(): HTMLButtonElement
	{
		return this.GetElementById<HTMLButtonElement>(
			ApiKeyPaneElements.ID_SAVE_API_KEY_BUTTON
		);
	}

	/// Button for clearing the current API key
	get ClearApiKeyButton(): HTMLButtonElement
	{
		return this.GetElementById<HTMLButtonElement>(
			ApiKeyPaneElements.ID_CLEAR_API_KEY_BUTTON
		);
	}

	/// Element that displays the UI-safe version of the current API key
	get ApiKeyLabel(): HTMLElement
	{
		return this.GetElementById<HTMLElement>(
			ApiKeyPaneElements.ID_API_KEY_LABEL
		);
	}

	/// ID of the input element for entering an API key
	private static readonly ID_API_KEY_INPUT = "api-key-input";

	/// ID of the checkbox that determines whether to save the API key to local storage
	private static readonly ID_API_KEY_SAVE_CHECKBOX = "api-key-store";

	/// ID of the "Save" button for saving an API key to local storage
	private static readonly ID_SAVE_API_KEY_BUTTON = "api-key-save";

	/// ID of the "Clear" button for clearing the current API key
	private static readonly ID_CLEAR_API_KEY_BUTTON = "api-key-clear";

	/// ID of the element that displays the UI-safe version of the current API key
	private static readonly ID_API_KEY_LABEL = "api-key-label";

	/// ID of the element that displays API key validation error messages
	private static readonly ID_API_KEY_ERROR_LABEL = "api-key-error-label";

	/// Wrapper for the API key input element.
	private readonly _apiKeyInput: ApiKeyInput;

	/// Initializes the class.
	constructor()
	{
		super([
			ApiKeyPaneElements.ID_API_KEY_INPUT,
			ApiKeyPaneElements.ID_API_KEY_SAVE_CHECKBOX,
			ApiKeyPaneElements.ID_SAVE_API_KEY_BUTTON,
			ApiKeyPaneElements.ID_CLEAR_API_KEY_BUTTON,
			ApiKeyPaneElements.ID_API_KEY_LABEL,
			ApiKeyPaneElements.ID_API_KEY_ERROR_LABEL
		]);

		// Create the API key input wrapper
		this._apiKeyInput = new ApiKeyInput(
			this.GetElementById<HTMLInputElement>(
				ApiKeyPaneElements.ID_API_KEY_INPUT
			),
			this.GetElementById<HTMLElement>(
				ApiKeyPaneElements.ID_API_KEY_ERROR_LABEL
			)
		);
	}
}

/// Class for managing the API key input element.
class ApiKeyInput extends ITextInputElement
{
	/// Validates the current value of the input element.
	/// @returns If the input is valid, the method will return `null`.
	///   If the input is invalid, the method will return an error message.
	protected ValidateInput(): string | null
	{
		const value = this.Value;
		if (!value || /^\s*$/.test(value))
		{
			return "API key cannot be empty.";
		}

		if (!/sk-\S+/.test(value))
		{
			return "Not a valid OpenAI API key.";
		}

		return null;
	}
}

/// Callback to invoke when the API key changes.
/// @param pageElements The elements on the API key pane.
/// @param apiKeyProvider The provider for which the API key changed.
const UpdateApiKeyLabel = (
	pageElements: ApiKeyPaneElements,
	apiKeyProvider: IApiKeyProvider): void =>
{
	// Update the element's text
	let apiKeyText = "[None]";
	if (apiKeyProvider.HasApiKey)
	{
		apiKeyText = apiKeyProvider.ApiKeyHidden +
			" (" +
			apiKeyProvider.ProviderName +
			", " +
			(apiKeyProvider.IsApiKeySaved ? "saved" : "not saved") +
			")";
	}
	pageElements.ApiKeyLabel.textContent = `Current API Key: ${apiKeyText}`;
}

/// Callback to invoke when the user clicks the "Save" button.
/// @param pageElements The elements on the API key pane.
/// @param apiKeyProvider The provider to save the API key to.
const OnSaveApiKeyClicked = (
	pageElements: ApiKeyPaneElements,
	apiKeyProvider: IApiKeyProvider): void =>
{
	// Validate the input
	if (!pageElements.ApiKeyInput.Validate())
	{
		return;
	}

	// Save the API key
	const saveToLocalStorage = pageElements.ApiKeySaveCheckbox.checked;
	apiKeyProvider.SetApiKey(
		pageElements.ApiKeyInput.Value,
		saveToLocalStorage
	);
	pageElements.ApiKeyInput.Value = "";
}

/// Callback to invoke when the user clicks the "Clear" button.
/// @param apiKeyProvider The provider to clear the API key from.
const OnClearApiKeyClicked = (apiKeyProvider: IApiKeyProvider): void =>
{
	apiKeyProvider.ClearApiKey();
}
