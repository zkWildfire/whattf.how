import { IApiKeyProvider } from "./Auth/ApiKeyProvider";
import { EPageUrl } from "./Chat/Pages/PageUrl";
import { IConversationsService } from "./Chat/Services/Conversations/ConversationsService";
import { INavigationService } from "./Chat/Services/Navigation/NavigationService";
import { IPageElementLocator } from "./Util/PageElementLocator";

/// Initializes all generic navigation elements for the dev chat interface.
/// @param apiKeyProvider The provider that manages the user's API key.
/// @param conversationsService The service that manages conversations.
/// @param navService The service that manages navigation.
export const BindChatNavEventHandlers = (
	apiKeyProvider: IApiKeyProvider,
	conversationsService: IConversationsService,
	navService: INavigationService) =>
{
	// Find all key page elements
	const pageElements = new ChatNavElements();

	// Bind to nav button events
	pageElements.ConversationsButton.addEventListener("change", () =>
	{
		navService.NavigateToPage(EPageUrl.Conversations);
	});
	pageElements.ThreadGraphButton.addEventListener("change", () =>
	{
		navService.NavigateToPage(EPageUrl.ThreadGraph);
	});
	pageElements.ChatButton.addEventListener("change", () =>
	{
		navService.NavigateToPage(EPageUrl.Chat);
	});

	// Bind to service events
	apiKeyProvider.OnApiKeyChanged.subscribe(() =>
	{
		InitializePage(
			apiKeyProvider,
			conversationsService,
			navService
		);
	});
	navService.OnPageChanged.subscribe((page) =>
	{
		OnPageChanged(pageElements, page.Url);
	});

	// Initialize the page to the correct tab
	InitializePage(
		apiKeyProvider,
		conversationsService,
		navService
	);
}

/// Callback invoked when the page URL changes.
/// @param pageElements The page elements that are part of the chat navigation.
/// @param pageUrl The new page URL.
const OnPageChanged = (pageElements: ChatNavElements, pageUrl: EPageUrl) =>
{
	// If the page is not one of the pages that the chat tabs correspond to,
	//   disable the chat tabs
	if (pageUrl !== EPageUrl.Conversations &&
		pageUrl !== EPageUrl.ThreadGraph &&
		pageUrl !== EPageUrl.Chat)
	{
		pageElements.DisableNavButtons();
	}
	// If the page is one of the pages that the chat tabs correspond to, enable
	//   the correct chat tab
	else if (pageUrl === EPageUrl.Conversations)
	{
		pageElements.SelectNavButton(pageElements.ConversationsButton);
	}
	else if (pageUrl === EPageUrl.ThreadGraph)
	{
		pageElements.SelectNavButton(pageElements.ThreadGraphButton);
	}
	else if (pageUrl === EPageUrl.Chat)
	{
		pageElements.SelectNavButton(pageElements.ChatButton);
	}
};

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
}

/// Displays the correct tab based on the current state of the page.
/// @param apiKeyProvider The provider that manages the user's API key.
/// @param conversationsService The service that manages conversations.
/// @param navService The service that manages navigation.
const InitializePage = (
	apiKeyProvider: IApiKeyProvider,
	conversationsService: IConversationsService,
	navService: INavigationService) =>
{
	let tab = EPageUrl.NoApiKey;

	// If no API key has been provided, show the "No API Key" tab
	if (!apiKeyProvider.HasApiKey)
	{
		tab = EPageUrl.NoApiKey;
	}
	// If the user has an API key but no conversations, show the "New
	//   Conversation" tab
	else if (conversationsService.Count === 0)
	{
		tab = EPageUrl.NewConversation;
	}
	// Otherwise, show the "Conversations" tab
	else
	{
		tab = EPageUrl.Conversations;
	}

	navService.NavigateToPage(tab);
}
