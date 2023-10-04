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

	/// Total number of LLM tokens consumed by context sent with this message.
	get ContextTokenCount(): number;

	/// Total number of LLM tokens consumed by this message, ignoring context.
	get MessageTokenCount(): number;

	/// Total number of LLM tokens consumed by this message, including context.
	get TotalTokenCount(): number;

	/// Adds a child message to this message.
	/// @param child Child message to add.
	AddChild(child: IMessage): void;
}
