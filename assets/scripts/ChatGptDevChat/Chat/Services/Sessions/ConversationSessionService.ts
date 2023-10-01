import { ISimpleEvent } from "strongly-typed-events";
import { IConversation } from "../../Conversations/Conversation";

/// Interface for classes that keep track of the currently active conversation.
export interface IConversationSessionService
{
	/// Event that is fired when the active conversation changes.
	/// The event argument is the new active conversation, or null if there is
	///   no active conversation.
	get OnConversationChanged(): ISimpleEvent<IConversation | null>;

	/// The currently active conversation, if any.
	get ActiveConversation(): IConversation | null;

	/// Sets the active conversation.
	/// If the conversation is already active, this will be a no-op.
	set ActiveConversation(value: IConversation | null);
}
