import { BindApiPaneEventHandlers } from "./ApiKeyPane";
import { IApiKeyProvider } from "./Auth/ApiKeyProvider";
import { OpenAiApiKeyProvider } from "./Auth/OpenAiApiKeyProvider";
import { IConversationsService } from "./Chat/Services/Conversations/ConversationsService";
import { TransientConversationsService } from "./Chat/Services/Conversations/TransientConversationsService";
import { DefaultNavigationService } from "./Chat/Services/Navigation/DefaultNavigationService";
import { INavigationService } from "./Chat/Services/Navigation/NavigationService";
import { IConversationSessionService } from "./Chat/Services/Sessions/ConversationSessionService";
import { DefaultConversationSessionService } from "./Chat/Services/Sessions/DefaultConversationSessionService";
import { DefaultThreadSessionService } from "./Chat/Services/Sessions/DefaultThreadSessionService";
import { IThreadSessionService } from "./Chat/Services/Sessions/ThreadSessionService";
import { BindChatNavEventHandlers, NavigateToTab } from "./ChatNav";
import { BindNewConversationEventHandlers } from "./NewConversationTab";

/// Entry point for the dev chat interface.
export const RunDevChat = () =>
{
	// Set up the services for the chat interface
	const openAiApiKeyProvider: IApiKeyProvider =
		new OpenAiApiKeyProvider("openai");
	const conversationsService: IConversationsService =
		new TransientConversationsService();
	const conversationSessionService: IConversationSessionService =
		new DefaultConversationSessionService();
	const threadSessionService: IThreadSessionService =
		new DefaultThreadSessionService(
			conversationSessionService
		);

	// Set up the navigation service
	const initialTab = BindChatNavEventHandlers(
		openAiApiKeyProvider,
		conversationsService
	);
	const navService: INavigationService = new DefaultNavigationService(
		NavigateToTab,
		initialTab
	);

	// Bind event handlers for each set of UI elements
	BindApiPaneEventHandlers(openAiApiKeyProvider);
	BindNewConversationEventHandlers(
		openAiApiKeyProvider,
		conversationsService,
		conversationSessionService,
		threadSessionService,
		navService
	);
}
