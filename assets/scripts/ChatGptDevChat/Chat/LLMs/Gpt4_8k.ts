import { IPrompt } from "../Prompts/Prompt";
import { IResponse } from "../Responses/Response";
import { ILlm } from "./Llm";

/// LLM implementation that uses OpenAI GPT-4 with a 8K context window.
export class Gpt4_8k implements ILlm
{
	/// UI-displayable name of the LLM.
	get DisplayName(): string
	{
		return "GPT-4 (8K)";
	}

	/// Cost in dollars per 1000 characters of input text.
	get InboundCost(): number
	{
		return 0.03;
	}

	/// Cost in dollars per 1000 characters of output text.
	get OutboundCost(): number
	{
		return 0.06;
	}

	/// Sends a prompt to the LLM and returns the response.
	/// @param prompt Prompt to send.
	/// @returns Response(s) from the LLM. If the LLM offers multiple choices
	///   for a response, multiple responses may be returned. At least one
	///   response will always be returned.
	public SendPrompt(prompt: IPrompt): Promise<IResponse[]>
	{
		// TODO
		throw new Error("Not implemented yet");
	}
}
