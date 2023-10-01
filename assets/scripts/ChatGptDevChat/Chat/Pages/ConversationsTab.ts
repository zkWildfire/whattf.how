import { IPage } from "./Page";
import { IThreadSessionService } from "../Services/Sessions/ThreadSessionService";
import { IPageElementLocator } from "../../Util/PageElementLocator";
import { IMessage } from "../Messages/Message";
import { EPageUrl } from "./PageUrl";
import { IConversationSessionService } from "../Services/Sessions/ConversationSessionService";

/// Tab that displays available conversations.
export class ConversationsTab extends IPage
{
	/// Service used to get the active conversation from.
	private readonly _conversationSessionService: IConversationSessionService;

	/// Page elements used by the tab.
	private readonly _pageElements = new ConversationsPageElements();

	/// Initializes the tab.
	/// @param conversationSessionService Service used to get the active
	///   conversation from.
	constructor(
		conversationSessionService: IConversationSessionService)
	{
		super(EPageUrl.Conversations);
		this._conversationSessionService = conversationSessionService;

		// Bind to the new conversation button's events
		this._pageElements.NewConversationButton.addEventListener("click", () =>
		{
			this._onRedirect.dispatch(EPageUrl.NewConversation);
		});
	}

	/// Displays the tab.
	public Show(): void
	{
		this._pageElements.ConversationsTab.classList.remove("d-none");
		this._pageElements.ConversationsTab.classList.add("d-flex");
		this._pageElements.ConversationsTab.classList.add("flex-fill");
		this._onShow.dispatch(this);
	}

	/// Hides the tab.
	public Hide(): void
	{
		this._pageElements.ConversationsTab.classList.add("d-none");
		this._pageElements.ConversationsTab.classList.remove("d-flex");
		this._pageElements.ConversationsTab.classList.remove("flex-fill");
		this._onHide.dispatch(this);
	}
}

/// Helper class for locating key page elements.
class ConversationsPageElements extends IPageElementLocator
{
	/// Gets the main container element for the conversations tab.
	get ConversationsTab(): HTMLDivElement
	{
		return this.GetElementById<HTMLDivElement>(
			ConversationsPageElements.ID_TAB_CONTAINER
		);
	}

	/// Gets the create new conversation button.
	get NewConversationButton(): HTMLButtonElement
	{
		return this.GetElementById<HTMLButtonElement>(
			ConversationsPageElements.ID_NEW_CONVERSATION_BUTTON
		);
	}

	/// ID of the container element for the conversations tab.
	private static readonly ID_TAB_CONTAINER = "tab-conversations";

	/// ID of the create new conversation button
	private static readonly ID_NEW_CONVERSATION_BUTTON = "button-new-conversation";

	/// Initializes the class.
	constructor()
	{
		super([
			ConversationsPageElements.ID_TAB_CONTAINER,
			ConversationsPageElements.ID_NEW_CONVERSATION_BUTTON
		]);
	}
}
