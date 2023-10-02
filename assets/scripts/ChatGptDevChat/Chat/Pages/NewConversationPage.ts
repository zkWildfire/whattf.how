import { IApiKeyProvider } from "../../Auth/ApiKeyProvider";
import { EPageUrl } from "./PageUrl";
import { LinearConversation } from "../Conversations/LinearConversation";
import { Gpt3_16k } from "../LLMs/Gpt3_16k";
import { Gpt3_4k } from "../LLMs/Gpt3_4k";
import { Gpt4_32k } from "../LLMs/Gpt4_32k";
import { Gpt4_8k } from "../LLMs/Gpt4_8k";
import { ILlm } from "../LLMs/Llm";
import { LoremIpsum } from "../LLMs/LoremIpsum";
import { LlmMessage } from "../Messages/LlmMessage";
import { WhitespaceMessage } from "../Messages/WhitespaceMessage";
import { ERole } from "../Role";
import { IConversationsService } from "../Services/Conversations/ConversationsService";
import { IConversationSessionService } from "../Services/Sessions/ConversationSessionService";
import { IThreadSessionService } from "../Services/Sessions/ThreadSessionService";
import { LinearChatThread } from "../Threads/LinearChatThread";
import { INumberInputElement } from "../../Util/NumberInputElement";
import { IPageElementLocator } from "../../Util/PageElementLocator";
import { ITextAreaElement } from "../../Util/TextAreaElement";
import { ITextInputElement } from "../../Util/TextInputElement";
import { IPage } from "./Page";

/// Class that represents the new conversation page.
export class NewConversationPage extends IPage
{
	/// Service used to get the API key to use for the LLM API.
	private readonly _apiKeyProvider: IApiKeyProvider;

	/// Service used to manage conversations.
	private readonly _conversationsService: IConversationsService;

	/// Service used to manage the active conversation.
	private readonly _conversationSessionService: IConversationSessionService;

	/// Service used to manage the active thread.
	private readonly _threadSessionService: IThreadSessionService;

	/// Page elements used by the page.
	private readonly _pageElements = new NewConversationPageElements();

	/// Initializes the page.
	/// @param apiKeyProvider Service used to get the API key to use for the LLM
	///   API.
	/// @param conversationsService Service used to manage conversations.
	/// @param conversationSessionService Service used to manage the active
	///   conversation.
	/// @param threadSessionService Service used to manage the active thread.
	constructor(
		apiKeyProvider: IApiKeyProvider,
		conversationsService: IConversationsService,
		conversationSessionService: IConversationSessionService,
		threadSessionService: IThreadSessionService)
	{
		super(EPageUrl.NewConversation);
		this._apiKeyProvider = apiKeyProvider;
		this._conversationsService = conversationsService;
		this._conversationSessionService = conversationSessionService;
		this._threadSessionService = threadSessionService;

		// Bind to event handlers
		this._pageElements.CreateConversationButton.addEventListener(
			"click",
			() => this.OnCreateConversation()
		);
		this._pageElements.Gpt3_4kRadioButton.addEventListener("change", () =>
		{
			this._pageElements.TargetContextWindowSizeInput.OnLlmChanged(
				new Gpt3_4k()
			);
		});
		this._pageElements.Gpt3_16kRadioButton.addEventListener("change", () =>
		{
			this._pageElements.TargetContextWindowSizeInput.OnLlmChanged(
				new Gpt3_16k()
			);
		});
		this._pageElements.Gpt4_8kRadioButton.addEventListener("change", () =>
		{
			this._pageElements.TargetContextWindowSizeInput.OnLlmChanged(
				new Gpt4_8k()
			);
		});
		this._pageElements.Gpt4_32kRadioButton.addEventListener("change", () =>
		{
			this._pageElements.TargetContextWindowSizeInput.OnLlmChanged(
				new Gpt4_32k()
			);
		});
		this._pageElements.LoremIpsumRadioButton.addEventListener("change", () =>
		{
			this._pageElements.TargetContextWindowSizeInput.OnLlmChanged(
				new LoremIpsum()
			);
		});
	}

	/// Displays the page.
	public Show(): void
	{
		this._pageElements.PageContainer.classList.remove("d-none");
		this._onShow.dispatch(this);
	}

	/// Hides the page.
	public Hide(): void
	{
		this._pageElements.PageContainer.classList.add("d-none");
		this._onHide.dispatch(this);
	}

