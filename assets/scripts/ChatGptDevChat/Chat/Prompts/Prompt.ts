import { IMessage } from "../Messages/Message";
import { PromptMessage } from "../Messages/PromptMessage";

/// Interface that provides the data necessary to create a prompt for an LLM.
export interface IPrompt
{
	/// Messages that form the history of the conversation.
	get History(): IMessage[];

	/// Message that a response must be generated for.
	get Message(): PromptMessage;

	/// API key to use when sending the prompt.
	get ApiKey(): string;
}
