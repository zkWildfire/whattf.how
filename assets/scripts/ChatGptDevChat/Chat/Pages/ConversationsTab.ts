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

	/// ID of the container element for the conversations tab.
	private static readonly ID_TAB_CONTAINER = "tab-conversations";

	/// Initializes the class.
	constructor()
	{
		super([
			ConversationsPageElements.ID_TAB_CONTAINER
		]);
	}
}
