import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";
import { IConversation } from "../../Conversations/Conversation";
import { IConversationsService } from "./ConversationsService";

/// Service that keeps track of conversations with OpenAI LLMs.
export class OpenAiConversationsService implements IConversationsService
{
	/// Event that is fired when a conversation is created.
	/// The event arguments will be the conversation that was created.
	get OnConversationCreated(): ISimpleEvent<IConversation>
	{
		return this._onConversationCreated.asEvent();
	}

	/// Event that is fired when a conversation is deleted.
	/// The event arguments will be the conversation that was deleted.
	get OnConversationDeleted(): ISimpleEvent<IConversation>
	{
		return this._onConversationDeleted.asEvent();
	}

	/// Number of conversations that have been created.
	/// This value counts the number of active conversations, e.g. conversations
	///   that have been created and have not been deleted.
	get Count(): number
	{
		// TODO
		return 0;
	}

	/// Event dispatcher backing the `OnConversationCreated` event.
	private readonly _onConversationCreated =
		new SimpleEventDispatcher<IConversation>();

	/// Event dispatcher backing the `OnConversationDeleted` event.
	private readonly _onConversationDeleted =
		new SimpleEventDispatcher<IConversation>();
}
