import { ILlm } from "../LLMs/Llm";
import { IMessage } from "../Messages/Message";

/// Represents a branching conversation with an LLM.
export interface IConversation
{
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

	/// Adds a new message to the conversation.
	/// @param message Message to add.
	AddMessage(message: IMessage): void;
}
