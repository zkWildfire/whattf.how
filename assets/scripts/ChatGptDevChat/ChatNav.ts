import { IApiKeyProvider } from "./Auth/ApiKeyProvider";
import { IConversationsService } from "./Chat/ConversationsService";

/// ID of the "Conversations" button.
const ID_CONVERSATIONS_BUTTON = "button-conversations-tab";

/// ID of the "Thread Graph" button.
const ID_THREAD_GRAPH_BUTTON = "button-graph-tab";

/// ID of the "Chat" button.
const ID_CHAT_BUTTON = "button-chat-tab";

/// ID of the "New Conversation" button.
const ID_NEW_CONVERSATION_BUTTON = "button-new-conversation";

/// ID of the tab to display when no API key has been provided.
const ID_NO_API_KEY_TAB = "tab-no-api-key";

/// ID of the "Conversations" tab.
const ID_CONVERSATIONS_TAB = "tab-conversations";

/// ID of the "Thread Graph" tab.
const ID_THREAD_GRAPH_TAB = "tab-graph";

/// ID of the "Chat" tab.
const ID_CHAT_TAB = "tab-chat";

/// ID of the "New Conversation" tab.
const ID_NEW_CONVERSATION_TAB = "tab-new-conversation";

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
	// Get each button on the page
	const conversationsButton = GetConversationsButton();
	const threadGraphButton = GetThreadGraphButton();
	const chatButton = GetChatButton();
	const newConversationButton = GetNewConversationButton();
	const buttons = [
		conversationsButton,
		threadGraphButton,
		chatButton,
		newConversationButton,
	];

	// Helper methods for managing the buttons
	const deselectAllButtons = () =>
	{
		for (const button of buttons)
		{
			button.classList.remove(SELECTED_CLASS);
			button.classList.add(UNSELECTED_CLASS);
		}
	}
	const selectButton = (button: HTMLButtonElement) =>
	{
		button.classList.remove(UNSELECTED_CLASS);
		button.classList.add(SELECTED_CLASS);
	}
	const activateButton = (button: HTMLButtonElement) =>
	{
		deselectAllButtons();
		selectButton(button);
	}

	// Get each tab on the page
	const conversationsTab = GetConversationsTab();
	const threadGraphTab = GetThreadGraphTab();
	const chatTab = GetChatTab();
	const newConversationTab = GetNewConversationTab();
	const tabs = [
		conversationsTab,
		threadGraphTab,
		chatTab,
		newConversationTab,
	];

	// Helper methods for managing the tabs
	const deselectAllTabs = () =>
	{
		for (const tab of tabs)
		{
			for (const selectedClass of SELECTED_TAB_CLASSES)
			{
				tab.classList.remove(selectedClass);
			}
			tab.classList.add(UNSELECTED_TAB_CLASS);
		}
	}
	const selectTab = (tab: HTMLDivElement) =>
	{
		tab.classList.remove(UNSELECTED_TAB_CLASS);
		for (const selectedClass of SELECTED_TAB_CLASSES)
		{
			tab.classList.add(selectedClass);
		}
	}
	const activateTab = (tab: HTMLDivElement) =>
	{
		deselectAllTabs();
		selectTab(tab);
	}

	// Bind to button click events
	conversationsButton.addEventListener("click", () =>
	{
		activateButton(conversationsButton);
		activateTab(conversationsTab);
		OnConversationsButtonClicked();
	});
	threadGraphButton.addEventListener("click", () =>
	{
		activateButton(threadGraphButton);
		activateTab(threadGraphTab);
		OnThreadGraphButtonClicked();
	});
	chatButton.addEventListener("click", () =>
	{
		activateButton(chatButton);
		activateTab(chatTab);
		OnChatButtonClicked();
	});
	newConversationButton.addEventListener("click", () =>
	{
		activateButton(newConversationButton);
		activateTab(newConversationTab);
		OnNewConversationButtonClicked();
	});

	// Bind to service events
	apiKeyProvider.OnApiKeyChanged.subscribe(() =>
	{
		InitializePage(apiKeyProvider, conversationsService);
	});

	// Initialize the page to the correct tab
	InitializePage(apiKeyProvider, conversationsService);
}

