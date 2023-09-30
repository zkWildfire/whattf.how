import { ERole } from "../Role";
import { IMessage } from "./Message";

/// Represents a message returned by an LLM.
export class LlmMessage implements IMessage
{
	/// Message that this message is a response to.
	get Parent(): IMessage
	{
		return this._parent;
	}

	/// Role of the message.
	get Role(): ERole
	{
		return ERole.Assistant;
	}

	/// Text contents of the message.
	get Contents(): string
	{
		return this._contents;
	}

	/// Estimated number of LLM tokens consumed by this message.
	/// This counts only the tokens consumed by the message contents. The total
	///   tokens consumed by sending this message to the LLM may be greater than
	///   this value due to internal formatting handled by the LLM API.
	get MessageTokenCountEstimated(): number
	{
		return this._tokenCount;
	}

	/// Total number of LLM tokens consumed by this message.
	/// This value will be -1 until the message has been sent to the LLM API
	///   and the response has been received.
	get MessageTokenCountActual(): number
	{
		return this._tokenCount;
	}

	/// Sets the actual number of LLM tokens consumed by this message.
	/// @throws Error If the message has already had its actual token count set.
	set MessageTokenCountActual(value: number)
	{
		// Instances of this class are constructed from LLM responses, so the
		//   actual token count will always be known as soon as the message is
		//   created.
		throw new Error("Cannot set actual token count on LLM message");
	}

	/// Estimated number of LLM tokens consumed by the current thread.
	/// This value considers the estimated tokens from this message as well as
	///   all previous messages in the thread.
	get ThreadTokenCountEstimated(): number
	{
		// Walk up the parent chain to compute the total token count
		let tokenCount = this._tokenCount;
		let currentMessage: IMessage | null = this._parent;
		while (currentMessage !== null)
		{
			tokenCount += currentMessage.MessageTokenCountEstimated;
			currentMessage = currentMessage.Parent;
		}

		return tokenCount;
	}

	/// Total number of LLM tokens consumed by the current thread.
	/// This value considers the actual tokens from this message as well as all
	///   previous messages in the thread. If this message has not yet been sent
	///   to the LLM API, this value will be -1.
	get ThreadTokenCountActual(): number
	{
		// Walk up the parent chain to compute the total token count
		// Since this message is the starting message for the chain and its
		//   actual token count is always known, it isn't necessary to check
		//   if any message's actual token count is -1 since all previous
		//   messages should also have known actual token counts.
		let tokenCount = this._tokenCount;
		let currentMessage: IMessage | null = this._parent;
		while (currentMessage !== null)
		{
			tokenCount += currentMessage.MessageTokenCountActual;
			currentMessage = currentMessage.Parent;
		}

		return tokenCount;
	}

	/// Field backing the `Parent` property.
	private _parent: IMessage;

	/// Field backing the `Contents` property.
	private _contents: string;

	/// Field backing the message token properties.
	private _tokenCount: number;

	/// Creates a new LLM message.
	/// @param parent Message that this message is a response to.
	/// @param contents Text contents of the message.
	/// @param tokenCount Number of LLM tokens consumed by the message.
	constructor(parent: IMessage, contents: string, tokenCount: number)
	{
		this._parent = parent;
		this._contents = contents;
		this._tokenCount = tokenCount;
	}
}
