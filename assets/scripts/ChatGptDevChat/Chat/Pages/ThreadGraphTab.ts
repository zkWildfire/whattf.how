import { IPage } from "./Page";
import { IThreadSessionService } from "../Services/Sessions/ThreadSessionService";
import { IPageElementLocator } from "../../Util/PageElementLocator";
import { EPageUrl } from "./PageUrl";
import { IConversationSessionService } from "../Services/Sessions/ConversationSessionService";
import { IConversation } from "../Conversations/Conversation";
import { IMessage } from "../Messages/Message";
import assert from "assert";

/// Tab that displays the conversation graph for the current conversation.
export class ThreadGraphTab extends IPage
{
	/// Service used to get the active conversation from.
	private readonly _conversationSessionService: IConversationSessionService;

	/// Service used to get the active thread from.
	private readonly _threadSessionService: IThreadSessionService;

	/// Page elements used by the tab.
	private readonly _pageElements = new ThreadGraphPageElements();

	/// Component used to handle the graph.
	private readonly _threadGraph: ThreadGraph;

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
		this._threadGraph = new ThreadGraph(this._pageElements);
	}

	/// Displays the tab.
	public Show(): void
	{
		// If an active conversation exists, display it
		const activeConversation =
			this._conversationSessionService.ActiveConversation;
		console.log("Showing thread graph tab");
		if (activeConversation !== null)
		{
			console.log("Active conversation exists");
			this._pageElements.ThreadGraphTabTitle.innerText =
				activeConversation.Name;
			this._threadGraph.SetConversation(activeConversation);
		}

		// Show the tab
		this._pageElements.ThreadGraphTab.classList.remove("d-none");
		this._pageElements.ThreadGraphTab.classList.add("d-flex");
		this._pageElements.ThreadGraphTab.classList.add("flex-fill");
		this._onShow.dispatch(this);
	}

	/// Hides the tab.
	public Hide(): void
	{
		// Hide the tab
		this._pageElements.ThreadGraphTab.classList.add("d-none");
		this._pageElements.ThreadGraphTab.classList.remove("d-flex");
		this._pageElements.ThreadGraphTab.classList.remove("flex-fill");
		this._onHide.dispatch(this);

		// Clear the tab's contents
		this._pageElements.ThreadGraphTabTitle.innerText = "";
		this._threadGraph.Clear();
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

	/// Gets the title element for the thread graph tab.
	get ThreadGraphTabTitle(): HTMLHeadingElement
	{
		return this.GetElementById<HTMLHeadingElement>(
			ThreadGraphPageElements.ID_TAB_TITLE
		);
	}

	/// Gets the container element for the thread graph itself.
	get ThreadGraphContainer(): HTMLDivElement
	{
		return this.GetElementById<HTMLDivElement>(
			ThreadGraphPageElements.ID_THREAD_GRAPH_CONTAINER
		);
	}

	/// ID of the container element for the thread graph tab.
	private static readonly ID_TAB_CONTAINER = "tab-graph";

	/// ID of the title element for the thread graph tab.
	private static readonly ID_TAB_TITLE = "graph-title";

	/// ID of the container element for the thread graph itself.
	private static readonly ID_THREAD_GRAPH_CONTAINER =
		"thread-graph-container";

	/// Initializes the class.
	constructor()
	{
		super([
			ThreadGraphPageElements.ID_TAB_CONTAINER,
			ThreadGraphPageElements.ID_TAB_TITLE,
			ThreadGraphPageElements.ID_THREAD_GRAPH_CONTAINER
		]);
	}
}

/// Class used to manage the thread graph itself.
class ThreadGraph
{
	/// Page elements used by the class.
	private readonly _pageElements: ThreadGraphPageElements;

	/// Initializes the class.
	/// @param pageElements Page elements used by the class.
	constructor(pageElements: ThreadGraphPageElements)
	{
		this._pageElements = pageElements;
	}

	/// Clears all nodes from the graph.
	public Clear()
	{
		this._pageElements.ThreadGraphContainer.innerHTML = "";
	}

	/// Replaces the graph's contents with the conversation's messages.
	/// @param conversation Conversation to display.
	public SetConversation(conversation: IConversation)
	{
		// Create the root node
		const rootNode = document.createElement("ul");
		rootNode.classList.add("tree");
		ThreadGraph.AttachMessageToNode(
			conversation.RootMessage,
			rootNode
		);

		// Attach the root node to the graph
		this._pageElements.ThreadGraphContainer.innerHTML = "";
		this._pageElements.ThreadGraphContainer.appendChild(rootNode);
	}

	/// Generates and attaches a message to the graph.
	/// This method will attach the message and all of its child messages
	///   recursively.
	/// @param message Message to attach.
	/// @param node Node to attach the message to.
	private static AttachMessageToNode(
		message: IMessage,
		node: HTMLUListElement)
	{
		// Get the text to display in the node
		const messageFirstParagraph = message.Contents.split("\n")[0];
		let messageText = messageFirstParagraph.substring(
			0,
			Math.min(20, messageFirstParagraph.length)
		);
		if (messageFirstParagraph.length > messageText.length)
		{
			messageText += "...";
		}

		// Create the message node
		const messageNode = document.createElement("li");
		const messageTextNode = document.createElement("span");
		messageTextNode.innerText = messageText;
		messageNode.appendChild(messageTextNode);

		// If the node has any child nodes, create a container for the child
		//   nodes
		if (message.Children.length > 0)
		{
			const childNodeContainer = document.createElement("ul");
			messageNode.appendChild(childNodeContainer);

			// Attach the child nodes
			for (const childMessage of message.Children)
			{
				ThreadGraph.AttachMessageToNode(
					childMessage,
					childNodeContainer
				);
			}
		}

		// Attach the message node to the parent node
		node.appendChild(messageNode);
	}
}
