import { BindApiPaneEventHandlers } from "./ApiKeyPane";
import { OpenAiApiKeyProvider } from "./Auth/OpenAiApiKeyProvider";
import { TransientConversationsService } from "./Chat/Services/Conversations/TransientConversationsService";
import { BindChatNavEventHandlers } from "./ChatNav";
import { BindNewConversationEventHandlers } from "./NewConversationTab";

/// Entry point for the dev chat interface.
export const RunDevChat = () =>
{
	// Set up the services for the chat interface
	const openAiApiKeyProvider = new OpenAiApiKeyProvider("openai");
	const conversationsService = new TransientConversationsService();

	// Bind event handlers for each set of UI elements
	BindApiPaneEventHandlers(openAiApiKeyProvider);
	BindChatNavEventHandlers(
		openAiApiKeyProvider,
		conversationsService
	);
	BindNewConversationEventHandlers();
}
