import { ISimpleEvent } from "strongly-typed-events";
import { IConversation } from "../../Conversations/Conversation";

/// Service that keeps track of all conversations created by the user.
export interface IConversationsService
{
	/// Event that is fired when a conversation is created.
	/// The event arguments will be the conversation that was created.
	get OnConversationCreated(): ISimpleEvent<IConversation>;

	/// Event that is fired when a conversation is deleted.
	/// The event arguments will be the conversation that was deleted.
	get OnConversationDeleted(): ISimpleEvent<IConversation>;

	/// Event that is fired when a conversation is selected.
	/// The event arguments will be the conversation that was selected.
	get OnConversationSelected(): ISimpleEvent<IConversation>;

	/// Number of conversations that have been created.
	/// This value counts the number of active conversations, e.g. conversations
	///   that have been created and have not been deleted.
	get Count(): number;

	/// Gets the conversations in the order they should appear on the UI.
	get Conversations(): IConversation[];

	/// Gets the selected conversation, if any.
	get ActiveConversation(): IConversation | null;

	/// Adds a new conversation.
	/// @param conversation Conversation to add.
	/// @returns The index that the conversation was added at in the
	///   `Conversations` property.
	AddConversation(conversation: IConversation): number;

	/// Deletes a conversation.
	/// @param conversation Conversation to delete. If this is a conversation
	///   object, it must be one of the conversations returned by the
	///   `Conversations` property. If this is a number, it must be an index
	///   into the `Conversations` property.
	/// @returns Whether the conversation was deleted.
	DeleteConversation(conversation: IConversation | number): boolean;

	/// Selects the specified conversation as the active conversation.
	/// @param conversation Conversation to select. If this is a conversation
	///   object, it must be one of the conversations returned by the
	///   `Conversations` property. If this is a number, it must be an index
	///   into the `Conversations` property.
	SelectConversation(conversation: IConversation | number): void;
}
