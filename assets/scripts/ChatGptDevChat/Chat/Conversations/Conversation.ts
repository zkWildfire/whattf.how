import { IEvent } from "strongly-typed-events";
import { ILlm } from "../LLMs/Llm";
import { IMessage } from "../Messages/Message";

/// Represents a branching conversation with an LLM.
/// Conversations are made up of one or more threads, where each thread is a
///   linear series of messages in the conversation. Conversations as a whole
///   are made up of a series of messages that form a tree structure.
export interface IConversation
{
	/// Event broadcast to when a message is sent to the LLM.
	/// The event arguments will be the conversation that the sent message is
	///   part of and the message that was sent.
	get OnMessageSent(): IEvent<IConversation, IMessage>;

	/// Event broadcast to when a response is received from the LLM.
	/// The event arguments will be the conversation that the received message
	///   is for and the message that was received.
	get OnResponseReceived(): IEvent<IConversation, IMessage>;

	/// User-assigned name of the conversation.
	get Name(): string;

	/// LLM used by the conversation.
	get ILlm(): ILlm;

	/// Root message of the conversation.
	get RootMessage(): IMessage;

	/// All leaf messages in the conversation.
	get LeafMessages(): IMessage[];

	/// Total number of messages in the conversation.
	get MessageCount(): number;

	/// Total cost incurred by sending tokens to the LLM.
	/// @warning "Outbound" here refers to messages sent to the LLM, which
	///   corresponds to the "inbound" cost of the LLM.
	get OutboundCost(): number;

	/// Total cost incurred by receiving tokens from the LLM.
	/// @warning "Inbound" here refers to messages received from the LLM, which
	///   corresponds to the "outbound" cost of the LLM.
	get InboundCost(): number;

	/// Total cost of the conversation in dollars.
	get TotalCost(): number;

	/// Adds a new message to the conversation without sending it to the LLM.
	/// This is intended for adding initial messages used to start the
	///   conversation. However, it could also be used to add messages in the
	///   middle of conversations if necessary.
	/// @param message Message to add. Must have a known actual token count.
	/// @warning Messages sent via this method will never trigger the
	///   on message sent or on message received events.
	AppendMessage(message: IMessage): void;

	/// Sends a message to the LLM.
	/// This will also add new messages to the conversation.
	/// @param message Message to send.
	/// @returns The message that was received from the LLM.
	SendMessage(message: IMessage): Promise<IMessage>;
}
