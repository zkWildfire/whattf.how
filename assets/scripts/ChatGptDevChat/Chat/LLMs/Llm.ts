import { IPrompt } from "../Prompts/Prompt";
import { IResponse } from "../Responses/Response";

/// Represents an LLM used by a conversation.
export interface ILlm
{
	/// UI-displayable name of the LLM.
	get DisplayName(): string;

	/// Cost in dollars per 1000 characters of input text.
	get InboundCost(): number;

	/// Cost in dollars per 1000 characters of output text.
	get OutboundCost(): number;

	/// Sends a prompt to the LLM and returns the response.
	/// @param prompt Prompt to send.
	/// @returns Response(s) from the LLM. If the LLM offers multiple choices
	///   for a response, multiple responses may be returned. At least one
	///   response will always be returned.
	SendPrompt(prompt: IPrompt): Promise<IResponse[]>;
}
