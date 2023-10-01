/// Identifies each page that may be displayed by the Dev Chat.
export enum EPageUrl
{
	/// Page to be displayed when no API key has been provided.
	NoApiKey,

	/// Tab that displays the list of conversations.
	Conversations,

	/// Tab that displays the thread graph.
	ThreadGraph,

	/// Tab that displays the chat.
	Chat,

	/// Page that displays the new conversation form.
	NewConversation
}
