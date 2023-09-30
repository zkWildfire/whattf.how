/// Represents an LLM used by a conversation.
export interface ILlm
{
	/// UI-displayable name of the LLM.
	get DisplayName(): string;

	/// Cost in dollars per 1000 characters of input text.
	get InboundCost(): number;

	/// Cost in dollars per 1000 characters of output text.
	get OutboundCost(): number;
}
