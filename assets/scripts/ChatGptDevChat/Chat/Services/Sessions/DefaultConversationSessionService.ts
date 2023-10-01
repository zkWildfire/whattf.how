import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";
import { IConversation } from "../../Conversations/Conversation";
import { IConversationSessionService } from "./ConversationSessionService";

/// Default implementation of the `IConversationSessionService` interface.
export class DefaultConversationSessionService implements IConversationSessionService
{
	/// Event that is fired when the active conversation changes.
	/// The event argument is the new active conversation, or null if there is
	///   no active conversation.
	get OnConversationChanged(): ISimpleEvent<IConversation | null>
	{
		return this._onConversationChanged.asEvent();
	}

	/// The currently active conversation, if any.
	get ActiveConversation(): IConversation | null
	{
		return this._activeConversation;
	}

	/// Sets the active conversation.
	/// If the conversation is already active, this will be a no-op.
	set ActiveConversation(value: IConversation | null)
	{
		if (this._activeConversation === value)
		{
			return;
		}

		this._activeConversation = value;
		this._onConversationChanged.dispatch(value);
	}

	/// Dispatcher backing the `OnConversationChanged` event.
	private readonly _onConversationChanged =
		new SimpleEventDispatcher<IConversation | null>();

	/// Field backing the `ActiveConversation` property.
	private _activeConversation: IConversation | null = null;
}
