import { IPage } from "./Page";
import { IThreadSessionService } from "../Services/Sessions/ThreadSessionService";
import { IPageElementLocator } from "../../Util/PageElementLocator";
import { IMessage } from "../Messages/Message";
import { EPageUrl } from "./PageUrl";
import { IChatThread } from "../Threads/ChatThread";
import { ERole } from "../Role";

/// Tab that displays messages from the current thread.
export class ChatTab extends IPage
{
	/// Service used to get the active thread from.
	private readonly _threadSessionService: IThreadSessionService;

	/// Page elements used by the tab.
	private readonly _pageElements = new ChatPageElements();

	/// Chat messages currently displayed.
	private readonly _messages: ChatMessage[] = [];

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
		// Populate the messages array
		const thread = this._threadSessionService.ActiveThread;
		if (thread)
		{
			this.GenerateMessageElement(thread.LastMessage);
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
	}

	/// Recursively invoked method used to generate message elements.
	/// @param message Message to generate an element for.
	private GenerateMessageElement(message: IMessage | null): void
	{
		// Walk up the chain of messages to the root message
		// This is done so that the chain of messages that leads to the thread's
		//   current message is "stored" by the recursive method calls rather
		//   that requiring a separate data structure
		if (!message)
		{
			return;
		}
		this.GenerateMessageElement(message.Parent);

		// Generate the message element
		const messageElement = new ChatMessage(
			this._pageElements.MessageContainer,
			message,
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
	/// @param container Container to generate the message's elements in.
	/// @param message Message to display.
	/// @param index Index of the message in the thread. This will be a
	///   0-indexed value.
	constructor(
		container: HTMLDivElement,
		message: IMessage,
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
			senderElement.innerText = "LLM";
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
