/// Identifies each tab that may be displayed by the Dev Chat.
export enum EChatTab
{
	/// Tab to be displayed when no API key has been provided.
	NoApiKey,

	/// Tab that displays the list of conversations.
	Conversations,

	/// Tab that displays the thread graph.
	ThreadGraph,

	/// Tab that displays the chat.
	Chat,

	/// Tab that displays the new conversation form.
	NewConversation
}
