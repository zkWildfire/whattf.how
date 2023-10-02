import { IPage } from "./Page";
import { IThreadSessionService } from "../Services/Sessions/ThreadSessionService";
import { IPageElementLocator } from "../../Util/PageElementLocator";
import { IMessage } from "../Messages/Message";
import { EPageUrl } from "./PageUrl";
import { IConversationSessionService } from "../Services/Sessions/ConversationSessionService";

/// Tab that displays the conversation graph for the current conversation.
export class ThreadGraphTab extends IPage
{
	/// Service used to get the active conversation from.
	private readonly _conversationSessionService: IConversationSessionService;

	/// Service used to get the active thread from.
	private readonly _threadSessionService: IThreadSessionService;

	/// Page elements used by the tab.
	private readonly _pageElements = new ThreadGraphPageElements();

	/// Initializes the tab.
	/// @param conversationSessionService Service used to get the active
	///   conversation from.
	/// @param threadSessionService Service used to get the active thread from.
	constructor(
		conversationSessionService: IConversationSessionService,
		threadSessionService: IThreadSessionService)
	{
		super(EPageUrl.ThreadGraph);
		this._conversationSessionService = conversationSessionService;
		this._threadSessionService = threadSessionService;
	}

	/// Displays the tab.
	public Show(): void
	{
		this._pageElements.ThreadGraphTab.classList.remove("d-none");
		this._onShow.dispatch(this);
	}

	/// Hides the tab.
	public Hide(): void
	{
		this._pageElements.ThreadGraphTab.classList.add("d-none");
		this._onHide.dispatch(this);
	}
}

/// Helper class for locating key page elements.
class ThreadGraphPageElements extends IPageElementLocator
{
	/// Gets the main container element for the thread graph tab.
	get ThreadGraphTab(): HTMLDivElement
	{
		return this.GetElementById<HTMLDivElement>(
			ThreadGraphPageElements.ID_TAB_CONTAINER
		);
	}

	/// ID of the container element for the thread graph tab.
	private static readonly ID_TAB_CONTAINER = "tab-graph";

	/// Initializes the class.
	constructor()
	{
		super([
			ThreadGraphPageElements.ID_TAB_CONTAINER
		]);
	}
}
