import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";
import { IApiKeyProvider } from "./ApiKeyProvider";

/// Api key provider that handles OpenAI API keys.
export class OpenAiApiKeyProvider implements IApiKeyProvider
{
	/// Event that is fired when the API key changes.
	get OnApiKeyChanged(): ISimpleEvent<IApiKeyProvider>
	{
		return this._onApiKeyChanged.asEvent();
	}

	/// Gets the user's API key.
	/// This will return the full API key as the user entered it. This string
	///   should generally not be displayed on the UI.
	/// @pre `HasApiKey()` returns `true`.
	get ApiKeyRaw(): string
	{
		if (!this._apiKey)
		{
			throw new Error("ApiKeyRaw called when HasApiKey() is false");
		}

		return this._apiKey;
	}

	/// Gets a UI-displayable version of the user's API key.
	/// This will return a version of the API key that has characters hidden,
	///   making it safe to display on the UI.
	/// @pre `HasApiKey()` returns `true`.
	get ApiKeyHidden(): string
	{
		if (!this._apiKey)
		{
			throw new Error("ApiKeyHidden called when HasApiKey() is false");
		}

		// Use the same format as OpenAI does on their website, which is to
		//   display the key as "sk-...abcd", where "abcd" is the last 4
		//   characters of the key.
		return `sk-...${this._apiKey.substring(this._apiKey.length - 4)}`;
	}

	/// Gets whether the user has an API key.
	get HasApiKey(): boolean
	{
		return this._apiKey !== null;
	}

	/// Gets whether the user's API key is saved to local storage.
	get IsApiKeySaved(): boolean
	{
		return localStorage.getItem(this._apiKeyLocalStorageKey) !== null;
	}

	/// UI-displayable name of the provider.
	get ProviderName(): string
	{
		return "OpenAI";
	}

	/// Event that is fired when the API key changes.
	private readonly _onApiKeyChanged: SimpleEventDispatcher<IApiKeyProvider> =
		new SimpleEventDispatcher<IApiKeyProvider>();

	/// The key that the API key is saved under in local storage.
	private readonly _apiKeyLocalStorageKey: string;

	/// The current API key.
	private _apiKey: string | null;

	/// Initializes the provider.
	/// @param providerId Unique ID assigned to the provider.
	constructor(providerId: string)
	{
		this._apiKeyLocalStorageKey = `${providerId}_ApiKey`;
		this._apiKey = localStorage.getItem(this._apiKeyLocalStorageKey);
	}

	/// Clears the user's API key.
	public ClearApiKey(): void
	{
		// If the API key is already cleared, do nothing
		if (!this._apiKey)
		{
			return;
		}

		// Clear the API key
		this._apiKey = null;
		localStorage.removeItem(this._apiKeyLocalStorageKey);
		this._onApiKeyChanged.dispatch(this);
	}

	/// Sets the user's API key.
	/// @param apiKey The API key. Must not be an empty string.
	/// @param save Whether to save the API key to local storage.
	SetApiKey(apiKey: string, save: boolean): void
	{
		// All OpenAI API keys use the format "sk-..."
		if (!/sk-\S+/.test(apiKey))
		{
			throw new Error("Invalid OpenAI API key.");
		}

		// If the API key is already set, do nothing
		if (this._apiKey === apiKey && this.IsApiKeySaved === save)
		{
			return;
		}

		// Save the API key
		this._apiKey = apiKey;
		if (save)
		{
			localStorage.setItem(this._apiKeyLocalStorageKey, apiKey);
		}

		// Notify listeners that the API key changed
		this._onApiKeyChanged.dispatch(this);
	}
}
