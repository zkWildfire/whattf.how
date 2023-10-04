import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";
import { IConversation } from "../../Conversations/Conversation";
import { IConversationsService } from "./ConversationsService";
import { ERole } from "../../Role";
import { IChatThread } from "../../Threads/ChatThread";
import { IMessage } from "../../Messages/Message";
import { ELlmType } from "../../LLMs/LlmType";
import { PromptMessage } from "../../Messages/WhitespaceMessage";
import assert from "assert";
import { LinearChatThread } from "../../Threads/LinearChatThread";
import { Gpt3_4k } from "../../LLMs/Gpt3_4k";
import { Gpt3_16k } from "../../LLMs/Gpt3_16k";
import { Gpt4_8k } from "../../LLMs/Gpt4_8k";
import { Gpt4_32k } from "../../LLMs/Gpt4_32k";
import { IApiKeyProvider } from "../../../Auth/ApiKeyProvider";
import { NaiveConversation } from "../../Conversations/NaiveConversation";
import { ILlm } from "../../LLMs/Llm";
import { LoremIpsum } from "../../LLMs/LoremIpsum";

/// Service that stores conversations in local storage.
export class LocalStorageConversationsService implements IConversationsService
{
	/// Event that is fired when a conversation is created.
	/// The event arguments will be the conversation that was created.
	get OnConversationCreated(): ISimpleEvent<IConversation>
	{
		return this._onConversationCreated.asEvent();
	}

	/// Event that is fired when a conversation is deleted.
	/// The event arguments will be the conversation that was deleted.
	get OnConversationDeleted(): ISimpleEvent<IConversation>
	{
		return this._onConversationDeleted.asEvent();
	}

	/// Event that is fired when a conversation is selected.
	/// The event arguments will be the conversation that was selected.
	get OnConversationSelected(): ISimpleEvent<IConversation>
	{
		return this._onConversationSelected.asEvent();
	}

	/// Number of conversations that have been created.
	/// This value counts the number of active conversations, e.g. conversations
	///   that have been created and have not been deleted.
	get Count(): number
	{
		return this._conversations.length;
	}

	/// Gets the conversations in the order they should appear on the UI.
	get Conversations(): IConversation[]
	{
		return this._conversations.map(wrapper => wrapper.conversation);
	}

	/// Gets the selected conversation, if any.
	get ActiveConversation(): IConversation | null
	{
		if (this._activeIndex === -1)
		{
			return null;
		}
		else
		{
			return this._conversations[this._activeIndex].conversation;
		}
	}

	/// Event dispatcher backing the `OnConversationCreated` event.
	private readonly _onConversationCreated =
		new SimpleEventDispatcher<IConversation>();

	/// Event dispatcher backing the `OnConversationDeleted` event.
	private readonly _onConversationDeleted =
		new SimpleEventDispatcher<IConversation>();

	/// Event dispatcher backing the `OnConversationSelected` event.
	private readonly _onConversationSelected =
		new SimpleEventDispatcher<IConversation>();

	/// List of conversations in the order they were added.
	private readonly _conversations: ConversationWrapper[] = [];

	/// Index of the currently selected conversation.
	private _activeIndex = -1;

	/// Initializes the service.
	/// @param apiKeyProvider API key provider used by the conversations.
	constructor(apiKeyProvider: IApiKeyProvider)
	{
		// Load all conversations from local storage
		const conversationIds = ConversationHelper.ConversationIds;
		for (const id of conversationIds)
		{
			try
			{
				const wrapper = ConversationHelper.LoadConversation(
					id,
					apiKeyProvider
				);
				this.BindToConversationEvents(wrapper);
				this._conversations.push(wrapper);
			}
			catch (e)
			{
				// TODO: Improve error handling
				console.error(e);
			}
		}

		// Sort the conversations so that they appear in the same order as their
		//   index values
		this._conversations.sort((a, b) => a.index - b.index);
	}

