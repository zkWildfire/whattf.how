import { IApiKeyProvider } from "./Auth/ApiKeyProvider";
import { IConversationsService } from "./Chat/Services/Conversations/ConversationsService";
import { IPageElementLocator } from "./Util/PageElementLocator";

// CSS class to add to the selected button
const SELECTED_CLASS = "btn-secondary";

// CSS class to add to each non-selected button
const UNSELECTED_CLASS = "btn-outline-secondary";

// CSS class to add to the selected tab
const SELECTED_TAB_CLASSES = [
	"flex-fill"
];

// CSS class to add to each non-selected tab
const UNSELECTED_TAB_CLASS = "d-none";

/// Initializes all generic navigation elements for the dev chat interface.
/// @param apiKeyProvider The provider that manages the user's API key.
/// @param conversationsService The service that manages conversations.
export const BindChatNavEventHandlers = (
	apiKeyProvider: IApiKeyProvider,
	conversationsService: IConversationsService) =>
{
	// Find all key page elements
	const pageElements = new ChatNavElements();

	// Bind to nav button events
	pageElements.ConversationsButton.addEventListener("onchange", () =>
	{
		if (pageElements.ConversationsButton.checked)
		{
			pageElements.ActivateTab(pageElements.ConversationsTab);
		}
	});
	pageElements.ThreadGraphButton.addEventListener("onchange", () =>
	{
		if (pageElements.ThreadGraphButton.checked)
		{
			pageElements.ActivateTab(pageElements.ThreadGraphTab);
		}
	});
	pageElements.ChatButton.addEventListener("onchange", () =>
	{
		if (pageElements.ChatButton.checked)
		{
			pageElements.ActivateTab(pageElements.ChatTab);
		}
	});

	// Bind to other buttons' events
	pageElements.NewConversationButton.addEventListener("click", () =>
	{
		pageElements.DisableNavButtons();
		pageElements.ActivateTab(pageElements.NewConversationTab);
	});

	// Bind to service events
	apiKeyProvider.OnApiKeyChanged.subscribe(() =>
	{
		InitializePage(
			pageElements,
			apiKeyProvider,
			conversationsService
		);
	});

	// Initialize the page to the correct tab
	InitializePage(
		pageElements,
		apiKeyProvider,
		conversationsService
	);
}

/// Helper class used to locate all elements for handling chat navigation.
class ChatNavElements extends IPageElementLocator
{
	/// Button that navigates to the conversations tab.
	get ConversationsButton(): HTMLInputElement
	{
		return this.GetElementById<HTMLInputElement>(
			ChatNavElements.ID_CONVERSATIONS_BUTTON
		);
	}

	/// Button that navigates to the thread graph tab.
	get ThreadGraphButton(): HTMLInputElement
	{
		return this.GetElementById<HTMLInputElement>(
			ChatNavElements.ID_THREAD_GRAPH_BUTTON
		);
	}

	/// Button that navigates to the chat tab.
	get ChatButton(): HTMLInputElement
	{
		return this.GetElementById<HTMLInputElement>(
			ChatNavElements.ID_CHAT_BUTTON
		);
	}

	/// Button that navigates to the new conversation tab.
	get NewConversationButton(): HTMLInputElement
	{
		return this.GetElementById<HTMLInputElement>(
			ChatNavElements.ID_NEW_CONVERSATION_BUTTON
		);
	}

	/// Buttons that are part of the chat navigation bar.
	get NavButtons(): HTMLInputElement[]
	{
		return [
			this.ConversationsButton,
			this.ThreadGraphButton,
			this.ChatButton
		];
	}

	/// Tab to be displayed when no API key has been provided.
	get NoApiKeyTab(): HTMLDivElement
	{
		return this.GetElementById<HTMLDivElement>(
			ChatNavElements.ID_NO_API_KEY_TAB
		);
	}

	/// Tab that displays the list of conversations.
	get ConversationsTab(): HTMLDivElement
	{
		return this.GetElementById<HTMLDivElement>(
			ChatNavElements.ID_CONVERSATIONS_TAB
		);
	}

	/// Tab that displays the thread graph.
	get ThreadGraphTab(): HTMLDivElement
	{
		return this.GetElementById<HTMLDivElement>(
			ChatNavElements.ID_THREAD_GRAPH_TAB
		);
	}

	/// Tab that displays the chat.
	get ChatTab(): HTMLDivElement
	{
		return this.GetElementById<HTMLDivElement>(
			ChatNavElements.ID_CHAT_TAB
		);
	}

	/// Tab that displays the new conversation form.
	get NewConversationTab(): HTMLDivElement
	{
		return this.GetElementById<HTMLDivElement>(
			ChatNavElements.ID_NEW_CONVERSATION_TAB
		);
	}

