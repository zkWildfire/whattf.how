import { ISimpleEvent } from "strongly-typed-events";

/// Interface for classes that manage a user's OpenAI API key.
export interface IApiKeyProvider
{
	/// Event that is fired when the API key changes.
	/// The event arguments will be the provider for which the API key changed.
	get OnApiKeyChanged(): ISimpleEvent<IApiKeyProvider>;

	/// Gets the user's API key.
	/// This will return the full API key as the user entered it. This string
	///   should generally not be displayed on the UI.
	/// @pre `HasApiKey()` returns `true`.
	get ApiKeyRaw(): string;

	/// Gets a UI-displayable version of the user's API key.
	/// This will return a version of the API key that has characters hidden,
	///   making it safe to display on the UI.
	/// @pre `HasApiKey()` returns `true`.
	get ApiKeyHidden(): string;

	/// Gets whether the user has an API key.
	get HasApiKey(): boolean;

	/// Gets whether the user's API key is saved to local storage.
	get IsApiKeySaved(): boolean;

	/// UI-displayable name of the provider.
	get ProviderName(): string;

	/// Clears the user's API key.
	ClearApiKey(): void;

	/// Sets the user's API key.
	/// @param apiKey The API key. Must not be an empty string.
	/// @param save Whether to save the API key to local storage.
	SetApiKey(apiKey: string, save: boolean): void;
}
