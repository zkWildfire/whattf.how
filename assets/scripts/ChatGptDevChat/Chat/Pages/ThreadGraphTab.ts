import { IPage } from "./Page";
import { IThreadSessionService } from "../Services/Sessions/ThreadSessionService";
import { IPageElementLocator } from "../../Util/PageElementLocator";
import { EPageUrl } from "./PageUrl";
import { IConversationSessionService } from "../Services/Sessions/ConversationSessionService";
import { IConversation } from "../Conversations/Conversation";
import { IMessage } from "../Messages/Message";
import assert from "assert";
import { ERole } from "../Role";
import { ILlm } from "../LLMs/Llm";

/// Tab that displays the conversation graph for the current conversation.
export class ThreadGraphTab extends IPage
{
	/// Service used to get the active conversation from.
	private readonly _conversationSessionService: IConversationSessionService;

	/// Service used to get the active thread from.
	private readonly _threadSessionService: IThreadSessionService;

	/// Page elements used by the tab.
	private readonly _pageElements = new ThreadGraphPageElements();

	/// Component used to manage the status bar.
	private readonly _statusBar: StatusBar;

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
		this._statusBar = new StatusBar(new StatusBarPageElements());
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
			this._statusBar.SetConversation(activeConversation);
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

/// Helper class for locating status bar elements.
class StatusBarPageElements extends IPageElementLocator
{
	/// Gets the title element for the thread graph tab.
	get ThreadGraphTabTitle(): HTMLHeadingElement
	{
		return this.GetElementById<HTMLHeadingElement>(
			StatusBarPageElements.ID_TAB_TITLE
		);
	}

	/// Gets the total number of messages element.
	get TotalMessages(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			StatusBarPageElements.ID_TOTAL_MESSAGES
		);
	}

	/// Gets the total number of threads element.
	get TotalThreads(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			StatusBarPageElements.ID_TOTAL_THREADS
		);
	}

	/// ID of the title element for the thread graph tab.
	private static readonly ID_TAB_TITLE = "graph-title";

	/// ID of the total number of messages element.
	private static readonly ID_TOTAL_MESSAGES = "graph-total-messages";

	/// ID of the total number of threads element.
	private static readonly ID_TOTAL_THREADS = "graph-total-threads";

	/// Initializes the class.
	constructor()
	{
		super([
			StatusBarPageElements.ID_TAB_TITLE,
			StatusBarPageElements.ID_TOTAL_MESSAGES,
			StatusBarPageElements.ID_TOTAL_THREADS
		]);
	}
}

/// Class used to manage the status bar for the thread graph tab.
class StatusBar
{
	/// Page elements used by the class.
	private readonly _pageElements: StatusBarPageElements;

	/// Initializes the class.
	/// @param pageElements Page elements used by the class.
	constructor(pageElements: StatusBarPageElements)
	{
		this._pageElements = pageElements;
	}

	/// Sets the conversation to display in the status bar.
	/// @param conversation Conversation to display.
	public SetConversation(conversation: IConversation)
	{
		// Set the conversation's name
		this._pageElements.ThreadGraphTabTitle.innerText =
			conversation.Name;

		// Set the number of messages
		this._pageElements.TotalMessages.innerText =
			conversation.MessageCount.toString();

		// Set the number of threads
		this._pageElements.TotalThreads.innerText =
			conversation.Threads.length.toString();
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
		this.AttachMessageToNode(
			conversation.RootMessage,
			conversation.Llm,
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
	/// @param llm LLM that the conversation is using.
	/// @param node Node to attach the message to.
	private AttachMessageToNode(
		message: IMessage,
		llm: ILlm,
		node: HTMLUListElement)
	{
		// Get the message's text by paragraphs
		const messageParagraphs = message.Contents.split("\n\n");

		// Create the message node
		const messageListNode = document.createElement("li");
		messageListNode.classList.add("tree-node");
		const messageContainer = document.createElement("div");
		messageContainer.classList.add("message-container");
		messageListNode.appendChild(messageContainer);

		// Create the title bar
		const titleBar = document.createElement("div");
		titleBar.classList.add(
			"d-flex",
			"justify-content-between",
			"align-items-center",
			"border-bottom",
			"border-secondary",
			"ps-3",
			"message-title-bar"
		);
		messageContainer.appendChild(titleBar);
		const senderName = document.createElement("span");
		switch (message.Role)
		{
		case ERole.Assistant:
			senderName.innerText = llm.DisplayNameShort;
			break;
		case ERole.User:
			senderName.innerText = "You";
			break;
		case ERole.System:
			senderName.innerText = "System";
			break;
		default:
			assert.fail("Invalid role");
		}
		titleBar.appendChild(senderName);

		// Add the buttons for the message
		const buttonContainer = document.createElement("div");
		titleBar.appendChild(buttonContainer);

		// If the message is from the LLM, add a button for branching the thread
		if (message.Role === ERole.Assistant)
		{
			const branchButton = document.createElement("button");
			branchButton.classList.add(
				"btn",
				"btn-outline-primary",
				"rounded-0",
				"border-0"
			);
			buttonContainer.appendChild(branchButton);

			const branchIcon = document.createElement("i");
			branchIcon.classList.add(
				"bi",
				"bi-arrows-expand-vertical",
				"me-2"
			);
			branchButton.appendChild(branchIcon);

			const buttonText = document.createElement("span");
			buttonText.innerText = "Branch";
			branchButton.appendChild(buttonText);
		}
		else
		{
			// If the message is from any other role, add a button for viewing
			//   the message's thread
			const viewButton = document.createElement("button");
			viewButton.classList.add(
				"btn",
				"btn-outline-primary",
				"rounded-0",
				"border-0"
			);
			buttonContainer.appendChild(viewButton);

			const viewIcon = document.createElement("i");
			viewIcon.classList.add(
				"bi",
				"bi-eye-fill",
				"me-2"
			);
			viewButton.appendChild(viewIcon);

			const buttonText = document.createElement("span");
			buttonText.innerText = "View";
			viewButton.appendChild(buttonText);
		}

		// Display the message's text
		const messageTextElement = document.createElement("p");
		messageTextElement.classList.add(
			"px-3",
			"my-2",
			"text-start"
		);
		messageTextElement.innerText = messageParagraphs[0];
		messageContainer.appendChild(messageTextElement);

		// If the message has more paragraphs, add an element that lists the
		//   number of remaining paragraphs
		if (messageParagraphs.length > 1)
		{
			const remainingParagraphsElement = document.createElement("p");
			remainingParagraphsElement.classList.add(
				"px-3",
				"my-2",
				"text-start",
				"text-muted"
			);
			remainingParagraphsElement.innerText =
				`+${messageParagraphs.length - 1} more paragraph(s)`;
			messageContainer.appendChild(remainingParagraphsElement);
		}

		// If the node has any child nodes, create a container for the child
		//   nodes
		if (message.Children.length > 0)
		{
			const childNodeContainer = document.createElement("ul");
			messageListNode.appendChild(childNodeContainer);

			// Attach the child nodes
			for (const childMessage of message.Children)
			{
				this.AttachMessageToNode(
					childMessage,
					llm,
					childNodeContainer
				);
			}
		}

		// Attach the message node to the parent node
		node.appendChild(messageListNode);
	}
}
