import { IPage } from "./Page";
import { IThreadSessionService } from "../Services/Sessions/ThreadSessionService";
import { IPageElementLocator } from "../../Util/PageElementLocator";
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

	/// Service used to get the active thread from.
	private readonly _threadSessionService: IThreadSessionService;

	/// Page elements used by the tab.
	private readonly _pageElements = new ConversationsPageElements();

	/// Component used to handle the conversation pane.
	private readonly _conversationPane: ConversationPane;

	/// Buttons that can be used to select a conversation.
	private _conversationButtons: ConversationButton[] = [];

	/// Initializes the tab.
	/// @param conversationsService Service used to all conversations from.
	/// @param conversationSessionService Service used to get the active
	///   conversation from.
	/// @param threadSessionService Service used to get the active thread from.
	constructor(
		conversationsService: IConversationsService,
		conversationSessionService: IConversationSessionService,
		threadSessionService: IThreadSessionService)
	{
		super(EPageUrl.Conversations);
		this._conversationsService = conversationsService;
		this._conversationSessionService = conversationSessionService;
		this._threadSessionService = threadSessionService;
		this._conversationPane = new ConversationPane(
			conversationSessionService
		);

		// Bind to the new conversation button's events
		this._pageElements.NewConversationButton.addEventListener("click", () =>
		{
			this._onRedirect.dispatch(EPageUrl.NewConversation);
		});
		this._pageElements.DeleteConversationButton.addEventListener("click", () =>
		{
			this.OnDeleteConversationClicked();
		});
	}

	/// Displays the tab.
	public Show(): void
	{
		// Generate and add the conversation buttons to the DOM
		for (const conversation of this._conversationsService.Conversations)
		{
			var button = new ConversationButton(
				this._pageElements.ConversationList,
				conversation
			);
			button.OnClick.subscribe((conversation) =>
			{
				this.OnConversationSelected(conversation);
			});
			this._conversationButtons.push(button);
		}

		// If no conversation is selected but conversations exist, select the
		//   first conversation
		if (this._conversationSessionService.ActiveConversation === null &&
			this._conversationButtons.length > 0)
		{
			const button = this._conversationButtons[0];
			this._conversationSessionService.ActiveConversation =
				button.Conversation;
			this._threadSessionService.ActiveThread =
				button.Conversation.Threads[0];
			button.MarkAsSelected();

			this._conversationPane.ShowConversation(button.Conversation);
			this._pageElements.DeleteConversationButton.disabled = false;
		}
		else if (this._conversationSessionService.ActiveConversation !== null)
		{
			// If a conversation is selected, select the corresponding button
			//   and display the conversation
			for (const button of this._conversationButtons)
			{
				if (button.Conversation ===
					this._conversationSessionService.ActiveConversation)
				{
					button.MarkAsSelected();
					this._conversationPane.ShowConversation(button.Conversation);
					break;
				}
			}
			this._pageElements.DeleteConversationButton.disabled = false;
		}
		else
		{
			// Make sure that if this page is displayed with no conversations,
			//   the delete button is disabled
			this._pageElements.DeleteConversationButton.disabled = true;
		}

		// Display the tab
		this._pageElements.ConversationsTab.classList.remove("d-none");
		this._pageElements.ConversationsTab.classList.add(
			"d-flex",
			"flex-fill"
		);
		this._onShow.dispatch(this);
	}

	/// Hides the tab.
	public Hide(): void
	{
		this._pageElements.ConversationsTab.classList.add("d-none");
		this._pageElements.ConversationsTab.classList.remove(
			"d-flex",
			"flex-fill"
		);

		// Remove all conversation buttons from the DOM
		for (const button of this._conversationButtons)
		{
			button.Remove();
		}
		this._conversationButtons = [];
		this._conversationPane.ClearConversation();

		this._onHide.dispatch(this);
	}

	/// Callback invoked when one of the conversation list buttons is clicked.
	private OnConversationSelected(conversation: IConversation): void
	{
		this._pageElements.DeleteConversationButton.disabled = false;
		this._conversationPane.ShowConversation(conversation);
		this._conversationsService.SelectConversation(conversation);

		// Also select the conversation as the active conversation but don't
		//   switch to the chat tab
		if (conversation.Id !==
			this._conversationSessionService.ActiveConversation?.Id)
		{
			this._conversationSessionService.ActiveConversation = conversation;
			this._threadSessionService.ActiveThread = conversation.Threads[0];
		}
	}

	/// Callback invoked when the delete conversation button is clicked.
	private OnDeleteConversationClicked(): void
	{
		const conversation = this._conversationPane.DisplayedConversation;
		assert(conversation !== null);

		// If this is the active conversation, clear the active conversation
		//   and active threads
		if (conversation === this._conversationSessionService.ActiveConversation)
		{
			this._conversationSessionService.ActiveConversation = null;
			this._threadSessionService.ActiveThread = null;
		}

		this._conversationsService.DeleteConversation(conversation);
		this._conversationPane.ClearConversation();

		// Find the button for the deleted conversation and remove it
		for (let i = 0; i < this._conversationButtons.length; ++i)
		{
			const button = this._conversationButtons[i];
			if (button.Conversation === conversation)
			{
				button.Remove();
				this._conversationButtons.splice(i, 1);
				break;
			}
		}

		// Also disable the load and delete buttons since no conversation will
		//   be selected after deleting the current one
		this._pageElements.DeleteConversationButton.disabled = true;

		// If this was the last conversation, go back to the new conversation
		//   page
		if (this._conversationButtons.length === 0)
		{
			this._onRedirect.dispatch(EPageUrl.NewConversation);
		}
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

	/// Gets the delete selected conversation button.
	get DeleteConversationButton(): HTMLButtonElement
	{
		return this.GetElementById<HTMLButtonElement>(
			ConversationsPageElements.ID_DELETE_CONVERSATION_BUTTON
		);
	}

	/// ID of the container element for the conversations tab.
	private static readonly ID_TAB_CONTAINER = "tab-conversations";

	/// ID of the element to add conversation buttons to.
	private static readonly ID_CONVERSATION_LIST = "conversations-list";

	/// ID of the create new conversation button.
	private static readonly ID_NEW_CONVERSATION_BUTTON = "button-new-conversation";

	/// ID of the delete selected conversation button.
	private static readonly ID_DELETE_CONVERSATION_BUTTON =
		"button-conversation-delete-selected";

	/// Initializes the class.
	constructor()
	{
		super([
			ConversationsPageElements.ID_TAB_CONTAINER,
			ConversationsPageElements.ID_CONVERSATION_LIST,
			ConversationsPageElements.ID_NEW_CONVERSATION_BUTTON,
			ConversationsPageElements.ID_DELETE_CONVERSATION_BUTTON
		]);
	}
}

