import { IEvent } from "strongly-typed-events";
import { IMessage } from "../Messages/Message";

/// Represents a linear series of messages in a conversation.
export interface IChatThread
{
	/// Event broadcast to when a message is sent to the LLM.
	/// The event arguments will be the thread that the sent message is part of
	///   and the message that was sent.
	get OnMessageSent(): IEvent<IChatThread, IMessage>;

	/// Event broadcast to when a response is received from the LLM.
	/// The event arguments will be the thread that the received message is for
	///   and the message that was received.
	get OnResponseReceived(): IEvent<IChatThread, IMessage>;

	/// Event broadcast to when the thread appends new messages.
	/// The event arguments will be the thread that was updated and the number
	///   of new messages that were appended.
	get OnThreadUpdated(): IEvent<IChatThread, number>;

	/// Root message of the thread.
	get RootMessage(): IMessage;

	/// Current leaf message of the thread.
	/// @invariant This will always be a message from the LLM. Messages written
	///   by the user are not added to the thread until a response from the LLM
	///   is received.
	get LeafMessage(): IMessage;

	/// Total number of messages in the thread.
	get MessageCount(): number;

	/// Total number of tokens consumed by outbound messages in the thread.
	/// This will always be the actual number of outbound tokens since messages
	///   are only added to a thread once a response is received from the LLM.
	/// @warning "Outbound" here refers to messages sent to the LLM, which
	///   corresponds to the "inbound" token count for the LLM.
	get OutboundTokenCount(): number;

	/// Total number of tokens consumed by inbound messages in the thread.
	/// This will always be the actual number of inbound tokens since messages
	///   are only added to a thread once a response is received from the LLM.
	/// @warning "Inbound" here refers to messages received from the LLM, which
	///   corresponds to the "outbound" token count for the LLM.
	get InboundTokenCount(): number;

	/// Total number of tokens consumed by the thread.
	/// This will always be the actual number of tokens since messages are only
	///   added to a thread once a response is received from the LLM.
	get TotalTokenCount(): number;

	/// Total cost incurred by sending tokens to the LLM.
	/// This will always be the actual cost of outbound tokens since messages
	///   are only added to a thread once a response is received from the LLM.
	/// @warning "Outbound" here refers to messages sent to the LLM, which
	///   corresponds to the "inbound" cost of the LLM.
	get OutboundCost(): number;

	/// Total cost incurred by receiving tokens from the LLM.
	/// This will always be the actual cost of inbound tokens since messages
	///   are only added to a thread once a response is received from the LLM.
	/// @warning "Inbound" here refers to messages received from the LLM, which
	///   corresponds to the "outbound" cost of the LLM.
	get InboundCost(): number;

	/// Total cost of the thread in dollars.
	/// This will always be the actual cost of the thread since messages are
	///   only added to a thread once a response is received from the LLM.
	get TotalCost(): number;

	/// Adds a new message to the thread without sending it to the LLM.
	/// This method is intended for use when creating the first thread for a
	///   conversation since there may be one or more messages added to "seed"
	///   the conversation but are not sent to the LLM. These messages will
	///   only be sent once the first message is sent to the LLM.
	/// @param message Message to add. Must have a known actual token count and
	///   be part of this thread's chain of messages.
	/// @warning Messages added via this method will never trigger any events.
	AppendMessage(message: IMessage): void;

	/// Sends a message to the LLM.
	/// This will also add new messages to the conversation.
	/// @param message Message to send.
	/// @returns The message that was received from the LLM.
	SendMessage(message: IMessage): Promise<IMessage>;
}
