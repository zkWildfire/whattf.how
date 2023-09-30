import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";
import { IConversation } from "../../Conversations/Conversation";
import { IConversationsService } from "./ConversationsService";

/// Conversations service that doesn't persist conversations between page reloads.
export class TransientConversationsService implements IConversationsService
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

	/// Event that is fired when a conversation is selected.
	/// The event arguments will be the conversation that was selected.
	get OnConversationSelected(): ISimpleEvent<IConversation>
	{
		return this._onConversationSelected.asEvent();
	}

	/// Number of conversations that have been created.
	/// This value counts the number of active conversations, e.g. conversations
	///   that have been created and have not been deleted.
	get Count(): number
	{
		// TODO
		return 0;
	}

	/// Gets the conversations in the order they should appear on the UI.
	get Conversations(): IConversation[]
	{
		return this._conversations;
	}

	/// Gets the selected conversation, if any.
	get ActiveConversation(): IConversation | null
	{
		if (this._activeIndex === -1)
		{
			return null;
		}
		else
		{
			return this._conversations[this._activeIndex];
		}
	}

	/// Event dispatcher backing the `OnConversationCreated` event.
	private readonly _onConversationCreated =
		new SimpleEventDispatcher<IConversation>();

	/// Event dispatcher backing the `OnConversationDeleted` event.
	private readonly _onConversationDeleted =
		new SimpleEventDispatcher<IConversation>();

	/// Event dispatcher backing the `OnConversationSelected` event.
	private readonly _onConversationSelected =
		new SimpleEventDispatcher<IConversation>();

	/// List of all conversations that have been created.
	/// This list is ordered by the order that the conversations were created.
	private readonly _conversations: IConversation[] = [];

	/// Index of the active conversation in the `Conversations` property.
	/// If no conversation is active, this will be -1.
	private _activeIndex = -1;

	/// Adds a new conversation.
	/// @param conversation Conversation to add.
	/// @returns The index that the conversation was added at in the
	///   `Conversations` property.
	public AddConversation(conversation: IConversation): number
	{
		this._conversations.push(conversation);
		this._onConversationCreated.dispatch(conversation);
		return this._conversations.length - 1;
	}

	/// Deletes a conversation.
	/// @param conversation Conversation to delete. If this is a conversation
	///   object, it must be one of the conversations returned by the
	///   `Conversations` property. If this is a number, it must be an index
	///   into the `Conversations` property.
	/// @returns Whether the conversation was deleted.
	public DeleteConversation(conversation: IConversation | number): boolean
	{
		// If the conversation is an object, find its index
		if (typeof conversation !== "number")
		{
			conversation = this._conversations.indexOf(conversation);

			// If the conversation is not in the list, return false
			if (conversation === -1)
			{
				return false;
			}
		}

		// At this point, `conversation` is guaranteed to be a number
		// Verify that the index is a valid index
		if (conversation < 0 || conversation >= this._conversations.length)
		{
			return false;
		}

		// Delete the conversation
		const deletedConversation =
			this._conversations.splice(conversation, 1)[0];
		this._onConversationDeleted.dispatch(deletedConversation);
		return true;
	}

	/// Selects the specified conversation as the active conversation.
	/// @param conversation Conversation to select. If this is a conversation
	///   object, it must be one of the conversations returned by the
	///   `Conversations` property. If this is a number, it must be an index
	///   into the `Conversations` property.
	public SelectConversation(conversation: IConversation | number): void
	{
		// If the conversation is an object, find its index
		if (typeof conversation !== "number")
		{
			conversation = this._conversations.indexOf(conversation);
			if (conversation === -1)
			{
				throw new Error("Conversation not found");
			}
		}

		// At this point, `conversation` is guaranteed to be a number
		// Verify that the index is a valid index
		if (conversation < 0 || conversation >= this._conversations.length)
		{
			throw new Error("Invalid conversation index");
		}

		// Set the active conversation
		this._activeIndex = conversation;
		this._onConversationSelected.dispatch(this._conversations[conversation]);
	}
}
