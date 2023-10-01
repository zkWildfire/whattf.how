import { IPrompt } from "../Prompts/Prompt";
import { IResponse } from "../Responses/Response";
import { ILlm } from "./Llm";

/// LLM implementation that uses OpenAI GPT-3.5 with a 16K context window.
export class Gpt3_4k extends ILlm
{
	/// Initializes the LLM.
	constructor()
	{
		// Costs for the LLM are obtained from here:
		// https://openai.com/pricing
		super("GPT-3.5 (16K)", 0.003, 0.004);
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