	/// Adds a new conversation.
	/// @param conversation Conversation to add.
	/// @returns The index that the conversation was added at in the
	///   `Conversations` property.
	public AddConversation(conversation: IConversation): number
	{
		// Create the wrapper for the conversation
		const wrapper: ConversationWrapper =
		{
			conversation,
			index: this._conversations.length
		};

		// Save the conversation to local storage
		ConversationHelper.SaveConversation(conversation, wrapper.index);
		this.BindToConversationEvents(wrapper);

		// Add the conversation to the list of conversations
		this._conversations.push(wrapper);
		this._onConversationCreated.dispatch(conversation);
		return wrapper.index;
	}

	/// Deletes a conversation.
	/// @param conversation Conversation to delete. If this is a conversation
	///   object, it must be one of the conversations returned by the
	///   `Conversations` property. If this is a number, it must be an index
	///   into the `Conversations` property.
	/// @returns Whether the conversation was deleted.
	public DeleteConversation(conversation: IConversation | number): boolean
	{
		/// Get the index of the conversation to delete
		let index: number;
		if (typeof conversation === "number")
		{
			if (conversation < 0 || conversation >= this._conversations.length)
			{
				throw new Error(
					`Expected index ${conversation} to be in the range` +
					`[0, ${this._conversations.length})`
				);
			}
			index = conversation;
		}
		else
		{
			index = this._conversations.findIndex(
				wrapper => wrapper.conversation === conversation
			);
		}

		// Make sure the conversation exists
		if (index === -1)
		{
			return false;
		}

		// Delete the conversation
		const wrapper = this._conversations[index];
		ConversationHelper.DeleteConversation(wrapper.conversation);
		if (this._activeIndex === index)
		{
			this._activeIndex = -1;
		}
		this._conversations.splice(index, 1);
		this._onConversationDeleted.dispatch(wrapper.conversation);
		return true;
	}

	/// Selects the specified conversation as the active conversation.
	/// @param conversation Conversation to select. If this is a conversation
	///   object, it must be one of the conversations returned by the
	///   `Conversations` property. If this is a number, it must be an index
	///   into the `Conversations` property.
	public SelectConversation(conversation: IConversation | number): void
	{
		/// Get the index of the conversation to select
		let index: number;
		if (typeof conversation === "number")
		{
			if (conversation < 0 || conversation >= this._conversations.length)
			{
				throw new Error(
					`Expected index ${conversation} to be in the range` +
					`[0, ${this._conversations.length})`
				);
			}
			index = conversation;
		}
		else
		{
			index = this._conversations.findIndex(
				wrapper => wrapper.conversation === conversation
			);
		}

		// Make sure the conversation exists
		if (index === -1)
		{
			throw new Error(
				`Failed to find the conversation "${conversation}"`
			);
		}

		// Set the active conversation
		this._activeIndex = index;
		assert(this.ActiveConversation !== null);
		this._onConversationSelected.dispatch(this.ActiveConversation);
	}

	/// Binds event handlers to the conversation's events.
	/// @param conversation Conversation to bind to.
	private BindToConversationEvents(conversation: ConversationWrapper): void
	{
		// Bind to threads currently in the conversation
		conversation.conversation.Threads.forEach(t =>
			this.BindToThreadEvents(conversation, t)
		);

		// Make sure that if any new threads are added, they get saved and
		//   the event handlers are bound to them
		conversation.conversation.OnThreadAdded.subscribe((c, t) =>
		{
			// Add the new thread to local storage
			ThreadHelper.SaveThread(t);

			// Make sure that any changes to the thread are saved to local
			//   storage as well
			this.BindToThreadEvents(conversation, t);
		});
	}

