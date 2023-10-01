import { IPage } from "./Page";
import { IThreadSessionService } from "../Services/Sessions/ThreadSessionService";
import { IPageElementLocator } from "../../Util/PageElementLocator";
import { IMessage } from "../Messages/Message";
import { EPageUrl } from "./PageUrl";
import { IConversationSessionService } from "../Services/Sessions/ConversationSessionService";
import { IConversation } from "../Conversations/Conversation";
import assert from "assert";
import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";
import { IConversationsService } from "../Services/Conversations/ConversationsService";

/// Tab that displays available conversations.
export class ConversationsTab extends IPage
{
	/// Service used to get all conversations from.
	private readonly _conversationsService: IConversationsService;

	/// Service used to get the active conversation from.
	private readonly _conversationSessionService: IConversationSessionService;

	/// Page elements used by the tab.
	private readonly _pageElements = new ConversationsPageElements();

	/// Buttons that can be used to select a conversation.
	private _conversationButtons: ConversationButton[] = [];

	/// Initializes the tab.
	/// @param conversationsService Service used to all conversations from.
	/// @param conversationSessionService Service used to get the active
	///   conversation from.
	constructor(
		conversationsService: IConversationsService,
		conversationSessionService: IConversationSessionService)
	{
		super(EPageUrl.Conversations);
		this._conversationsService = conversationsService;
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
		// Generate and add the conversation buttons to the DOM
		for (const conversation of this._conversationsService.Conversations)
		{
			this._conversationButtons.push(
				new ConversationButton(
					this._pageElements.ConversationList,
					conversation
				)
			);
		}

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

		// Remove all conversation buttons from the DOM
		for (const button of this._conversationButtons)
		{
			button.Remove();
		}
		this._conversationButtons = [];

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

	/// Gets the element to add conversation buttons to.
	get ConversationList(): HTMLDivElement
	{
		return this.GetElementById<HTMLDivElement>(
			ConversationsPageElements.ID_CONVERSATION_LIST
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

	/// ID of the element to add conversation buttons to.
	private static readonly ID_CONVERSATION_LIST = "conversations-list";

	/// ID of the create new conversation button
	private static readonly ID_NEW_CONVERSATION_BUTTON = "button-new-conversation";

	/// Initializes the class.
	constructor()
	{
		super([
			ConversationsPageElements.ID_TAB_CONTAINER,
			ConversationsPageElements.ID_CONVERSATION_LIST,
			ConversationsPageElements.ID_NEW_CONVERSATION_BUTTON
		]);
	}
}

/// Helper class for locating key conversations pane elements.
class ConversationsPaneElements extends IPageElementLocator
{
	/// Gets the element where the selected conversation's name is displayed.
	get ConversationName(): HTMLHeadingElement
	{
		return this.GetElementById<HTMLHeadingElement>(
			ConversationsPaneElements.ID_CONVERSATION_NAME
		);
	}

	/// ID of the element where the selected conversation's name is displayed.
	private static readonly ID_CONVERSATION_NAME = "selected-conversation-name";

	/// Initializes the class.
	constructor()
	{
		super([
			ConversationsPaneElements.ID_CONVERSATION_NAME
		]);
	}
}

/// Class that manages the conversation pane of the conversations tab.
class ConversationPane
{
	/// The conversation whose information is displayed.
	get DisplayedConversation(): IConversation | null
	{
		return this._conversation;
	}

	/// Page elements used by the pane.
	private readonly _pageElements = new ConversationsPaneElements();

	/// Service used to manage the active conversation.
	private readonly _conversationSessionService: IConversationSessionService;

	/// Conversation whose information should be displayed.
	private _conversation: IConversation | null = null;

	/// Initializes the class.
	/// @param conversationSessionService Service used to manage the active
	///   conversation.
	constructor(
		conversationSessionService: IConversationSessionService)
	{
		this._conversationSessionService = conversationSessionService;
	}

	/// Displays a conversation in the pane.
	/// @param conversation The conversation to display.
	public ShowConversation(conversation: IConversation): void
	{
		this._conversation = conversation;
		this._pageElements.ConversationName.innerText = conversation.Name;
	}
}

/// Manages a button that can be used to select a conversation.
class ConversationButton
{
	/// Event that is dispatched when the button is clicked.
	/// The event argument is the conversation that the button represents.
	get OnClick(): ISimpleEvent<IConversation>
	{
		return this._onClick.asEvent();
	}

	/// The conversation that the button represents.
	get Conversation(): IConversation
	{
		return this._conversation;
	}

	/// Event dispatcher backing the `OnClick` property.
	private readonly _onClick = new SimpleEventDispatcher<IConversation>();

	/// Field backing the `Conversation` property.
	private readonly _conversation: IConversation;

	/// Div element containing the button.
	private readonly _containerElement: HTMLDivElement;

	/// Radio input element representing the button itself.
	private readonly _buttonElement: HTMLInputElement;

	/// Label for the button.
	private readonly _labelElement: HTMLLabelElement;

	/// Initializes the class.
	/// @param container Element that the button should be added to.
	/// @param conversation The conversation that the button represents.
	constructor(
		container: HTMLDivElement,
		conversation: IConversation)
	{
		this._conversation = conversation;
		console.log(`Creating button for conversation "${conversation.Name}"`);

		// Create the container element for the button and its label
		this._containerElement = document.createElement("div");
		this._containerElement.classList.add(
			"d-flex",
			"flex-column",
			"align-items-stretch"
		);
		container.appendChild(this._containerElement);

		// Create the button
		this._buttonElement = document.createElement("input");
		this._buttonElement.type = "radio";
		this._buttonElement.name = "conversation-buttons";
		this._buttonElement.id = ConversationButton.GenerateRandomId();
		this._buttonElement.classList.add("btn-check");
		this._buttonElement.autocomplete = "off";
		this._containerElement.appendChild(this._buttonElement);

		// Create the label
		this._labelElement = document.createElement("label");
		this._labelElement.classList.add(
			"btn",
			"btn-outline-secondary",
			"rounded-0"
		);
		this._labelElement.htmlFor = this._buttonElement.id;
		this._labelElement.innerText = conversation.Name;
		this._containerElement.appendChild(this._labelElement);

		// Bind to the button's click event
		this._buttonElement.addEventListener("click", () =>
		{
			this._onClick.dispatch(this._conversation);
		});
	}

	/// Removes the button from the DOM.
	public Remove(): void
	{
		this._containerElement.remove();
	}

	/// Generates a random ID to use for the button element.
	private static GenerateRandomId(): string
	{
		const ID_LENGTH = 8;
		const ID_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

		let id = "";
		for (let i = 0; i < ID_LENGTH; ++i)
		{
			id += ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length));
		}

		return `button-conversation-${id}`;
	}
}
