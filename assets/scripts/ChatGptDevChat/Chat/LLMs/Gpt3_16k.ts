import { IPrompt } from "../Prompts/Prompt";
import { IResponse } from "../Responses/Response";
import { ILlm } from "./Llm";
import { ELlmType } from "./LlmType";

/// LLM implementation that uses OpenAI GPT-3.5 with a 16K context window.
export class Gpt3_16k extends ILlm
{
	/// Initializes the LLM.
	constructor()
	{
		// Costs for the LLM are obtained from here:
		// https://openai.com/pricing
		super(
			"GPT-3.5 (16K)",
			"GPT3",
			ELlmType.Gpt3_16k,
			16 * 1024,
			0.003,
			0.004
		);
	}

	/// Counts the number of tokens in the given text.
	/// The value returned by this method should be considered an estimate, not
	///   an exact value. This is because the APIs of some LLMs may add
	///   additional tokens when processing a prompt. Always use the token
	///   counts returned by the LLM API if an exact token count is needed.
	/// @param text Text to count tokens in.
	/// @returns Estimate of the number of tokens in the text.
	public CountTokens(text: string): number
	{
		// TODO
		throw new Error("Not implemented yet");
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