	/// Binds event handlers to the thread's events.
	/// @param conversation Conversation that the thread belongs to.
	/// @param thread Thread to bind to.
	private BindToThreadEvents(
		conversation: ConversationWrapper,
		thread: IChatThread): void
	{
		// Whenever new messages are added to the thread, save them to local
		//   storage and update the thread's local storage entry
		thread.OnThreadUpdated.subscribe((t, count) =>
		{
			// The conversation's local storage object will have all message IDs
			//   for the conversation, so it needs to be updated whenever a new
			//   message is added to the thread
			ConversationHelper.SaveConversation(
				conversation.conversation,
				conversation.index
			);

			// Save the thread to local storage
			ThreadHelper.SaveThread(t);

			// Walk up the thread's messages until all new messages have been
			//   saved
			let message: IMessage | null = t.LastMessage;
			for (let i = 0; i < count; i++)
			{
				if (message == null)
				{
					break;
				}

				MessageHelper.SaveMessage(message);
				message = message.Parent;
			}
		});
	}
}

/// Helper class used to encapsulate all conversation serialization logic.
class ConversationHelper
{
	/// ID used for the collection that stores the IDs of all saved conversations.
	/// This collection is needed so that the helper knows which conversations
	///   have been previously saved.
	private static readonly CONVERSATIONS_KEY = "conversations";

	/// Gets the IDs of all conversations that have been saved.
	static get ConversationIds(): Set<string>
	{
		const item = localStorage.getItem(this.CONVERSATIONS_KEY);
		if (item === null)
		{
			return new Set<string>();
		}
		else
		{
			return new Set<string>(JSON.parse(item));
		}
	}

	/// Removes a conversation from local storage.
	/// This will also remove all threads and messages in the conversation
	///   from local storage.
	/// @param conversation Conversation to remove.
	public static DeleteConversation(conversation: IConversation): void
	{
		// Delete the conversation from local storage
		localStorage.removeItem(conversation.Id);

		// Update the collection of saved conversations
		const conversationIds = ConversationHelper.ConversationIds;
		conversationIds.delete(conversation.Id);
		localStorage.setItem(
			this.CONVERSATIONS_KEY,
			JSON.stringify(Array.from(conversationIds.values()))
		);

		// Delete all threads in the conversation
		ThreadHelper.DeleteThreads(conversation.Threads);
	}

	/// Loads a conversation from local storage.
	/// @param id ID of the conversation to load.
	/// @param apiKeyProvider API key provider used by the conversation.
	/// @throws Error If the conversation could not be loaded.
	/// @returns The loaded conversation.
	public static LoadConversation(
		id: string,
		apiKeyProvider: IApiKeyProvider): ConversationWrapper
	{
		// Load the conversation from local storage
		const item = localStorage.getItem(id);
		if (item === null)
		{
			throw new Error(
				`Failed to find a conversation with the ID "${id}"`
			);
		}
		const jsonConversation: JsonConversation = JSON.parse(item);

		// Construct the LLM instance corresponding to the conversation's LLM
		//   type
		const llm = ((llmType: ELlmType) =>
		{
			switch (llmType)
			{
			case ELlmType.Gpt3_4k:
				return new Gpt3_4k();
			case ELlmType.Gpt3_16k:
				return new Gpt3_16k();
			case ELlmType.Gpt4_8k:
				return new Gpt4_8k();
			case ELlmType.Gpt4_32k:
				return new Gpt4_32k();
			case ELlmType.LoremIpsum:
				return new LoremIpsum();
			default:
				throw new Error(`Unexpected LLM type "${llmType}"`);
			}
		})(jsonConversation.llm);

		// Load all messages in the conversation
		const messages = MessageHelper.LoadMessages(
			new Set<string>(jsonConversation.messageIds)
		);

		// Load all threads in the conversation
		const threads = ThreadHelper.LoadThreads(
			new Set<string>(jsonConversation.threadIds),
			apiKeyProvider,
			llm,
			jsonConversation.targetContextWindowSize,
			messages
		);

		// Create the conversation
		const conversation = new NaiveConversation(
			id,
			jsonConversation.name,
			llm,
			jsonConversation.targetContextWindowSize,
			Array.from(threads.values())
		);
		return {
			conversation,
			index: jsonConversation.index
		};
	}

