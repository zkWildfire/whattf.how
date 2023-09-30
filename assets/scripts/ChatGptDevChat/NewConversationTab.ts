import { IPageElementLocator } from "./Util/PageElementLocator";
import { ITextAreaElement } from "./Util/TextAreaElement";
import { ITextInputElement } from "./Util/TextInputElement";

/// Sets up all event handlers for the new conversation tab
export const BindNewConversationEventHandlers = () =>
{
	// Find key page elements
	const pageElements = new NewConversationPageElements();

	// Bind to event handlers
	pageElements.CreateConversationButton.addEventListener("click", () =>
	{
		OnCreateConversation(pageElements);
	});
}

/// Helper class for locating key page elements.
class NewConversationPageElements extends IPageElementLocator
{
	/// Gets the wrapper for the conversation name input element.
	get ConversationNameInput(): ConversationNameInput
	{
		return this._conversationNameInput;
	}

	/// Gets the selected LLM radio button.
	get SelectedLlmRadioButton(): HTMLInputElement
	{
		// Find all LLM radio buttons
		const llmRadioButtons = [
			this.GetElementById<HTMLInputElement>(
				NewConversationPageElements.ID_LLM_GPT3_4K
			),
			this.GetElementById<HTMLInputElement>(
				NewConversationPageElements.ID_LLM_GPT3_16K
			),
			this.GetElementById<HTMLInputElement>(
				NewConversationPageElements.ID_LLM_GPT4_8K
			),
			this.GetElementById<HTMLInputElement>(
				NewConversationPageElements.ID_LLM_GPT4_32K
			),
			this.GetElementById<HTMLInputElement>(
				NewConversationPageElements.ID_LLM_LOREM_IPSUM
			)
		];

		// Find the selected radio button
		const selectedRadioButton = llmRadioButtons.find(
			(radioButton) => radioButton.checked
		);
		if (!selectedRadioButton)
		{
			throw new Error("No LLM radio button is selected.");
		}

		return selectedRadioButton;
	}

	/// Gets the wrapper for the initial message input element.
	get InitialMessageInput(): InitialMessageInput
	{
		return this._initialMessageInput;
	}

	/// Gets the button for creating a new conversation.
	get CreateConversationButton(): HTMLButtonElement
	{
		return this.GetElementById<HTMLButtonElement>(
			NewConversationPageElements.ID_CREATE_CONVERSATION_BUTTON
		);
	}

	/// ID for the conversation name text input
	private static readonly ID_CONVERSATION_NAME_INPUT = "input-conversation-name";

	/// IDs for the LLM radio buttons
	private static readonly ID_LLM_GPT3_4K = "input-llm-gpt-3.5-4k";
	private static readonly ID_LLM_GPT3_16K = "input-llm-gpt-3.5-4k";
	private static readonly ID_LLM_GPT4_8K = "input-llm-gpt-4-8k";
	private static readonly ID_LLM_GPT4_32K = "input-llm-gpt-4-32k";
	private static readonly ID_LLM_LOREM_IPSUM = "input-llm-lorem-ipsum";

	/// ID for the initial message text box
	private static readonly ID_INITIAL_MESSAGE_INPUT = "input-initial-message";

	/// ID for the error message label for the conversation name
	private static readonly ID_CONVERSATION_NAME_ERROR = "label-conversation-name-error";

	/// ID for the error message label for the initial message
	private static readonly ID_INITIAL_MESSAGE_ERROR = "label-initial-message-error";

	/// ID for the submit button
	private static readonly ID_CREATE_CONVERSATION_BUTTON = "button-create-conversation";

	/// Text input for the conversation name
	private readonly _conversationNameInput: ConversationNameInput;

	/// Text input for the initial message
	private readonly _initialMessageInput: InitialMessageInput;

	/// Initializes the class.
	constructor()
	{
		super([
			NewConversationPageElements.ID_CONVERSATION_NAME_INPUT,
			NewConversationPageElements.ID_LLM_GPT3_4K,
			NewConversationPageElements.ID_LLM_GPT3_16K,
			NewConversationPageElements.ID_LLM_GPT4_8K,
			NewConversationPageElements.ID_LLM_GPT4_32K,
			NewConversationPageElements.ID_LLM_LOREM_IPSUM,
			NewConversationPageElements.ID_INITIAL_MESSAGE_INPUT,
			NewConversationPageElements.ID_CONVERSATION_NAME_ERROR,
			NewConversationPageElements.ID_INITIAL_MESSAGE_ERROR,
			NewConversationPageElements.ID_CREATE_CONVERSATION_BUTTON
		]);

		// Initialize the text inputs
		this._conversationNameInput = new ConversationNameInput(
			this.GetElementById<HTMLInputElement>(
				NewConversationPageElements.ID_CONVERSATION_NAME_INPUT
			),
			this.GetElementById<HTMLElement>(
				NewConversationPageElements.ID_CONVERSATION_NAME_ERROR
			)
		);
		this._initialMessageInput = new InitialMessageInput(
			this.GetElementById<HTMLTextAreaElement>(
				NewConversationPageElements.ID_INITIAL_MESSAGE_INPUT
			),
			this.GetElementById<HTMLElement>(
				NewConversationPageElements.ID_INITIAL_MESSAGE_ERROR
			)
		);
	}
}

/// Class for managing the conversation name input element.
class ConversationNameInput extends ITextInputElement
{
	/// Validates the current value of the input element.
	/// @returns If the input is valid, the method will return `null`.
	///   If the input is invalid, the method will return an error message.
	protected ValidateInput(): string | null
	{
		const value = this.Value;
		if (!value || /^\s*$/.test(value))
		{
			return "Conversation name cannot be empty.";
		}

		return null;
	}
}

/// Class for managing the initial message input element.
class InitialMessageInput extends ITextAreaElement
{
	/// Validates the current value of the input element.
	/// @returns If the input is valid, the method will return `null`.
	///   If the input is invalid, the method will return an error message.
	protected ValidateInput(): string | null
	{
		const value = this.Value;
		if (!value || /^\s*$/.test(value))
		{
			return "Initial message cannot be empty.";
		}

		return null;
	}
}

/// Callback invoked when the user clicks the create conversation button
/// @param pageElements The elements on the new conversation page.
const OnCreateConversation = (pageElements: NewConversationPageElements) =>
{
	// Validate all inputs
	// Note that `&&=` must not be used here since all validation methods should
	//   be run regardless of whether a previous validation method failed. If
	//   `&&=` is used (or if the `isValid` variable is the first operand to
	//   `&&`), short-circuiting will occur if a validation method fails and the
	//   remaining validation methods will not be run.
	let isValid = true;
	isValid = pageElements.ConversationNameInput.Validate() && isValid;
	isValid = pageElements.InitialMessageInput.Validate() && isValid;
	if (!isValid)
	{
		return;
	}

	// TODO: Create the conversation
}
