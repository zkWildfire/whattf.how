import { GetClearButton, GetSaveButton, OnClearApiKeyClicked, OnSaveApiKeyClicked, UpdateApiKeyLabel } from "./ApiKeyPane";
import { OpenAiApiKeyProvider } from "./Auth/OpenAiApiKeyProvider";

/// Entry point for the dev chat interface.
export const RunDevChat = () =>
{
	// Find key UI elements
	const apiKeySaveButton = GetSaveButton();
	const apiKeyClearButton = GetClearButton();

	// Set up the services for the chat interface
	const openAiApiKeyProvider = new OpenAiApiKeyProvider("openai");

	// Bind to service events
	openAiApiKeyProvider.OnApiKeyChanged.subscribe(UpdateApiKeyLabel);

	// Bind to UI events
	apiKeySaveButton.addEventListener("click", () =>
	{
		OnSaveApiKeyClicked(openAiApiKeyProvider)
	});
	apiKeyClearButton.addEventListener("click", () =>
	{
		OnClearApiKeyClicked(openAiApiKeyProvider)
	});

	// Also update the API key label on page load
	UpdateApiKeyLabel(openAiApiKeyProvider);
}
