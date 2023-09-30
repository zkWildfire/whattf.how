import { ILlm } from "./Llm";

/// LLM implementation that uses OpenAI GPT-3.5 with a 4K context window.
export class Gpt3_4k implements ILlm
{
	/// UI-displayable name of the LLM.
	get DisplayName(): string
	{
		return "GPT-3.5 (4K)";
	}

	/// Cost in dollars per 1000 characters of input text.
	get InboundCost(): number
	{
		return 0.0015;
	}

	/// Cost in dollars per 1000 characters of output text.
	get OutboundCost(): number
	{
		return 0.002;
	}
}
