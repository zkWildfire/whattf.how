import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";
import { IChatThread } from "../../Threads/ChatThread";
import { IThreadSessionService } from "./ThreadSessionService";
import { IConversationSessionService } from "./ConversationSessionService";
import { IConversation } from "../../Conversations/Conversation";

/// Default implementation of the `IThreadSessionService` interface.
export class DefaultThreadSessionService implements IThreadSessionService
{
	/// Event that is fired when the active thread changes.
	get OnThreadChanged(): ISimpleEvent<IChatThread | null>
	{
		return this._onThreadChanged.asEvent();
	}

	/// The currently active thread, if any.
	get ActiveThread(): IChatThread | null
	{
		return this._activeThread;
	}

	/// Sets the active thread.
	/// If the thread is already active, this will be a no-op.
	set ActiveThread(value: IChatThread | null)
	{
		if (this._activeThread === value)
		{
			return;
		}

		// If the thread is not null, make sure it's from the current
		//   conversation
		if (value !== null &&
			value.RootMessage !== this._conversation?.RootMessage)
		{
			throw new Error(
				"Cannot set the active thread to a thread from another " +
				"conversation."
			);
		}

		this._activeThread = value;
		this._onThreadChanged.dispatch(value);
	}

	/// Dispatcher backing the `OnThreadChanged` event.
	private readonly _onThreadChanged =
		new SimpleEventDispatcher<IChatThread | null>();

	/// Tracks the currently active conversation.
	/// @invariant If this is null, then `_activeThread` is also null.
	private _conversation: IConversation | null = null;

	/// Field backing the `ActiveThread` property.
	/// @invariant If this is null, then `_conversation` is also null.
	private _activeThread: IChatThread | null = null;

	/// Initializes the service.
	/// @param conversationSessionService The conversation session service for
	///   the dev chat.
	constructor(conversationSessionService: IConversationSessionService)
	{
		conversationSessionService.OnConversationChanged.subscribe(
			this.OnConversationChanged.bind(this)
		);
	}

	/// Handles the `OnConversationChanged` event from the conversation session.
	/// This will update the active thread to the first thread in the new
	///   conversation.
	/// @param conversation The new active conversation.
	private OnConversationChanged(conversation: IConversation | null): void
	{
		this._conversation = conversation;
		this.ActiveThread = conversation?.Threads[0] ?? null;
	}
}