	/// Saves a conversation to local storage.
	/// If the conversation has already been saved, this will update the
	///   existing entry. This will also save all threads and messages in the
	///   conversation.
	/// @param conversation Conversation to save.
	/// @param index Index of the conversation in the `Conversations` property.
	public static SaveConversation(
		conversation: IConversation,
		index: number): void
	{
		// Collect all message IDs
		const messages = conversation.AccumulateMessages(
			(ms, message) => ms.add(message),
			new Set<IMessage>()
		);
		const messageIds = new Set(Array.from(messages.values()).map(m => m.Id));

		// Convert the conversation to a JSON-serializable representation
		const jsonConversation: JsonConversation =
		{
			index: index,
			name: conversation.Name,
			llm: conversation.Llm.LlmType,
			targetContextWindowSize: conversation.TargetContextWindowSize,
			rootMessageId: conversation.RootMessage.Id,
			threadIds: conversation.Threads.map(t => t.Id),
			messageIds: Array.from(messageIds)
		};

		// Save the conversation to local storage
		localStorage.setItem(
			conversation.Id,
			JSON.stringify(jsonConversation)
		);
		conversation.Threads.forEach(t => ThreadHelper.SaveThread(t));
		messages.forEach(m => MessageHelper.SaveMessage(m));

		// Update the collection of saved conversations
		const conversationIds = ConversationHelper.ConversationIds;
		conversationIds.add(conversation.Id);
		localStorage.setItem(
			this.CONVERSATIONS_KEY,
			JSON.stringify(Array.from(conversationIds.values()))
		);
	}
}

/// Helper class used to encapsulate all thread serialization logic.
class ThreadHelper
{
	/// Removes threads from local storage.
	/// @param threadIds IDs of the threads to remove.
	public static DeleteThreads(threads: IChatThread[]): void
	{
		for (const thread of threads)
		{
			ThreadHelper.DeleteThread(thread);
		}
	}

	/// Removes a thread from local storage.
	/// This will also remove all messages in the thread from local storage.
	/// @param thread Thread to remove.
	public static DeleteThread(thread: IChatThread): void
	{
		localStorage.removeItem(thread.Id);

		// Walk up the thread and collect each message until a message that is
		//   part of multiple threads is reached
		const messages: Set<string> = new Set<string>();
		const walkThread = (message: IMessage) =>
		{
			// If the message has multiple children, then the message is part
			//   of multiple threads. Ignore it.
			if (message.Children.length > 1)
			{
				return;
			}

			if (message.Parent !== null)
			{
				walkThread(message.Parent);
			}
			messages.add(message.Id);
		}
		walkThread(thread.LastMessage);

		// Delete the messages
		MessageHelper.DeleteMessages(messages);
	}

	/// Loads a set of threads from local storage.
	/// @param ids IDs of the threads to load.
	/// @param apiKeyProvider API key provider used by the threads.
	/// @param llm LLM used by the threads.
	/// @param targetContextWindowSize Target context window size for the
	///   threads, in number of tokens.
	/// @param messages Collection of all messages that are in the threads being
	///   loaded. Each message must be indexed by its ID.
	/// @throws Error If any of the threads could not be loaded.
	/// @returns The loaded threads, keyed by their IDs.
	public static LoadThreads(
		ids: Set<string>,
		apiKeyProvider: IApiKeyProvider,
		llm: ILlm,
		targetContextWindowSize: number,
		messages: Map<string, IMessage>): Map<string, IChatThread>
	{
		// Load each thread's JSON data from local storage
		const jsonThreads = new Map<string, JsonThread>();
		ids.forEach(id => jsonThreads.set(id, ThreadHelper.LoadThread(id)));

		// Construct the threads
		const threads = new Map<string, IChatThread>();
		for (const [id, jsonThread] of jsonThreads)
		{
			// Load the root message
			const rootMessage = messages.get(jsonThread.rootMessageId);
			if (rootMessage === undefined)
			{
				throw new Error(
					`Failed to find the root message of the thread with the ` +
					`ID "${id}"`
				);
			}

			// Make sure all messages from the thread are in the messages map
			for (const messageId of jsonThread.messageIds)
			{
				if (!messages.has(messageId))
				{
					throw new Error(
						`Failed to find the message with the ID "${messageId}" ` +
						`in the thread with the ID "${id}"`
					);
				}
			}

			// Get the last message in the thread
			const lastMessageId = jsonThread.messageIds[
				jsonThread.messageIds.length - 1
			];
			const lastMessage = messages.get(lastMessageId);
			assert(lastMessage !== undefined);

			// Create the thread
			const thread = new LinearChatThread(
				id,
				llm,
				apiKeyProvider,
				targetContextWindowSize,
				lastMessage
			)
			threads.set(id, thread);
		}

		return threads;
	}

