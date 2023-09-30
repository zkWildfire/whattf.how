import { ILlm } from "./Llm";

/// LLM implementation that uses OpenAI GPT-4 with a 32K context window.
export class Gpt4_32k implements ILlm
{
	/// UI-displayable name of the LLM.
	get DisplayName(): string
	{
		return "GPT-4 (32K)";
	}

	/// Cost in dollars per 1000 characters of input text.
	get InboundCost(): number
	{
		return 0.06;
	}

	/// Cost in dollars per 1000 characters of output text.
	get OutboundCost(): number
	{
		return 0.12;
	}
}
