import { IPage } from "./Page";
import { IThreadSessionService } from "../Services/Sessions/ThreadSessionService";
import { IPageElementLocator } from "../../Util/PageElementLocator";
import { IMessage } from "../Messages/Message";
import { EPageUrl } from "./PageUrl";

/// Tab that displays messages from the current thread.
export class ChatTab extends IPage
{
	/// Service used to get the active thread from.
	private readonly _threadSessionService: IThreadSessionService;

	/// Page elements used by the tab.
	private readonly _pageElements = new ChatPageElements();

	/// Initializes the tab.
	/// @param threadSessionService Service used to get the active thread from.
	constructor(threadSessionService: IThreadSessionService)
	{
		super(EPageUrl.Chat);
		this._threadSessionService = threadSessionService;
	}

	/// Displays the tab.
	public Show(): void
	{
		this._pageElements.ChatTab.classList.remove("d-none");
		this._pageElements.ChatTab.classList.add("d-flex");
		this._pageElements.ChatTab.classList.add("flex-fill");
		this._onShow.dispatch(this);
	}

	/// Hides the tab.
	public Hide(): void
	{
		this._pageElements.ChatTab.classList.add("d-none");
		this._pageElements.ChatTab.classList.remove("d-flex");
		this._pageElements.ChatTab.classList.remove("flex-fill");
		this._onHide.dispatch(this);
	}
}

/// Helper class for locating key page elements.
class ChatPageElements extends IPageElementLocator
{
	/// Gets the main container element for the chat tab.
	get ChatTab(): HTMLDivElement
	{
		return this.GetElementById<HTMLDivElement>(
			ChatPageElements.ID_TAB_CONTAINER
		);
	}

	/// ID of the container element for the chat tab.
	private static readonly ID_TAB_CONTAINER = "tab-chat";

	/// Initializes the class.
	constructor()
	{
		super([
			ChatPageElements.ID_TAB_CONTAINER
		]);
	}
}

/// Handles displaying a chat message in the UI.
class ChatMessage
{
	/// Message to display.
	private readonly _message: IMessage;

	/// Initializes the class.
	/// @param message Message to display.
	constructor(message: IMessage)
	{
		this._message = message;
	}
}