/// Helper class for locating key conversations pane elements.
class ConversationsPaneElements extends IPageElementLocator
{
	/// Gets the container element for the conversations pane.
	get ConversationPane(): HTMLDivElement
	{
		return this.GetElementById<HTMLDivElement>(
			ConversationsPaneElements.ID_CONVERSATION_PANE
		);
	}

	/// Gets the element where the selected conversation's name is displayed.
	get ConversationName(): HTMLHeadingElement
	{
		return this.GetElementById<HTMLHeadingElement>(
			ConversationsPaneElements.ID_CONVERSATION_NAME
		);
	}

	/// Gets the element where the selected conversation's LLM is displayed.
	get Llm(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			ConversationsPaneElements.ID_CONVERSATION_LLM
		);
	}

	/// Gets the element where the selected conversation's LLM's context window
	///   size is displayed.
	get LlmContextWindowSize(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			ConversationsPaneElements.ID_CONVERSATION_LLM_CONTEXT_WINDOW_SIZE
		);
	}

	/// Gets the element where the selected conversation's target context
	///   window size is displayed.
	get TargetContextWindowSize(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			ConversationsPaneElements.ID_CONVERSATION_TARGET_CONTEXT_WINDOW_SIZE
		);
	}

	/// Gets the element where the selected conversation's LLM inbound cost
	///   is displayed.
	get LlmInboundCost(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			ConversationsPaneElements.ID_CONVERSATION_LLM_INBOUND_COST
		);
	}

	/// Gets the element where the selected conversation's LLM outbound cost
	///   is displayed.
	get LlmOutboundCost(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			ConversationsPaneElements.ID_CONVERSATION_LLM_OUTBOUND_COST
		);
	}

	/// Gets the element where the selected conversation's thread count is
	///   displayed.
	get ThreadCount(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			ConversationsPaneElements.ID_CONVERSATION_THREAD_COUNT
		);
	}

	/// Gets the element where the selected conversation's message count is
	///   displayed.
	get MessageCount(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			ConversationsPaneElements.ID_CONVERSATION_MESSAGE_COUNT
		);
	}

	/// Gets the element where the selected conversation's total token count
	///   is displayed.
	get TotalTokenCount(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			ConversationsPaneElements.ID_CONVERSATION_TOTAL_TOKEN_COUNT
		);
	}

	/// Gets the element where the selected conversation's outbound token
	///   count is displayed.
	get OutboundTokenCount(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			ConversationsPaneElements.ID_CONVERSATION_OUTBOUND_TOKEN_COUNT
		);
	}

	/// Gets the element where the selected conversation's inbound token
	///   count is displayed.
	get InboundTokenCount(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			ConversationsPaneElements.ID_CONVERSATION_INBOUND_TOKEN_COUNT
		);
	}

	/// Gets the element where the selected conversation's total cost is
	///   displayed.
	get TotalCost(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			ConversationsPaneElements.ID_CONVERSATION_TOTAL_COST
		);
	}

	/// Gets the element where the selected conversation's outbound cost is
	///   displayed.
	get OutboundCost(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			ConversationsPaneElements.ID_CONVERSATION_OUTBOUND_COST
		);
	}

	/// Gets the element where the selected conversation's inbound cost is
	///   displayed.
	get InboundCost(): HTMLSpanElement
	{
		return this.GetElementById<HTMLSpanElement>(
			ConversationsPaneElements.ID_CONVERSATION_INBOUND_COST
		);
	}

	/// Gets the element where the selected conversation's initial message is
	///   displayed.
	get InitialMessage(): HTMLDivElement
	{
		return this.GetElementById<HTMLDivElement>(
			ConversationsPaneElements.ID_CONVERSATION_INITIAL_MESSAGE
		);
	}

	/// ID for the container element for the conversations pane.
	private static readonly ID_CONVERSATION_PANE = "conversation-pane";

	/// ID of the element where the selected conversation's name is displayed.
	private static readonly ID_CONVERSATION_NAME = "selected-conversation-name";

	/// ID of the element where the selected conversation's LLM is displayed.
	private static readonly ID_CONVERSATION_LLM = "selected-conversation-llm";

	/// ID of the element where the selected conversation's LLM's context window
	///   size is displayed.
	private static readonly ID_CONVERSATION_LLM_CONTEXT_WINDOW_SIZE =
		"selected-conversation-llm-context-window";

	/// ID of the element where the selected conversation's target context
	///   window size is displayed.
	private static readonly ID_CONVERSATION_TARGET_CONTEXT_WINDOW_SIZE =
		"selected-conversation-target-context-window";

	/// ID of the element where the selected conversation's LLM inbound cost
	///   is displayed.
	private static readonly ID_CONVERSATION_LLM_INBOUND_COST =
		"selected-conversation-llm-inbound-cost";

	/// ID of the element where the selected conversation's LLM outbound cost
	///   is displayed.
	private static readonly ID_CONVERSATION_LLM_OUTBOUND_COST =
		"selected-conversation-llm-outbound-cost";

	/// ID of the element where the selected conversation's thread count is
	///   displayed.
	private static readonly ID_CONVERSATION_THREAD_COUNT =
		"selected-conversation-thread-count";

	/// ID of the element where the selected conversation's message count is
	///   displayed.
	private static readonly ID_CONVERSATION_MESSAGE_COUNT =
		"selected-conversation-message-count";

	/// ID of the element where the selected conversation's total token count
	///   is displayed.
	private static readonly ID_CONVERSATION_TOTAL_TOKEN_COUNT =
		"selected-conversation-total-tokens";

	/// ID of the element where the selected conversation's outbound token
	///   count is displayed.
	private static readonly ID_CONVERSATION_OUTBOUND_TOKEN_COUNT =
		"selected-conversation-outbound-tokens";

	/// ID of the element where the selected conversation's inbound token
	///   count is displayed.
	private static readonly ID_CONVERSATION_INBOUND_TOKEN_COUNT =
		"selected-conversation-inbound-tokens";

	/// ID of the element where the selected conversation's total cost is
	///   displayed.
	private static readonly ID_CONVERSATION_TOTAL_COST =
		"selected-conversation-total-cost";

	/// ID of the element where the selected conversation's outbound cost is
	///   displayed.
	private static readonly ID_CONVERSATION_OUTBOUND_COST =
		"selected-conversation-outbound-cost";

	/// ID of the element where the selected conversation's inbound cost is
	///   displayed.
	private static readonly ID_CONVERSATION_INBOUND_COST =
		"selected-conversation-inbound-cost";

	/// ID of the element where the selected conversation's initial message is
	///   displayed.
	private static readonly ID_CONVERSATION_INITIAL_MESSAGE =
		"selected-conversation-initial-message";

	/// Initializes the class.
	constructor()
	{
		super([
			ConversationsPaneElements.ID_CONVERSATION_PANE,
			ConversationsPaneElements.ID_CONVERSATION_NAME,
			ConversationsPaneElements.ID_CONVERSATION_LLM,
			ConversationsPaneElements.ID_CONVERSATION_LLM_CONTEXT_WINDOW_SIZE,
			ConversationsPaneElements.ID_CONVERSATION_TARGET_CONTEXT_WINDOW_SIZE,
			ConversationsPaneElements.ID_CONVERSATION_LLM_INBOUND_COST,
			ConversationsPaneElements.ID_CONVERSATION_LLM_OUTBOUND_COST,
			ConversationsPaneElements.ID_CONVERSATION_THREAD_COUNT,
			ConversationsPaneElements.ID_CONVERSATION_MESSAGE_COUNT,
			ConversationsPaneElements.ID_CONVERSATION_TOTAL_TOKEN_COUNT,
			ConversationsPaneElements.ID_CONVERSATION_OUTBOUND_TOKEN_COUNT,
			ConversationsPaneElements.ID_CONVERSATION_INBOUND_TOKEN_COUNT,
			ConversationsPaneElements.ID_CONVERSATION_TOTAL_COST,
			ConversationsPaneElements.ID_CONVERSATION_OUTBOUND_COST,
			ConversationsPaneElements.ID_CONVERSATION_INBOUND_COST,
			ConversationsPaneElements.ID_CONVERSATION_INITIAL_MESSAGE
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

	/// Clears the conversation from the pane.
	public ClearConversation(): void
	{
		this._conversation = null;
		this._pageElements.ConversationPane.classList.add("d-none");
	}

	/// Displays a conversation in the pane.
	/// @param conversation The conversation to display.
	public ShowConversation(conversation: IConversation): void
	{
		this._conversation = conversation;
		this._pageElements.ConversationPane.classList.remove("d-none");

		// Helper method for formatting a number as a dollar amount
		const formatDollarAmount = (amount: number): string =>
		{
			return `$${amount.toFixed(2)}`;
		};

		// Set the strings to display
		this._pageElements.ConversationName.innerText = conversation.Name;
		this._pageElements.Llm.innerText = conversation.Llm.DisplayName;
		this._pageElements.LlmContextWindowSize.innerText =
			`${conversation.Llm.ContextWindowSize.toString()} tokens`;
		this._pageElements.TargetContextWindowSize.innerText =
			`${conversation.TargetContextWindowSize.toString()} tokens`;
		this._pageElements.LlmInboundCost.innerText =
			`$${conversation.Llm.InboundCost.toString()} per 1K tokens`;
		this._pageElements.LlmOutboundCost.innerText =
			`$${conversation.Llm.OutboundCost.toString()} per 1K tokens`;
		this._pageElements.ThreadCount.innerText =
			`${conversation.Threads.length.toString()} threads`;
		this._pageElements.MessageCount.innerText =
			`${conversation.MessageCount.toString()} messages`;
		this._pageElements.TotalTokenCount.innerText =
			`${conversation.TotalTokenCount.toString()} tokens`;
		this._pageElements.OutboundTokenCount.innerText =
			`${conversation.OutboundTokenCount.toString()} tokens`;
		this._pageElements.InboundTokenCount.innerText =
			`${conversation.InboundTokenCount.toString()} tokens`;
		this._pageElements.TotalCost.innerText =
			formatDollarAmount(conversation.TotalCost);
		this._pageElements.OutboundCost.innerText =
			formatDollarAmount(conversation.OutboundCost);
		this._pageElements.InboundCost.innerText =
			formatDollarAmount(conversation.InboundCost);

		// Get the initial message for the conversation and split it into
		//   paragraphs
		const initialMessage = conversation.RootMessage;
		const paragraphs = initialMessage.Contents.split("\n\n");

		// Clear the initial message element and add the paragraphs to it
		this._pageElements.InitialMessage.innerHTML = "";
		for (const paragraph of paragraphs)
		{
			const paragraphElement = document.createElement("p");
			paragraphElement.innerText = paragraph;
			this._pageElements.InitialMessage.appendChild(paragraphElement);
		}
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
			"border-0",
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

	/// Marks the button as selected.
	public MarkAsSelected(): void
	{
		this._buttonElement.checked = true;
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