	/// Saves a thread to local storage.
	/// If the thread has already been saved, this will update the existing
	///   entry. This will also save all messages in the thread.
	/// @param thread Thread to save.
	public static SaveThread(thread: IChatThread): void
	{
		// Walk up the thread and collect each message
		const messages: IMessage[] = [];
		const walkThread = (message: IMessage) =>
		{
			if (message.Parent !== null)
			{
				walkThread(message.Parent);
			}
			messages.push(message);
		}
		walkThread(thread.LastMessage);

		// Convert the thread to a JSON-serializable representation
		const jsonThread: JsonThread =
		{
			rootMessageId: thread.RootMessage.Id,
			messageIds: messages.map(m => m.Id)
		};

		// Save the thread to local storage
		localStorage.setItem(
			thread.Id,
			JSON.stringify(jsonThread)
		);
		messages.forEach(m => MessageHelper.SaveMessage(m));
	}

	/// Loads a thread from local storage.
	/// @param id ID of the thread to load.
	/// @throws Error If the thread could not be loaded.
	/// @returns The loaded thread.
	private static LoadThread(id: string): JsonThread
	{
		// Load the thread from local storage
		const item = localStorage.getItem(id);
		if (item === null)
		{
			throw new Error(`Failed to find a thread with the ID "${id}"`);
		}
		return JSON.parse(item);
	}
}

/// Helper class used to encapsulate all message serialization logic.
class MessageHelper
{
	/// Removes messages from local storage.
	/// @param messageIds IDs of the messages to remove.
	public static DeleteMessages(messageIds: Set<string>): void
	{
		for (const id of messageIds)
		{
			localStorage.removeItem(id);
		}
	}

	/// Removes a message from local storage.
	/// @param message Message to remove.
	public static DeleteMessage(message: IMessage): void
	{
		localStorage.removeItem(message.Id);
	}

	/// Loads a set of messages from local storage.
	/// @param ids IDs of the messages to load.
	/// @throws Error If any of the messages could not be loaded.
	/// @returns The loaded messages, keyed by their IDs.
	public static LoadMessages(ids: Set<string>): Map<string, IMessage>
	{
		// Load each message's JSON data from local storage
		const jsonMessages = new Map<string, JsonMessageEx>();
		ids.forEach(id => jsonMessages.set(id, MessageHelper.LoadMessage(id)));

		// Iterate over each message and make sure that its parent exists
		for (const [id, jsonMessage] of jsonMessages)
		{
			if (jsonMessage.parentId == null)
			{
				continue;
			}

			if (jsonMessages.has(jsonMessage.parentId))
			{
				continue;
			}

			throw new Error(
				`Failed to find the parent of the message with the ID "${id}"`
			);
		}

		// Sort the messages so that each message's parent comes before it
		const sortedJsonMessages = MessageHelper.SortMessages(jsonMessages);

		// Construct the messages
		const messages = new Map<string, IMessage>();
		for (const jsonMessage of sortedJsonMessages)
		{
			// This will be either null or a valid message
			const parent = jsonMessage.parentId != null
				? messages.get(jsonMessage.parentId)
				: null;
			assert(parent !== undefined);

			// Create the message
			const message = new PromptMessage(
				jsonMessage.id,
				parent,
				jsonMessage.role,
				jsonMessage.contents
			);
			if (message.Parent != null)
			{
				message.Parent.AddChild(message);
			}

			message.ContextTokenCount = jsonMessage.contextTokenCount;
			message.MessageTokenCount = jsonMessage.messageTokenCount;
			messages.set(jsonMessage.id, message);
		}

		return messages;
	}

