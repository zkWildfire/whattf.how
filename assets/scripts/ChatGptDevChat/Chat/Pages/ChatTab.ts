import { IPage } from "./Page";
import { IThreadSessionService } from "../Services/Sessions/ThreadSessionService";
import { IPageElementLocator } from "../../Util/PageElementLocator";
import { IMessage } from "../Messages/Message";
import { EPageUrl } from "./PageUrl";
import { IChatThread } from "../Threads/ChatThread";
import { ERole } from "../Role";
import { IConversationSessionService } from "../Services/Sessions/ConversationSessionService";
import { ILlm } from "../LLMs/Llm";
import { IConversation } from "../Conversations/Conversation";
import assert from "assert";

/// Tab that displays messages from the current thread.
export class ChatTab extends IPage
{
	/// Service used to get the active conversation from.
	private readonly _conversationSessionService: IConversationSessionService;

	/// Service used to get the active thread from.
	private readonly _threadSessionService: IThreadSessionService;

	/// Page elements used by the tab.
	private readonly _pageElements = new ChatPageElements();

	/// Chat messages currently displayed.
	private readonly _messages: ChatMessage[] = [];

	/// Component that manages the status bar.
	private readonly _statusBar: ChatStatusBar;

	/// Initializes the tab.
	/// @param conversationSessionService Service used to get the active
	///   conversation from.
	/// @param threadSessionService Service used to get the active thread from.
	constructor(
		conversationSessionService: IConversationSessionService,
		threadSessionService: IThreadSessionService)
	{
		super(EPageUrl.Chat);
		this._conversationSessionService = conversationSessionService;
		this._threadSessionService = threadSessionService;
		this._statusBar = new ChatStatusBar();
	}

	/// Displays the tab.
	public Show(): void
	{
		// Populate the messages array
		const thread = this._threadSessionService.ActiveThread;
		if (thread)
		{
			const conversation =
				this._conversationSessionService.ActiveConversation;
			assert(conversation !== null);
			this.GenerateMessageElement(conversation, thread.LastMessage);
			this._statusBar.Thread = thread;
		}

		// Display the tab
		this._pageElements.ChatTab.classList.remove("d-none");
		this._pageElements.ChatTab.classList.add(
			"d-flex",
			"flex-fill"
		);
		this._onShow.dispatch(this);
	}

	/// Hides the tab.
	public Hide(): void
	{
		this._pageElements.ChatTab.classList.add("d-none");
		this._pageElements.ChatTab.classList.remove(
			"d-flex",
			"flex-fill"
		);
		this._onHide.dispatch(this);

		// Clear the messages array
		for (const message of this._messages)
		{
			message.Remove();
		}
		this._statusBar.Thread = null;
	}

	/// Recursively invoked method used to generate message elements.
	/// @param conversation Conversation that the message is from.
	/// @param message Message to generate an element for.
	private GenerateMessageElement(
		conversation: IConversation,
		message: IMessage | null): void
	{
		// Walk up the chain of messages to the root message
		// This is done so that the chain of messages that leads to the thread's
		//   current message is "stored" by the recursive method calls rather
		//   that requiring a separate data structure
		if (!message)
		{
			return;
		}
		this.GenerateMessageElement(conversation, message.Parent);

		// Generate the message element
		const messageElement = new ChatMessage(
			message,
			conversation.Llm,
			this._pageElements.MessageContainer,
			this._messages.length
		);
		this._messages.push(messageElement);
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

	/// Gets the container element for all messages.
	get MessageContainer(): HTMLDivElement
	{
		return this.GetElementById<HTMLDivElement>(
			ChatPageElements.ID_MESSAGE_CONTAINER
		);
	}

	/// ID of the container element for the chat tab.
	private static readonly ID_TAB_CONTAINER = "tab-chat";

	/// ID of the container element for all messages.
	private static readonly ID_MESSAGE_CONTAINER = "chat-messages";

	/// Initializes the class.
	constructor()
	{
		super([
			ChatPageElements.ID_TAB_CONTAINER,
			ChatPageElements.ID_MESSAGE_CONTAINER
		]);
	}
}

/// Helper class for finding status bar page elements.
class ChatStatusBarElements extends IPageElementLocator
{
	/// Gets the element that displays the total tokens in the thread.
	get ThreadTokens(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			ChatStatusBarElements.ID_THREAD_TOKENS
		);
	}

	/// Gets the element that displays the outbound tokens used by the thread.
	get ThreadOutboundTokens(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			ChatStatusBarElements.ID_THREAD_OUTBOUND_TOKENS
		);
	}

	/// Gets the element that displays the inbound tokens used by the thread.
	get ThreadInboundTokens(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			ChatStatusBarElements.ID_THREAD_INBOUND_TOKENS
		);
	}

	/// Gets the element that displays the total cost of the thread.
	get ThreadCost(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			ChatStatusBarElements.ID_THREAD_COST
		);
	}

	/// Gets the element that displays the outbound cost of the thread.
	get ThreadOutboundCost(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			ChatStatusBarElements.ID_THREAD_OUTBOUND_COST
		);
	}

	/// Gets the element that displays the inbound cost of the thread.
	get ThreadInboundCost(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			ChatStatusBarElements.ID_THREAD_INBOUND_COST
		);
	}

	/// ID for the element that displays the total tokens in the thread.
	private static readonly ID_THREAD_TOKENS = "thread-total-tokens";

	/// ID for the element that displays the outbound tokens used by the thread.
	private static readonly ID_THREAD_OUTBOUND_TOKENS =
		"thread-outbound-tokens";

	/// ID for the element that displays the inbound tokens used by the thread.
	private static readonly ID_THREAD_INBOUND_TOKENS =
		"thread-inbound-tokens";

	/// ID for the element that displays the total cost of the thread.
	private static readonly ID_THREAD_COST = "thread-total-cost";

	/// ID for the element that displays the outbound cost of the thread.
	private static readonly ID_THREAD_OUTBOUND_COST =
		"thread-outbound-cost";

	/// ID for the element that displays the inbound cost of the thread.
	private static readonly ID_THREAD_INBOUND_COST =
		"thread-inbound-cost";

	/// Initializes the class.
	constructor()
	{
		super([
			ChatStatusBarElements.ID_THREAD_TOKENS,
			ChatStatusBarElements.ID_THREAD_OUTBOUND_TOKENS,
			ChatStatusBarElements.ID_THREAD_INBOUND_TOKENS,
			ChatStatusBarElements.ID_THREAD_COST,
			ChatStatusBarElements.ID_THREAD_OUTBOUND_COST,
			ChatStatusBarElements.ID_THREAD_INBOUND_COST
		]);
	}
}