	/// Callback invoked when the user clicks the create conversation button
	/// @param pageElements The elements on the new conversation page.
	/// @param apiKeyProvider Service for retrieving the API key for the LLM API.
	/// @param conversationsService Service for managing conversations.
	private async OnCreateConversation()
	{
		// Validate all inputs
		// Note that `&&=` must not be used here since all validation methods
		//   should be run regardless of whether a previous validation method
		//   failed. If `&&=` is used (or if the `isValid` variable is the first
		//   operand to `&&`), short-circuiting will occur if a validation
		//   method fails and the remaining validation methods will not be run.
		let isValid = true;
		isValid = this._pageElements.ConversationNameInput.Validate() && isValid;
		isValid = this._pageElements.InitialMessageInput.Validate() && isValid;
		if (!isValid)
		{
			return;
		}

		// Create the objects for the conversation
		const llm = this._pageElements.SelectedLlm;
		// TODO: Replace `WhitespaceMessage` with a message implementation that
		//   uses OpenAI's tokenizer
		const initialMessage = new WhitespaceMessage(
			null,
			ERole.User,
			this._pageElements.InitialMessageInput.Value,
		);
		// TODO: Disable the `Create` button while waiting for a response
		const response = await llm.SendPrompt({
			History: [],
			Message: initialMessage,
			ApiKey: this._apiKeyProvider.ApiKeyRaw
		});
		const thread = new LinearChatThread(
			llm,
			this._apiKeyProvider,
			this._pageElements.TargetContextWindowSizeInput.Value,
			new LlmMessage(
				initialMessage,
				response[0].Contents,
				response[0].TotalTokens
			)
		);
		const conversation = new LinearConversation(
			this._pageElements.ConversationNameInput.Value,
			llm,
			this._pageElements.TargetContextWindowSizeInput.Value,
			thread
		);

		// Update services to reflect the new conversation
		this._conversationsService.AddConversation(conversation);
		this._conversationSessionService.ActiveConversation = conversation;
		this._threadSessionService.ActiveThread = thread;

		// Reset page elements to their default states
		// Not all page elements are reset here; only the page elements whose
		//   values are not likely to be relevant to the next conversation are
		//   reset
		this._pageElements.ConversationNameInput.Value = "";
		this._pageElements.InitialMessageInput.Value = "";

		// Set the active tab to the chat tab
		this._onRedirect.dispatch(EPageUrl.Chat);
	}
}

/// Helper class for locating key page elements.
class NewConversationPageElements extends IPageElementLocator
{
	/// Gets the container element for the page.
	get PageContainer(): HTMLDivElement
	{
		return this.GetElementById<HTMLDivElement>(
			NewConversationPageElements.ID_PAGE_CONTAINER
		);
	}

	/// Gets the wrapper for the conversation name input element.
	get ConversationNameInput(): ConversationNameInput
	{
		return this._conversationNameInput;
	}

	/// Gets the GPT-3.5 (4K) radio button.
	get Gpt3_4kRadioButton(): HTMLInputElement
	{
		return this.GetElementById<HTMLInputElement>(
			NewConversationPageElements.ID_LLM_GPT3_4K
		);
	}

	/// Gets the GPT-3.5 (16K) radio button.
	get Gpt3_16kRadioButton(): HTMLInputElement
	{
		return this.GetElementById<HTMLInputElement>(
			NewConversationPageElements.ID_LLM_GPT3_16K
		);
	}

	/// Gets the GPT-4 (8K) radio button.
	get Gpt4_8kRadioButton(): HTMLInputElement
	{
		return this.GetElementById<HTMLInputElement>(
			NewConversationPageElements.ID_LLM_GPT4_8K
		);
	}

	/// Gets the GPT-4 (32K) radio button.
	get Gpt4_32kRadioButton(): HTMLInputElement
	{
		return this.GetElementById<HTMLInputElement>(
			NewConversationPageElements.ID_LLM_GPT4_32K
		);
	}

	/// Gets the Lorem Ipsum radio button.
	get LoremIpsumRadioButton(): HTMLInputElement
	{
		return this.GetElementById<HTMLInputElement>(
			NewConversationPageElements.ID_LLM_LOREM_IPSUM
		);
	}

	/// Gets the array of all LLM radio buttons.
	get LlmRadioButtons(): HTMLInputElement[]
	{
		return this._llmRadioButtons;
	}

	/// Gets the selected LLM radio button.
	get SelectedLlm(): ILlm
	{
		return this._targetContextWindowSizeInput.Llm;
	}

