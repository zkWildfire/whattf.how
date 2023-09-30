import { ILlm } from "../LLMs/Llm";
import { IMessage } from "./Message";

/// Represents a branching conversation with an LLM.
export interface IConversation
{
	/// User-assigned name of the conversation.
	get Name(): string;

	/// LLM used by the conversation.
	get ILlm(): ILlm;

	/// Root message of the conversation.
	get RootMessage(): IMessage;
}
