import { ERole } from "../Role";
import { IMessage } from "./Message";

/// Message whose token counts are estimated by splitting at whitespace.
export class WhitespaceMessage implements IMessage
{
	/// Message that this message is a response to.
	get Parent(): IMessage | null
	{
		return this._parent;
	}

	/// Messages that are responses to this message.
	get Children(): IMessage[]
	{
		return this._children;
	}

	/// Role of the message.
	get Role(): ERole
	{
		return this._role;
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
		return this._messageTokenCountEstimated;
	}

	/// Total number of LLM tokens consumed by this message.
	/// This value will be -1 until the message has been sent to the LLM API
	///   and the response has been received.
	get MessageTokenCountActual(): number
	{
		return this._messageTokenCountActual;
	}

	/// Sets the actual number of LLM tokens consumed by this message.
	/// @throws Error If the message has already had its actual token count set.
	set MessageTokenCountActual(value: number)
	{
		if (this._messageTokenCountActual >= 0)
		{
			throw new Error("Actual token count already set.");
		}

		this._messageTokenCountActual = value;
	}

	/// Estimated number of LLM tokens consumed by the current thread.
	/// This value considers the estimated tokens from this message as well as
	///   all previous messages in the thread.
	get ThreadTokenCountEstimated(): number
	{
		// Walk up the parent chain to get the total estimated token count
		//   for the thread.
		let tokenCount = this._threadTokenCountEstimated;
		let parent = this._parent;
		while (parent != null)
		{
			tokenCount += parent.MessageTokenCountEstimated;
			parent = parent.Parent;
		}

		return tokenCount;
	}

	/// Total number of LLM tokens consumed by the current thread.
	/// This value considers the actual tokens from this message as well as all
	///   previous messages in the thread. If this message has not yet been sent
	///   to the LLM API, this value will be -1.
	get ThreadTokenCountActual(): number
	{
		// If the actual token count for this message has not yet been set,
		//   return -1.
		if (this._messageTokenCountActual < 0)
		{
			return -1;
		}

		// Walk up the parent chain to get the total actual token count
		//   for the thread.
		let tokenCount = this._threadTokenCountActual;
		let parent = this._parent;
		while (parent != null)
		{
			tokenCount += parent.MessageTokenCountActual;
			parent = parent.Parent;
		}

		return tokenCount;
	}

	/// Field backing the `Parent` property.
	private readonly _parent: IMessage | null;

	/// Field backing the `Children` property.
	private readonly _children: IMessage[] = [];

	/// Field backing the `Role` property.
	private readonly _role: ERole;

	/// Field backing the `Contents` property.
	private readonly _contents: string;

	/// Field backing the `MessageTokenCountEstimated` property.
	private readonly _messageTokenCountEstimated: number;

	/// Field backing the `MessageTokenCountActual` property.
	private _messageTokenCountActual: number;

	/// Field backing the `ThreadTokenCountEstimated` property.
	private readonly _threadTokenCountEstimated: number;

	/// Field backing the `ThreadTokenCountActual` property.
	private _threadTokenCountActual: number;

	/// Initializes the message.
	/// @param parent Message that this message is a response to.
	/// @param role Role of the message.
	/// @param contents Text contents of the message.
	constructor(
		parent: IMessage | null,
		role: ERole,
		contents: string)
	{
		this._parent = parent;
		this._role = role;
		this._contents = contents;
		this._messageTokenCountEstimated = this._contents.split(/\s+/).length;
		this._messageTokenCountActual = -1;
		this._threadTokenCountEstimated = this._messageTokenCountEstimated;
		this._threadTokenCountActual = -1;
	}

	/// Adds a child message to this message.
	/// @param child Child message to add.
	public AddChild(child: IMessage): void
	{
		this._children.push(child);
	}
}