	/// Gets the wrapper for the target context window size input element.
	get TargetContextWindowSizeInput(): ContextWindowSizeInput
	{
		return this._targetContextWindowSizeInput;
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

	/// ID for the container for all page elements
	private static readonly ID_PAGE_CONTAINER = "tab-new-conversation";

	/// ID for the conversation name text input
	private static readonly ID_CONVERSATION_NAME_INPUT = "input-conversation-name";

	/// IDs for the LLM radio buttons
	private static readonly ID_LLM_GPT3_4K = "input-llm-gpt-3.5-4k";
	private static readonly ID_LLM_GPT3_16K = "input-llm-gpt-3.5-16k";
	private static readonly ID_LLM_GPT4_8K = "input-llm-gpt-4-8k";
	private static readonly ID_LLM_GPT4_32K = "input-llm-gpt-4-32k";
	private static readonly ID_LLM_LOREM_IPSUM = "input-llm-lorem-ipsum";

	/// ID for the target context window size input
	private static readonly ID_TARGET_CONTEXT_WINDOW_SIZE_INPUT =
		"input-context-window-size";

	/// ID for the initial message text box
	private static readonly ID_INITIAL_MESSAGE_INPUT = "input-initial-message";

	/// ID for the error message label for the conversation name
	private static readonly ID_CONVERSATION_NAME_ERROR = "label-conversation-name-error";

	/// ID for the error message label for the target context window size
	private static readonly ID_TARGET_CONTEXT_WINDOW_SIZE_ERROR =
		"label-context-window-size-error";

	/// ID for the error message label for the initial message
	private static readonly ID_INITIAL_MESSAGE_ERROR = "label-initial-message-error";

	/// ID for the submit button
	private static readonly ID_CREATE_CONVERSATION_BUTTON = "button-create-conversation";

	/// Text input for the conversation name
	private readonly _conversationNameInput: ConversationNameInput;

	/// Number input for the target context window size
	private readonly _targetContextWindowSizeInput: ContextWindowSizeInput;

	/// Text input for the initial message
	private readonly _initialMessageInput: InitialMessageInput;

	/// Array of all LLM radio buttons
	private readonly _llmRadioButtons: HTMLInputElement[];

	/// Initializes the class.
	constructor()
	{
		super([
			NewConversationPageElements.ID_PAGE_CONTAINER,
			NewConversationPageElements.ID_CONVERSATION_NAME_INPUT,
			NewConversationPageElements.ID_LLM_GPT3_4K,
			NewConversationPageElements.ID_LLM_GPT3_16K,
			NewConversationPageElements.ID_LLM_GPT4_8K,
			NewConversationPageElements.ID_LLM_GPT4_32K,
			NewConversationPageElements.ID_LLM_LOREM_IPSUM,
			NewConversationPageElements.ID_TARGET_CONTEXT_WINDOW_SIZE_INPUT,
			NewConversationPageElements.ID_TARGET_CONTEXT_WINDOW_SIZE_ERROR,
			NewConversationPageElements.ID_INITIAL_MESSAGE_INPUT,
			NewConversationPageElements.ID_CONVERSATION_NAME_ERROR,
			NewConversationPageElements.ID_INITIAL_MESSAGE_ERROR,
			NewConversationPageElements.ID_CREATE_CONVERSATION_BUTTON
		]);

		// Initialize the radio buttons array
		this._llmRadioButtons = [
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

		// Initialize the input wrappers
		this._conversationNameInput = new ConversationNameInput(
			this.GetElementById<HTMLInputElement>(
				NewConversationPageElements.ID_CONVERSATION_NAME_INPUT
			),
			this.GetElementById<HTMLElement>(
				NewConversationPageElements.ID_CONVERSATION_NAME_ERROR
			)
		);

		this._targetContextWindowSizeInput = new ContextWindowSizeInput(
			this.GetElementById<HTMLInputElement>(
				NewConversationPageElements.ID_TARGET_CONTEXT_WINDOW_SIZE_INPUT
			),
			this.GetElementById<HTMLElement>(
				NewConversationPageElements.ID_TARGET_CONTEXT_WINDOW_SIZE_ERROR
			),
			// This must always match the default LLM selected in the tab's HTML
			new Gpt4_8k()
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

/// Class for managing the target context window size input element.
class ContextWindowSizeInput extends INumberInputElement
{
	/// Currently selected LLM.
	get Llm(): ILlm
	{
		return this._llm;
	}

	/// Field backing the `Llm` property.
	private _llm: ILlm;

	/// Initializes the class.
	/// @param inputElement Input element to manage.
	/// @param errorElement Error element to display error messages in.
	/// @param llm Currently selected LLM.
	constructor(
		inputElement: HTMLInputElement,
		errorElement: HTMLElement,
		llm: ILlm)
	{
		super(inputElement, errorElement);
		this._llm = llm;

		// Use half the LLM's context window size as the default target context
		//   window size
		this.Value = Math.floor(llm.ContextWindowSize / 2);
	}

	/// Notifies the class that the currently selected LLM has changed.
	/// @param llm New currently selected LLM.
	public OnLlmChanged(llm: ILlm): void
	{
		this._llm = llm;
		this.Value = Math.floor(llm.ContextWindowSize / 2);
	}

	/// Validates the current value of the input element.
	/// @returns If the input is valid, the method will return `null`.
	///   If the input is invalid, the method will return an error message.
	protected ValidateInput(): string | null
	{
		const value = this.Value;
		if (value < 0)
		{
			return "Context window size cannot be negative.";
		}

		// Validate that the context window size is not larger than the LLM's
		//   context window size
		if (value > this._llm.ContextWindowSize)
		{
			return "Context window size cannot be larger than the LLM's " +
				"context window size.";
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
