import { EventDispatcher, IEvent } from "strongly-typed-events";
import { ERole } from "../Role";
import { IMessage } from "./Message";

/// Message used for messages sent by the user.
/// Prompt messages differ from LLM messages in that their properties are not
///   fully known when they are created. For example, a prompt message will
///   return an invalid message token count value until it has been sent to the
///   LLM API and the response has been received.
export class PromptMessage implements IMessage
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

	/// Total number of LLM tokens consumed by context sent with this message.
	get ContextTokenCount(): number
	{
		return this._contextTokenCount;
	}

	/// Sets the actual number of LLM tokens consumed by this message's context.
	/// @throws Error If the message has already had its context token count set.
	set ContextTokenCount(value: number)
	{
		if (this._contextTokenCount >= 0)
		{
			throw new Error("Context token count already set.");
		}

		this._contextTokenCount = value;
	}

	/// Total number of LLM tokens consumed by this message, ignoring context.
	/// This value will be -1 until the message has been sent to the LLM API
	///   and the response has been received.
	get MessageTokenCount(): number
	{
		return this._messageTokenCount;
	}

	/// Sets the number of LLM tokens consumed by this message.
	/// @throws Error If the message has already had its actual token count set.
	set MessageTokenCount(value: number)
	{
		if (this._messageTokenCount >= 0)
		{
			throw new Error("Message token count already set.");
		}

		this._messageTokenCount = value;
	}

	/// Total number of LLM tokens consumed by this message, including context.
	get TotalTokenCount(): number
	{
		return this._contextTokenCount + this._messageTokenCount;
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

	/// Field backing the `ContextTokenCount` property.
	private _contextTokenCount: number = -1;

	/// Field backing the `MessageTokenCount` property.
	private _messageTokenCount: number = -1;

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
	}

	/// Adds a child message to this message.
	/// @param child Child message to add.
	public AddChild(child: IMessage): void
	{
		this._children.push(child);
		this._onChildAdded.dispatch(this, child);
	}
}
