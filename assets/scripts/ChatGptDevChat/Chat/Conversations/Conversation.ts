import { IEvent } from "strongly-typed-events";
import { ILlm } from "../LLMs/Llm";
import { IMessage } from "../Messages/Message";
import { IChatThread } from "../Threads/ChatThread";

/// Represents a branching conversation with an LLM.
/// Conversations are made up of one or more threads, where each thread is a
///   linear series of messages in the conversation. Conversations as a whole
///   are made up of a series of messages that form a tree structure.
export interface IConversation
{
	/// Event broadcast to when a new thread is added.
	/// The event arguments will be the conversation that was updated and the
	///   thread that was added.
	get OnThreadAdded(): IEvent<IConversation, IChatThread>;

	/// User-assigned name of the conversation.
	get Name(): string;

	/// LLM used by the conversation.
	get Llm(): ILlm;

	/// Target context window size for the conversation, in number of tokens.
	get TargetContextWindowSize(): number;

	/// Root message of the conversation.
	get RootMessage(): IMessage;

	/// All threads in the conversation.
	get Threads(): IChatThread[];

	/// Total number of messages in the conversation.
	get MessageCount(): number;

	/// Total number of tokens sent to the LLM.
	get OutboundTokenCount(): number;

	/// Total number of tokens received from the LLM.
	get InboundTokenCount(): number;

	/// Total number of tokens sent to and received from the LLM.
	get TotalTokenCount(): number;

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

	/// Adds a new thread to the conversation.
	/// @param thread Thread to add.
	AddThread(thread: IChatThread): void;
}