/// Manages the status bar for the chat tab.
class ChatStatusBar
{
	/// Thread to display the status of.
	get Thread(): IChatThread | null
	{
		return this._thread;
	}

	/// Switches the status bar to a new thread.
	set Thread(value: IChatThread | null)
	{
		this._thread = value;
		this.Update();
	}

	/// Page elements in the status bar.
	private readonly _pageElements = new ChatStatusBarElements();

	/// Thread to display the status of.
	private _thread: IChatThread | null = null;

	/// Updates the status bar.
	private Update(): void
	{
		// Update the total token count
		const totalTokens = this._thread?.TotalTokenCount ?? 0;
		this._pageElements.ThreadTokens.innerText = totalTokens.toString();

		// Update the outbound token count
		const outboundTokens = this._thread?.OutboundTokenCount ?? 0;
		this._pageElements.ThreadOutboundTokens.innerText =
			outboundTokens.toString();

		// Update the inbound token count
		const inboundTokens = this._thread?.InboundTokenCount ?? 0;
		this._pageElements.ThreadInboundTokens.innerText =
			inboundTokens.toString();

		// Update the total cost
		const totalCost = this._thread?.TotalCost ?? 0;
		this._pageElements.ThreadCost.innerText =
			`$${totalCost.toFixed(2)}`;

		// Update the outbound cost
		const outboundCost = this._thread?.OutboundCost ?? 0;
		this._pageElements.ThreadOutboundCost.innerText =
			`$${outboundCost.toFixed(2)}`;

		// Update the inbound cost
		const inboundCost = this._thread?.InboundCost ?? 0;
		this._pageElements.ThreadInboundCost.innerText =
			`$${inboundCost.toFixed(2)}`;
	}
}

/// Handles displaying a chat message in the UI.
class ChatMessage
{
	/// Message to display.
	private readonly _message: IMessage;

	/// Index of the message in the thread. This will be a 0-indexed value.
	private readonly _index: number;

	/// Container element for the generated message elements.
	private readonly _container: HTMLDivElement;

	/// Initializes the class.
	/// @param message Message to display.
	/// @param llm LLM used by the message.
	/// @param container Container to generate the message's elements in.
	/// @param index Index of the message in the thread. This will be a
	///   0-indexed value.
	constructor(
		message: IMessage,
		llm: ILlm,
		container: HTMLDivElement,
		index: number)
	{
		this._message = message;
		this._index = index;

		// Create the container element for the message
		this._container = document.createElement("div");
		this._container.classList.add(
			"row",
			"py-3",
			"pb-3"
		);
		container.appendChild(this._container);

		// Create the sender column
		const senderColumn = document.createElement("div");
		senderColumn.classList.add(
			"col-2",
			"d-flex",
			"flex-column",
			"align-items-center"
		);
		this._container.appendChild(senderColumn);

		// Create the sender element
		const senderElement = document.createElement("h5");
		senderElement.classList.add(
			"mt-2",
			"mb-0"
		);
		switch (message.Role)
		{
		case ERole.System:
			senderElement.innerText = "System";
			break;
		case ERole.Assistant:
			senderElement.innerText = llm.DisplayNameShort;
			break;
		case ERole.User:
			senderElement.innerText = "You";
			break;
		}
		senderColumn.appendChild(senderElement);

		// Create the index element
		const indexElement = document.createElement("small");
		indexElement.classList.add(
			"text-muted"
		);
		indexElement.innerText = `#${index + 1}`;
		senderColumn.appendChild(indexElement);

		// Create an element for the number of tokens in the message
		const tokenCountElement = document.createElement("small");
		tokenCountElement.classList.add(
			"text-muted"
		);
		const tokens = message.MessageTokenCountActual;
		tokenCountElement.innerText = `${tokens} tokens`;
		senderColumn.appendChild(tokenCountElement);

		// Create an element for the cost of the message
		const costElement = document.createElement("small");
		costElement.classList.add(
			"text-muted"
		);
		const rate = message.Role === ERole.Assistant
			? llm.OutboundCost
			: llm.InboundCost;
		const cost = rate * tokens / 1000.0;
		costElement.innerText = `$${cost.toFixed(2)}`;
		senderColumn.appendChild(costElement);

		// Create the message column
		const messageColumn = document.createElement("div");
		messageColumn.classList.add(
			"col"
		);
		this._container.appendChild(messageColumn);

		// Split the message into paragraphs
		const paragraphs = message.Contents.split("\n\n");
		for (const paragraph of paragraphs)
		{
			// Create the paragraph element
			const paragraphElement = document.createElement("p");
			paragraphElement.innerText = paragraph;
			messageColumn.appendChild(paragraphElement);
		}
	}

	/// Removes the message from the UI.
	public Remove(): void
	{
		this._container.remove();
	}
}
