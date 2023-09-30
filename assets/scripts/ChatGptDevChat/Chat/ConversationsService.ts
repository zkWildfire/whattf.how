import { ISimpleEvent } from "strongly-typed-events";
import { IConversation } from "./Conversation";

/// Service that keeps track of all conversations created by the user.
export interface IConversationsService
{
	/// Event that is fired when a conversation is created.
	/// The event arguments will be the conversation that was created.
	get OnConversationCreated(): ISimpleEvent<IConversation>;

	/// Event that is fired when a conversation is deleted.
	/// The event arguments will be the conversation that was deleted.
	get OnConversationDeleted(): ISimpleEvent<IConversation>;

	/// Number of conversations that have been created.
	/// This value counts the number of active conversations, e.g. conversations
	///   that have been created and have not been deleted.
	get Count(): number;
}