/// Displays the correct tab based on the current state of the page.
/// @param apiKeyProvider The provider that manages the user's API key.
/// @param conversationsService The service that manages conversations.
const InitializePage = (
	apiKeyProvider: IApiKeyProvider,
	conversationsService: IConversationsService) =>
{
	// Get the tabs that may be used as the initial tab
	const noApiKeyTab = GetNoApiKeyTab();
	const conversationsTab = GetConversationsTab();
	const newConversationTab = GetNewConversationTab();
	const tabs = [
		noApiKeyTab,
		conversationsTab,
		newConversationTab,
	];

	// Get each of the nav buttons
	const conversationsButton = GetConversationsButton();
	const threadGraphButton = GetThreadGraphButton();
	const chatButton = GetChatButton();
	const buttons = [
		conversationsButton,
		threadGraphButton,
		chatButton,
	];

	// Helper methods
	const deselectAllTabs = () =>
	{
		for (const tab of tabs)
		{
			for (const selectedClass of SELECTED_TAB_CLASSES)
			{
				tab.classList.remove(selectedClass);
			}
			tab.classList.add(UNSELECTED_TAB_CLASS);
		}
	}
	const selectTab = (tab: HTMLDivElement) =>
	{
		tab.classList.remove(UNSELECTED_TAB_CLASS);
		for (const selectedClass of SELECTED_TAB_CLASSES)
		{
			tab.classList.add(selectedClass);
		}
	}
	const activateTab = (tab: HTMLDivElement) =>
	{
		deselectAllTabs();
		selectTab(tab);
	}
	const disableButtons = () =>
	{
		for (const button of buttons)
		{
			button.disabled = true;
		}
	}
	const enableButtons = () =>
	{
		for (const button of buttons)
		{
			button.disabled = false;
		}
	}
	const deselectButtons = () =>
	{
		for (const button of buttons)
		{
			button.classList.remove(SELECTED_CLASS);
			button.classList.add(UNSELECTED_CLASS);
		}
	}
	const selectButton = (button: HTMLButtonElement) =>
	{
		button.classList.remove(UNSELECTED_CLASS);
		button.classList.add(SELECTED_CLASS);
	}

	// If no API key has been provided, show the "No API Key" tab
	if (!apiKeyProvider.HasApiKey)
	{
		activateTab(noApiKeyTab);

		// If the user has no API key, disable all buttons and make sure none
		//   of the buttons appear selected
		disableButtons();
		deselectButtons();
	}
	// If the user has an API key but no conversations, show the "New
	//   Conversation" tab
	else if (conversationsService.Count === 0)
	{
		activateTab(newConversationTab);

		// Don't allow the user to switch to any tabs until they've created a
		//   conversation
		disableButtons();
		deselectButtons();
	}
	// Otherwise, show the "Conversations" tab
	else
	{
		activateTab(conversationsTab);

		// Make sure all buttons are enabled and that the "Conversations" button
		//   appears selected
		enableButtons();
		deselectButtons();
		selectButton(conversationsButton);
	}
}

/// Helper method for creating each find button function.
/// @param buttonId The ID of the button to find.
/// @returns A function that finds the button with the given ID.
const MakeGetButtonFunc = (buttonId: string) =>
{
	return () =>
	{
		const button = document.getElementById(buttonId) as HTMLButtonElement;
		if (!button)
		{
			throw new Error(`Could not find button with ID ${buttonId}`);
		}

		return button;
	};
}

/// Helper method for creating each find tab function.
/// @param tabId The ID of the tab to find.
/// @returns A function that finds the tab with the given ID.
const MakeGetTabFunc = (tabId: string) =>
{
	return () =>
	{
		const tab = document.getElementById(tabId) as HTMLDivElement;
		if (!tab)
		{
			throw new Error(`Could not find tab with ID ${tabId}`);
		}

		return tab;
	};
}

/// Gets the "Conversations" button.
/// @returns A reference to the button element.
const GetConversationsButton = MakeGetButtonFunc(
	ID_CONVERSATIONS_BUTTON
);

/// Gets the "Thread Graph" button.
/// @returns A reference to the button element.
const GetThreadGraphButton = MakeGetButtonFunc(
	ID_THREAD_GRAPH_BUTTON
);

/// Gets the "Chat" button.
/// @returns A reference to the button element.
const GetChatButton = MakeGetButtonFunc(ID_CHAT_BUTTON);

/// Gets the "New Conversation" button.
/// @returns A reference to the button element.
const GetNewConversationButton = MakeGetButtonFunc(
	ID_NEW_CONVERSATION_BUTTON
);

/// Gets the tab to display when no API key has been provided.
/// @returns A reference to the tab element.
const GetNoApiKeyTab = MakeGetTabFunc(ID_NO_API_KEY_TAB);

/// Gets the "Conversations" tab.
/// @returns A reference to the tab element.
const GetConversationsTab = MakeGetTabFunc(ID_CONVERSATIONS_TAB);

/// Gets the "Thread Graph" tab.
/// @returns A reference to the tab element.
const GetThreadGraphTab = MakeGetTabFunc(ID_THREAD_GRAPH_TAB);

/// Gets the "Chat" tab.
/// @returns A reference to the tab element.
const GetChatTab = MakeGetTabFunc(ID_CHAT_TAB);

/// Gets the "New Conversation" tab.
/// @returns A reference to the tab element.
const GetNewConversationTab = MakeGetTabFunc(ID_NEW_CONVERSATION_TAB);

/// Event handler to invoke when the "Conversations" button is clicked.
const OnConversationsButtonClicked = () =>
{
}

/// Event handler to invoke when the "Thread Graph" button is clicked.
const OnThreadGraphButtonClicked = () =>
{
}

/// Event handler to invoke when the "Chat" button is clicked.
const OnChatButtonClicked = () =>
{
}

/// Event handler to invoke when the "New Conversation" button is clicked.
const OnNewConversationButtonClicked = () =>
{
}
