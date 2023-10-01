import { IPrompt } from "../Prompts/Prompt";
import { IResponse } from "../Responses/Response";

/// Represents an LLM used by a conversation.
export abstract class ILlm
{
	/// UI-displayable name of the LLM.
	get DisplayName(): string
	{
		return this._displayName;
	}

	/// Cost in dollars per 1000 characters of input text.
	get InboundCost(): number
	{
		return this._inboundCost;
	}

	/// Cost in dollars per 1000 characters of output text.
	get OutboundCost(): number
	{
		return this._outboundCost;
	}

	/// Field backing the `DisplayName` property.
	private readonly _displayName: string;

	/// Field backing the `InboundCost` property.
	private readonly _inboundCost: number;

	/// Field backing the `OutboundCost` property.
	private readonly _outboundCost: number;

	/// Initializes the LLM.
	/// @param displayName UI-displayable name of the LLM.
	/// @param inboundCost Cost in dollars per 1000 characters of input text.
	/// @param outboundCost Cost in dollars per 1000 characters of output text.
	protected constructor(
		displayName: string,
		inboundCost: number,
		outboundCost: number)
	{
		this._displayName = displayName;
		this._inboundCost = inboundCost;
		this._outboundCost = outboundCost;
	}

	/// Calculates how much it would cost to send the given number of tokens to
	///   the LLM.
	/// @param tokenCount Number of tokens to send.
	/// @returns Cost in dollars of sending the tokens.
	public CalcInboundCost(tokenCount: number): number
	{
		return (tokenCount / 1000) * this.InboundCost;
	}

	/// Calculates how much it would cost to receive the given number of tokens
	///   from the LLM.
	/// @param tokenCount Number of tokens to receive.
	/// @returns Cost in dollars of receiving the tokens.
	public CalcOutboundCost(tokenCount: number): number
	{
		return (tokenCount / 1000) * this.OutboundCost;
	}

	/// Calculates how much it would cost to send and receive the given number
	///   of tokens to and from the LLM.
	/// @param inboundCount Number of tokens to send to the LLM.
	/// @param outboundCount Number of tokens to receive from the LLM.
	/// @returns Cost in dollars of sending and receiving the tokens.
	public CalcTotalCost(inboundCount: number, outboundCount: number): number
	{
		return this.CalcInboundCost(inboundCount) +
			this.CalcOutboundCost(outboundCount);
	}

	/// Sends a prompt to the LLM and returns the response.
	/// @param prompt Prompt to send.
	/// @returns Response(s) from the LLM. If the LLM offers multiple choices
	///   for a response, multiple responses may be returned. At least one
	///   response will always be returned.
	public abstract SendPrompt(prompt: IPrompt): Promise<IResponse[]>;
}
