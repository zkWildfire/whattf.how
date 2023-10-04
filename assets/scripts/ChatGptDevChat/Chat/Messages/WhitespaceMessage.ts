import { EventDispatcher, IEvent } from "strongly-typed-events";
import { ERole } from "../Role";
import { IMessage } from "./Message";

/// Message whose token counts are estimated by splitting at whitespace.
export class WhitespaceMessage implements IMessage
{
	/// Event broadcast when a child message is added.
	/// The event arguments will be the parent message and the child message.
	get OnChildAdded(): IEvent<IMessage, IMessage>
	{
		return this._onChildAdded.asEvent();
	}

	/// Unique ID assigned to the message.
	get Id(): string
	{
		return this._id;
	}

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

	/// Event dispatcher backing the `OnChildAdded` event.
	private readonly _onChildAdded = new EventDispatcher<IMessage, IMessage>();

	/// Field backing the `Id` property.
	private readonly _id: string;

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

	/// Initializes the message.
	/// @param id Unique ID assigned to the message.
	/// @param parent Message that this message is a response to.
	/// @param role Role of the message.
	/// @param contents Text contents of the message.
	constructor(
		id: string,
		parent: IMessage | null,
		role: ERole,
		contents: string)
	{
		this._id = id;
		this._parent = parent;
		this._role = role;
		this._contents = contents;
		this._messageTokenCountEstimated = this._contents.split(/\s+/).length;
		this._messageTokenCountActual = -1;
	}

	/// Adds a child message to this message.
	/// @param child Child message to add.
	public AddChild(child: IMessage): void
	{
		this._children.push(child);
		this._onChildAdded.dispatch(this, child);
	}
}