	/// Saves a message to local storage.
	/// If the message has already been saved, this will update the existing
	///   entry.
	/// @param message Message to save.
	public static SaveMessage(message: IMessage): void
	{
		// Convert the message to a JSON-serializable representation
		const jsonMessage: JsonMessage =
		{
			parentId: message.Parent?.Id ?? null,
			role: message.Role,
			contents: message.Contents,
			contextTokenCount: message.ContextTokenCount,
			messageTokenCount: message.MessageTokenCount
		};

		// Save the message to local storage
		localStorage.setItem(
			message.Id,
			JSON.stringify(jsonMessage)
		);
	}

	/// Loads a message from local storage.
	/// @param id ID of the message to load.
	/// @throws Error If the message could not be loaded.
	/// @returns The loaded message.
	private static LoadMessage(id: string): JsonMessageEx
	{
		// Load the message from local storage
		const item = localStorage.getItem(id);
		if (item === null)
		{
			throw new Error(`Failed to find a message with the ID "${id}"`);
		}
		const jsonMessage = JSON.parse(item);
		return { id, ...jsonMessage };
	}

	/// Sorts a set of messages so that each message's parent comes before it.
	/// @param messages Messages to sort.
	/// @returns The sorted messages.
	private static SortMessages(
		messages: Map<string, JsonMessageEx>): JsonMessageEx[]
	{
		const sortedMessages: JsonMessageEx[] = [];
		const sortedIds = new Set<string>();

		// Naive implementation - loop over the messages map until it's empty
		// TODO: Replace this with an efficient topological sort
		while (messages.size > 0)
		{
			// Iterate over each message and add it to the sorted list if its
			//   parent has already been added
			for (const [id, message] of messages)
			{
				if (message.parentId == null)
				{
					sortedMessages.push(message);
					sortedIds.add(id);
					messages.delete(id);
					continue;
				}

				if (sortedIds.has(message.parentId))
				{
					sortedMessages.push(message);
					sortedIds.add(id);
					messages.delete(id);
					continue;
				}
			}
		}

		return sortedMessages;
	}
}

/// JSON-serializable representation of a conversation.
interface JsonConversation
{
	/// Index of the conversation in the `Conversations` property.
	index: number;

	/// User-assigned name of the conversation.
	name: string;

	/// LLM used by the conversation.
	llm: ELlmType;

	/// Target context window size for the conversation, in number of tokens.
	targetContextWindowSize: number;

	/// ID of the root message of the conversation.
	rootMessageId: string;

	/// IDs of all threads in the conversation.
	threadIds: string[];

	/// IDs of all messages in the conversation.
	messageIds: string[];
}

/// JSON-serializable representation of a thread.
interface JsonThread
{
	/// ID of the root message of the thread.
	rootMessageId: string;

	/// IDs of all messages in the thread.
	/// This will be in the order that the messages were added to the thread.
	messageIds: string[];
}

/// JSON-serializable representation of a message.
interface JsonMessage
{
	/// Unique ID of the message's parent message, if any.
	parentId: string | null;

	/// Role of the sender of the message.
	role: ERole;

	/// Text contents of the message.
	contents: string;

	/// Token count consumed by the message's context.
	contextTokenCount: number;

	/// Token count consumed by the message.
	messageTokenCount: number;
}

/// Wraps the conversation object with extra fields needed to handle
///   deserialization.
interface ConversationWrapper
{
	/// Conversation object.
	conversation: IConversation;

	/// Index that the conversation was at in the `Conversations` property.
	index: number;
}

/// Extends the `JsonMessage` interface with extra fields needed to handle
///   deserialization.
interface JsonMessageEx extends JsonMessage
{
	/// ID of the message.
	id: string;
}
