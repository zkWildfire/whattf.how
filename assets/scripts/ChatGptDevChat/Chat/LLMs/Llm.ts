import { IPrompt } from "../Prompts/Prompt";
import { IResponse } from "../Responses/Response";
import { ELlmType } from "./LlmType";

/// Represents an LLM used by a conversation.
export abstract class ILlm
{
	/// UI-displayable name of the LLM.
	get DisplayName(): string
	{
		return this._displayName;
	}

	/// Gets a short, possibly non-unique display name for the LLM.
	/// This is used as the name displayed in chat threads for the LLM.
	get DisplayNameShort(): string
	{
		return this._displayNameShort;
	}

	/// Enum for the LLM class.
	get LlmType(): ELlmType
	{
		return this._llmType;
	}

	/// Size of the LLM's context window in number of tokens.
	get ContextWindowSize(): number
	{
		return this._contextWindowSize;
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

	/// Field backing the `DisplayNameShort` property.
	private readonly _displayNameShort: string;

	/// Field backing the `LlmType` property.
	private readonly _llmType: ELlmType;

	/// Field backing the `ContextWindowSize` property.
	private readonly _contextWindowSize: number;

	/// Field backing the `InboundCost` property.
	private readonly _inboundCost: number;

	/// Field backing the `OutboundCost` property.
	private readonly _outboundCost: number;

	/// Initializes the LLM.
	/// @param displayName UI-displayable name of the LLM.
	/// @param displayNameShort Short, possibly non-unique display name for the
	///   LLM.
	/// @param llmType Enum for the LLM class.
	/// @param contextWindowSize Size of the LLM's context window in number of
	///   tokens.
	/// @param inboundCost Cost in dollars per 1000 characters of input text.
	/// @param outboundCost Cost in dollars per 1000 characters of output text.
	protected constructor(
		displayName: string,
		displayNameShort: string,
		llmType: ELlmType,
		contextWindowSize: number,
		inboundCost: number,
		outboundCost: number)
	{
		this._displayName = displayName;
		this._displayNameShort = displayNameShort;
		this._llmType = llmType;
		this._contextWindowSize = contextWindowSize;
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

	/// Counts the number of tokens in the given text.
	/// The value returned by this method should be considered an estimate, not
	///   an exact value. This is because the APIs of some LLMs may add
	///   additional tokens when processing a prompt. Always use the token
	///   counts returned by the LLM API if an exact token count is needed.
	/// @param text Text to count tokens in.
	/// @returns Estimate of the number of tokens in the text.
	public abstract CountTokens(text: string): number;

	/// Sends a prompt to the LLM and returns the response.
	/// @param prompt Prompt to send.
	/// @returns Response(s) from the LLM. If the LLM offers multiple choices
	///   for a response, multiple responses may be returned. At least one
	///   response will always be returned.
	public abstract SendPrompt(prompt: IPrompt): Promise<IResponse[]>;

}
