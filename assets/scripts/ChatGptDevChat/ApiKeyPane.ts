import assert from "assert";
import { IApiKeyProvider } from "./Auth/ApiKeyProvider";

/// ID of the input element for entering an API key
const ID_API_KEY_INPUT = "api-key-input";

/// ID of the checkbox that determines whether to save the API key to local storage
const ID_API_KEY_SAVE_CHECKBOX = "api-key-store";

/// ID of the "Save" button for saving an API key to local storage
const ID_SAVE_API_KEY_BUTTON = "api-key-save";

/// ID of the "Clear" button for clearing the current API key
const ID_CLEAR_API_KEY_BUTTON = "api-key-clear";

/// ID of the element that displays the UI-safe version of the current API key
const ID_API_KEY_LABEL = "api-key-label";

/// ID of the element that displays API key validation error messages
const ID_API_KEY_ERROR_LABEL = "api-key-error-label";

/// Finds the button that saves the current API key entered by the user.
/// @returns A reference to the button element.
export const GetSaveButton = (): HTMLButtonElement =>
{
	const button = document.getElementById(
		ID_SAVE_API_KEY_BUTTON
	) as HTMLButtonElement;
	if (!button)
	{
		throw new Error(
			`Could not find element with ID ${ID_SAVE_API_KEY_BUTTON}`
		);
	}

	return button;
}

/// Finds the button that clears the current API key.
/// @returns A reference to the button element.
export const GetClearButton = (): HTMLButtonElement =>
{
	const button = document.getElementById(
		ID_CLEAR_API_KEY_BUTTON
	) as HTMLButtonElement;
	if (!button)
	{
		throw new Error(
			`Could not find element with ID ${ID_CLEAR_API_KEY_BUTTON}`
		);
	}

	return button;
}

/// Callback to invoke when the API key changes.
/// @param apiKeyProvider The provider for which the API key changed.
export const UpdateApiKeyLabel = (apiKeyProvider: IApiKeyProvider): void =>
{
	// Find the element that displays the API key
	const apiKeyLabel = document.getElementById(ID_API_KEY_LABEL);
	if (!apiKeyLabel)
	{
		throw new Error(
			`Could not find element with ID ${ID_API_KEY_LABEL}`
		);
	}

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
	apiKeyLabel.textContent = `Current API Key: ${apiKeyText}`;
}

/// Callback to invoke when the user clicks the "Save" button.
/// @param apiKeyProvider The provider to save the API key to.
export const OnSaveApiKeyClicked = (apiKeyProvider: IApiKeyProvider): void =>
{
	// Find the input element
	const input = document.getElementById(ID_API_KEY_INPUT) as HTMLInputElement;
	if (!input)
	{
		throw new Error(
			`Could not find element with ID ${ID_API_KEY_INPUT}`
		);
	}

	// Find the checkbox that determines whether to save the API key
	const saveCheckbox = document.getElementById(
		ID_API_KEY_SAVE_CHECKBOX
	) as HTMLInputElement;
	if (!saveCheckbox)
	{
		throw new Error(
			`Could not find element with ID ${ID_API_KEY_SAVE_CHECKBOX}`
		);
	}

	// Find the element that displays API key validation errors
	const errorLabel = document.getElementById(ID_API_KEY_ERROR_LABEL);
	if (!errorLabel)
	{
		throw new Error(
			`Could not find element with ID ${ID_API_KEY_ERROR_LABEL}`
		);
	}

	// Save the API key
	try
	{
		const saveToLocalStorage = saveCheckbox.checked;
		apiKeyProvider.SetApiKey(input.value, saveToLocalStorage);
		input.value = "";
		errorLabel.textContent = "";
	}
	catch (e: any)
	{
		assert(e instanceof Error);
		errorLabel.textContent = e.message;
	}
}

/// Callback to invoke when the user clicks the "Clear" button.
/// @param apiKeyProvider The provider to clear the API key from.
export const OnClearApiKeyClicked = (apiKeyProvider: IApiKeyProvider): void =>
{
	apiKeyProvider.ClearApiKey();
}
