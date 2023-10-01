import { IPrompt } from "../Prompts/Prompt";
import { IResponse } from "../Responses/Response";
import { ILlm } from "./Llm";

/// LLM implementation that uses OpenAI GPT-4 with a 32K context window.
export class Gpt4_32k extends ILlm
{
	/// Initializes the LLM.
	constructor()
	{
		// Costs for the LLM are obtained from here:
		// https://openai.com/pricing
		super(
			"GPT-4 (32K)",
			32 * 1024,
			0.06,
			0.12
		);
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
