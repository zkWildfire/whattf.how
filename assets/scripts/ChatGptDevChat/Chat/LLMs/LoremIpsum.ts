import { ILlm } from "./Llm";

/// Fake LLM implementation used for testing.
export class LoremIpsum implements ILlm
{
	/// UI-displayable name of the LLM.
	get DisplayName(): string
	{
		return "Lorem Ipsum";
	}

	/// Cost in dollars per 1000 characters of input text.
	get InboundCost(): number
	{
		return 0.0;
	}

	/// Cost in dollars per 1000 characters of output text.
	get OutboundCost(): number
	{
		return 0.0;
	}
}
