import { BindApiPaneEventHandlers } from "./ApiKeyPane";
import { OpenAiApiKeyProvider } from "./Auth/OpenAiApiKeyProvider";
import { OpenAiConversationsService } from "./Chat/OpenAiConversationsService";
import { BindChatNavEventHandlers } from "./ChatNav";

/// Entry point for the dev chat interface.
export const RunDevChat = () =>
{
	// Set up the services for the chat interface
	const openAiApiKeyProvider = new OpenAiApiKeyProvider("openai");
	const openAiConversationsService = new OpenAiConversationsService();

	// Bind event handlers for each set of UI elements
	BindApiPaneEventHandlers(openAiApiKeyProvider);
	BindChatNavEventHandlers(
		openAiApiKeyProvider,
		openAiConversationsService
	);
}