	/// List of all tabs on the page.
	/// Tabs are the page elements for which only one should be visible at a
	///   time.
	get Tabs(): HTMLDivElement[]
	{
		return [
			this.NoApiKeyTab,
			this.ConversationsTab,
			this.ThreadGraphTab,
			this.ChatTab,
			this.NewConversationTab
		];
	}

	/// ID of the "Conversations" button.
	private static readonly ID_CONVERSATIONS_BUTTON = "button-conversations-tab";

	/// ID of the "Thread Graph" button.
	private static readonly ID_THREAD_GRAPH_BUTTON = "button-graph-tab";

	/// ID of the "Chat" button.
	private static readonly ID_CHAT_BUTTON = "button-chat-tab";

	/// ID of the "New Conversation" button.
	private static readonly ID_NEW_CONVERSATION_BUTTON = "button-new-conversation";

	/// ID of the tab to display when no API key has been provided.
	private static readonly ID_NO_API_KEY_TAB = "tab-no-api-key";

	/// ID of the "Conversations" tab.
	private static readonly ID_CONVERSATIONS_TAB = "tab-conversations";

	/// ID of the "Thread Graph" tab.
	private static readonly ID_THREAD_GRAPH_TAB = "tab-graph";

	/// ID of the "Chat" tab.
	private static readonly ID_CHAT_TAB = "tab-chat";

	/// ID of the "New Conversation" tab.
	private static readonly ID_NEW_CONVERSATION_TAB = "tab-new-conversation";

	/// Initializes the class.
	constructor()
	{
		super([
			ChatNavElements.ID_CONVERSATIONS_BUTTON,
			ChatNavElements.ID_THREAD_GRAPH_BUTTON,
			ChatNavElements.ID_CHAT_BUTTON,
			ChatNavElements.ID_NEW_CONVERSATION_BUTTON,
			ChatNavElements.ID_NO_API_KEY_TAB,
			ChatNavElements.ID_CONVERSATIONS_TAB,
			ChatNavElements.ID_THREAD_GRAPH_TAB,
			ChatNavElements.ID_CHAT_TAB,
			ChatNavElements.ID_NEW_CONVERSATION_TAB,
		]);
	}

	/// Disables the buttons that are part of the chat navigation.
	public DisableNavButtons(): void
	{
		for (const button of this.NavButtons)
		{
			button.disabled = true;
		}

		// Also make sure none of the buttons appear selected
		for (const button of this.NavButtons)
		{
			button.checked = false;
		}
	}

	/// Sets the given nav button as the active nav button.
	/// @param button The button to select. Must be one of the buttons that are
	///   part of the chat navigation.
	public SelectNavButton(button: HTMLInputElement): void
	{
		// Make sure all buttons are enabled
		for (const button of this.NavButtons)
		{
			button.disabled = false;
		}

		// Deselect all of the nav buttons
		for (const button of this.NavButtons)
		{
			button.checked = false;
		}

		// Select the given button
		button.checked = true;
	}

	/// Shows the given tab.
	public ActivateTab(tab: HTMLDivElement): void
	{
		// Hide all tabs
		for (const tab of this.Tabs)
		{
			tab.classList.add("d-none");
		}

		// Show the given tab
		tab.classList.remove("d-none");
	}
}

/// Displays the correct tab based on the current state of the page.
/// @param pageElements The elements used to navigate the page.
/// @param apiKeyProvider The provider that manages the user's API key.
/// @param conversationsService The service that manages conversations.
const InitializePage = (
	pageElements: ChatNavElements,
	apiKeyProvider: IApiKeyProvider,
	conversationsService: IConversationsService) =>
{
	// If no API key has been provided, show the "No API Key" tab
	if (!apiKeyProvider.HasApiKey)
	{
		pageElements.ActivateTab(pageElements.NoApiKeyTab);

		// If the user has no API key, disable all buttons and make sure none
		//   of the buttons appear selected
		pageElements.DisableNavButtons();
	}
	// If the user has an API key but no conversations, show the "New
	//   Conversation" tab
	else if (conversationsService.Count === 0)
	{
		pageElements.ActivateTab(pageElements.NewConversationTab);

		// Don't allow the user to switch to any tabs until they've created a
		//   conversation
		pageElements.DisableNavButtons();
	}
	// Otherwise, show the "Conversations" tab
	else
	{
		pageElements.ActivateTab(pageElements.ConversationsTab);

		// Make sure all buttons are enabled and that the "Conversations" button
		//   appears selected
		pageElements.SelectNavButton(pageElements.ConversationsButton);
	}
}
