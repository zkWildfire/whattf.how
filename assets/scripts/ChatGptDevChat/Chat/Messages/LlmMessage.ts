import { EventDispatcher, IEvent } from "strongly-typed-events";
import { ERole } from "../Role";
import { IMessage } from "./Message";

/// Represents a message returned by an LLM.
export class LlmMessage implements IMessage
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
	get Parent(): IMessage
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
		return ERole.Assistant;
	}

	/// Text contents of the message.
	get Contents(): string
	{
		return this._contents;
	}

	/// Total number of LLM tokens consumed by context sent with this message.
	get ContextTokenCount(): number
	{
		// LLM responses don't include context
		return 0;
	}

	/// Total number of LLM tokens consumed by this message, ignoring context.
	get MessageTokenCount(): number
	{
		return this._tokenCount;
	}

	/// Total number of LLM tokens consumed by this message, including context.
	get TotalTokenCount(): number
	{
		// Only the message token count needs to be returned since the context
		//   token count is always 0 for LLM messages
		return this._tokenCount;
	}

	/// Event dispatcher backing the `OnChildAdded` event.
	private readonly _onChildAdded = new EventDispatcher<IMessage, IMessage>();

	/// Field backing the `Id` property.
	private _id: string;

	/// Field backing the `Parent` property.
	private _parent: IMessage;

	/// Field backing the `Children` property.
	private _children: IMessage[] = [];

	/// Field backing the `Contents` property.
	private _contents: string;

	/// Field backing the message token properties.
	private _tokenCount: number;

	/// Creates a new LLM message.
	/// @param id Unique ID assigned to the message.
	/// @param parent Message that this message is a response to.
	/// @param contents Text contents of the message.
	/// @param tokenCount Number of LLM tokens consumed by the message.
	constructor(
		id: string,
		parent: IMessage,
		contents: string,
		tokenCount: number)
	{
		this._id = id;
		this._parent = parent;
		this._contents = contents;
		this._tokenCount = tokenCount;
	}

	/// Adds a child message to this message.
	/// @param child Child message to add.
	public AddChild(child: IMessage): void
	{
		this._children.push(child);
		this._onChildAdded.dispatch(this, child);
	}
}
