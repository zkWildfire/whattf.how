import { IEvent } from "strongly-typed-events";
import { ERole } from "../Role";

/// Represents a message in a conversation.
export interface IMessage
{
	/// Event broadcast when a child message is added.
	/// The event arguments will be the parent message and the child message.
	get OnChildAdded(): IEvent<IMessage, IMessage>;

	/// Unique ID assigned to the message.
	get Id(): string;

	/// Message that this message is a response to.
	get Parent(): IMessage | null;

	/// Messages that are responses to this message.
	get Children(): IMessage[];

	/// Role of the message.
	get Role(): ERole;

	/// Text contents of the message.
	get Contents(): string;

	/// Total number of LLM tokens consumed by this message.
	/// This value will be -1 until the message has been sent to the LLM API
	///   and the response has been received.
	get MessageTokenCountActual(): number;

	/// Sets the actual number of LLM tokens consumed by this message.
	/// @throws Error If the message has already had its actual token count set.
	set MessageTokenCountActual(value: number);

	/// Adds a child message to this message.
	/// @param child Child message to add.
	AddChild(child: IMessage): void;
}
