import { BindApiPaneEventHandlers } from "./ApiKeyPane";
import { IApiKeyProvider } from "./Auth/ApiKeyProvider";
import { OpenAiApiKeyProvider } from "./Auth/OpenAiApiKeyProvider";
import { IConversationsService } from "./Chat/Services/Conversations/ConversationsService";
import { TransientConversationsService } from "./Chat/Services/Conversations/TransientConversationsService";
import { PageNavigationService } from "./Chat/Services/Navigation/PageNavigationService";
import { INavigationService } from "./Chat/Services/Navigation/NavigationService";
import { IConversationSessionService } from "./Chat/Services/Sessions/ConversationSessionService";
import { DefaultConversationSessionService } from "./Chat/Services/Sessions/DefaultConversationSessionService";
import { DefaultThreadSessionService } from "./Chat/Services/Sessions/DefaultThreadSessionService";
import { IThreadSessionService } from "./Chat/Services/Sessions/ThreadSessionService";
import { BindChatNavEventHandlers } from "./ChatNav";
import { EPageUrl } from "./Chat/Pages/PageUrl";
import { NoApiKeyPage } from "./Chat/Pages/NoApiKeyPage";
import { IPage } from "./Chat/Pages/Page";
import { ChatTab } from "./Chat/Pages/ChatTab";
import { NewConversationPage } from "./Chat/Pages/NewConversationPage";
import { ConversationsTab } from "./Chat/Pages/ConversationsTab";
import { ThreadGraphTab } from "./Chat/Pages/ThreadGraphTab";

/// Entry point for the dev chat interface.
export const RunDevChat = () =>
{
	// Set up the services for the chat interface
	const apiKeyProvider: IApiKeyProvider =
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
	const navService: INavigationService = new PageNavigationService(
		new Map<EPageUrl, IPage>([
			[EPageUrl.NoApiKey, new NoApiKeyPage()],
			[EPageUrl.Conversations, new ConversationsTab(
				conversationsService,
				conversationSessionService
			)],
			[EPageUrl.ThreadGraph, new ThreadGraphTab(
				conversationSessionService,
				threadSessionService
			)],
			[EPageUrl.Chat, new ChatTab(
				conversationSessionService,
				threadSessionService
			)],
			[EPageUrl.NewConversation, new NewConversationPage(
				apiKeyProvider,
				conversationsService,
				conversationSessionService,
				threadSessionService
			)]
		]),
		EPageUrl.NoApiKey
	);

	// Bind event handlers for each set of UI elements
	BindChatNavEventHandlers(
		apiKeyProvider,
		conversationsService,
		navService
	);
	BindApiPaneEventHandlers(apiKeyProvider);
}
