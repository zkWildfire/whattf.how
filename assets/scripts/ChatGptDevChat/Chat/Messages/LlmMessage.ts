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
