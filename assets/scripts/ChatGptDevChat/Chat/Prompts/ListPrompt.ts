import { IMessage } from "../Messages/Message";
import { IPrompt } from "./Prompt";

/// Basic prompt implementation that provides access to a list of messages.
export class ListPrompt implements IPrompt
{
	/// Messages that form the prompt.
	get Messages(): IMessage[]
	{
		return this._messages;
	}

	/// API key to use when sending the prompt.
	get ApiKey(): string
	{
		return this._apiKey;
	}

	/// Field backing the `Messages` property.
	private readonly _messages: IMessage[];

	/// Field backing the `ApiKey` property.
	private readonly _apiKey: string;

	/// Initializes the prompt.
	/// @param messages Messages that form the prompt.
	/// @param apiKey API key to use when sending the prompt.
	constructor(messages: IMessage[], apiKey: string)
	{
		this._messages = messages;
		this._apiKey = apiKey;
	}
}
