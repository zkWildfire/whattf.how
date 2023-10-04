import { GPTTokens } from "gpt-tokens";
import { IPrompt } from "../Prompts/Prompt";
import { IResponse } from "../Responses/Response";
import { ELlmType } from "./LlmType";
import OpenAI from "openai";
import { IGptLlm } from "./GptLlm";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat";
import assert from "assert";

/// LLM implementation that uses OpenAI GPT-3.5 with a 4K context window.
export class Gpt3_4k extends IGptLlm
{
	/// Initializes the LLM.
	constructor()
	{
		// Costs for the LLM are obtained from here:
		// https://openai.com/pricing
		super(
			"GPT-3.5 (4K)",
			"GPT3",
			ELlmType.Gpt3_4k,
			4 * 1024,
			0.0015,
			0.002
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
		return new GPTTokens({
			model: "gpt-3.5-turbo-0613",
			messages: [
				{
					"role": "user",
					"content": text
				}
			]
		}).usedTokens;
	}

	/// Sends a prompt to the LLM and returns the response.
	/// @param prompt Prompt to send.
	/// @returns Response(s) from the LLM. If the LLM offers multiple choices
	///   for a response, multiple responses may be returned. At least one
	///   response will always be returned.
	public async SendPrompt(prompt: IPrompt): Promise<IResponse[]>
	{
		const openai = new OpenAI({
			apiKey: prompt.ApiKey,
			dangerouslyAllowBrowser: true
		});

		// Construct the OpenAI prompt object
		const openAiPrompt: ChatCompletionCreateParamsNonStreaming = {
			model: "gpt-3.5-turbo",
			messages: [
				...prompt.History.map(IGptLlm.MessageToOpenAiMessage),
				IGptLlm.MessageToOpenAiMessage(prompt.Message)
			]
		};
		const response = await openai.chat.completions.create(openAiPrompt);
		assert(response.usage != null);
		prompt.Message.MessageTokenCountActual = response.usage.prompt_tokens;

		// Convert the OpenAI response to responses that can be returned to the
		//   caller
		return this.OpenAiResponseToResponses(response);
	}
}
