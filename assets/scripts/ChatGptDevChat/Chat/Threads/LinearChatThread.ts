
import { EventDispatcher, IEvent } from "strongly-typed-events";
import { IMessage } from "../Messages/Message";
import { IChatThread } from "./ChatThread";
import { ERole } from "../Role";
import assert from "assert";
import { ILlm } from "../LLMs/Llm";
import { IPrompt } from "../Prompts/Prompt";
import { IApiKeyProvider } from "../../Auth/ApiKeyProvider";
import { LlmMessage } from "../Messages/LlmMessage";

/// Default implementation of the chat thread interface.
export class LinearChatThread implements IChatThread
{
	/// Event broadcast to when a message is sent to the LLM.
	/// The event arguments will be the thread that the sent message is part of
	///   and the message that was sent.
	get OnMessageSent(): IEvent<IChatThread, IMessage>
	{
		return this._onMessageSent.asEvent();
	}

	/// Event broadcast to when a response is received from the LLM.
	/// The event arguments will be the thread that the received message is for
	///   and the message that was received.
	get OnResponseReceived(): IEvent<IChatThread, IMessage>
	{
		return this._onResponseReceived.asEvent();
	}

	/// Event broadcast to when the thread appends new messages.
	/// The event arguments will be the thread that was updated and the number
	///   of new messages that were appended.
	get OnThreadUpdated(): IEvent<IChatThread, number>
	{
		return this._onThreadUpdated.asEvent();
	}

	/// Root message of the thread.
	get RootMessage(): IMessage
	{
		return this._rootMessage;
	}

	/// Current leaf message of the thread.
	/// @invariant This will always be a message from the LLM. Messages written
	///   by the user are not added to the thread until a response from the LLM
	///   is received.
	get LeafMessage(): IMessage
	{
		return this._leafMessage;
	}

	/// Total number of messages in the thread.
	get MessageCount(): number
	{
		return this._messageCount;
	}

	/// Total number of tokens consumed by outbound messages in the thread.
	/// This will always be the actual number of outbound tokens since messages
	///   are only added to a thread once a response is received from the LLM.
	/// @warning "Outbound" here refers to messages sent to the LLM, which
	///   corresponds to the "inbound" token count for the LLM.
	get OutboundTokenCount(): number
	{
		return this._outboundTokenCount;
	}

	/// Total number of tokens consumed by inbound messages in the thread.
	/// This will always be the actual number of inbound tokens since messages
	///   are only added to a thread once a response is received from the LLM.
	/// @warning "Inbound" here refers to messages received from the LLM, which
	///   corresponds to the "outbound" token count for the LLM.
	get InboundTokenCount(): number
	{
		return this._inboundTokenCount;
	}

	/// Total number of tokens consumed by the thread.
	/// This will always be the actual number of tokens since messages are only
	///   added to a thread once a response is received from the LLM.
	get TotalTokenCount(): number
	{
		return this._inboundTokenCount + this._outboundTokenCount;
	}

	/// Total cost incurred by sending tokens to the LLM.
	/// This will always be the actual cost of outbound tokens since messages
	///   are only added to a thread once a response is received from the LLM.
	/// @warning "Outbound" here refers to messages sent to the LLM, which
	///   corresponds to the "inbound" cost of the LLM.
	get OutboundCost(): number
	{
		return this._outboundCost;
	}

	/// Total cost incurred by receiving tokens from the LLM.
	/// This will always be the actual cost of inbound tokens since messages
	///   are only added to a thread once a response is received from the LLM.
	/// @warning "Inbound" here refers to messages received from the LLM, which
	///   corresponds to the "outbound" cost of the LLM.
	get InboundCost(): number
	{
		return this._inboundCost;
	}

	/// Total cost of the thread in dollars.
	/// This will always be the actual cost of the thread since messages are
	///   only added to a thread once a response is received from the LLM.
	get TotalCost(): number
	{
		return this._inboundCost + this._outboundCost;
	}

	/// Event dispatcher backing the `OnMessageSent` event.
	private readonly _onMessageSent =
		new EventDispatcher<IChatThread, IMessage>();

	/// Event dispatcher backing the `OnResponseReceived` event.
	private readonly _onResponseReceived =
		new EventDispatcher<IChatThread, IMessage>();

	/// Event dispatcher backing the `OnThreadUpdated` event.
	private readonly _onThreadUpdated =
		new EventDispatcher<IChatThread, number>();

	/// LLM used by the thread.
	private readonly _llm: ILlm;

	/// API key provider used by the thread.
	private readonly _apiKeyProvider: IApiKeyProvider;

	/// Number of tokens to aim for in each prompt sent to the LLM.
	private readonly _targetPromptTokenCount: number;

	/// Field backing the `RootMessage` property.
	private readonly _rootMessage: IMessage;

	/// Field backing the `LeafMessage` property.
	private _leafMessage: IMessage;

	/// Field backing the `MessageCount` property.
	private _messageCount: number;

	/// Field backing the `OutboundTokenCount` property.
	private _outboundTokenCount: number;

	/// Field backing the `InboundTokenCount` property.
	private _inboundTokenCount: number;

	/// Field backing the `OutboundCost` property.
	private _outboundCost: number;

	/// Field backing the `InboundCost` property.
	private _inboundCost: number;

	/// Creates a new chat thread.
	/// @param llm LLM used by the thread.
	/// @param apiKeyProvider API key provider used by the thread.
	/// @param targetPromptTokenCount Number of tokens to aim for in each prompt
	///   sent to the LLM.
	/// @param currentMessage Current leaf message of the thread.
	constructor(
		llm: ILlm,
		apiKeyProvider: IApiKeyProvider,
		targetPromptTokenCount: number,
		currentMessage: IMessage)
	{
		// Get the stats for the thread
		const {
			rootMessage: rootMessage,
			count: messageCount,
			outbound: outboundTokenCount,
			inbound: inboundTokenCount
		} = LinearChatThread.CountTokens(currentMessage);

		// Initialize fields
		this._llm = llm;
		this._apiKeyProvider = apiKeyProvider;
		this._targetPromptTokenCount = targetPromptTokenCount;
		this._rootMessage = rootMessage;
		this._leafMessage = currentMessage;
		this._messageCount = messageCount;
		this._outboundTokenCount = outboundTokenCount;
		this._inboundTokenCount = inboundTokenCount;

		// Note that these are intentionally backwards - outbound for the thread
		//   corresponds to inbound for the LLM and vice versa
		this._outboundCost = llm.CalcInboundCost(outboundTokenCount);
		this._inboundCost = llm.CalcOutboundCost(inboundTokenCount);
	}

	/// Adds a new message to the thread without sending it to the LLM.
	/// This method is intended for use when creating the first thread for a
	///   conversation since there may be one or more messages added to "seed"
	///   the conversation but are not sent to the LLM. These messages will
	///   only be sent once the first message is sent to the LLM.
	/// @param message Message to add. Must have a known actual token count and
	///   be part of this thread's chain of messages.
	/// @warning Messages added via this method will never trigger any events.
	public AppendMessage(message: IMessage): void
	{
		// Get the stats for the message
		const {
			rootMessage: rootMessage,
			count: messageCount,
			outbound: outboundTokenCount,
			inbound: inboundTokenCount
		} = LinearChatThread.CountTokens(message);

		// Make sure the message is part of this thread
		assert(rootMessage === this._rootMessage);
		let currentMessage: IMessage | null = message;
		let leafMessageFound = false;
		while (currentMessage != null)
		{
			if (currentMessage === this._leafMessage)
			{
				leafMessageFound = true;
				break;
			}

			currentMessage = currentMessage.Parent;
		}
		assert(leafMessageFound);

		// Update the thread's stats
		this._leafMessage = message;
		this._messageCount = messageCount;
		this._outboundTokenCount = outboundTokenCount;
		this._outboundCost = this._llm.CalcInboundCost(outboundTokenCount);
		this._inboundTokenCount = inboundTokenCount;
		this._inboundCost = this._llm.CalcOutboundCost(inboundTokenCount);
	}

	/// Sends a message to the LLM.
	/// This will also add new messages to the conversation.
	/// @param message Message to send.
	/// @returns The message that was received from the LLM.
	public async SendMessage(message: IMessage): Promise<IMessage>
	{
		assert(message.Role === ERole.User, "Only user messages can be sent");

		// Walk backwards through the current thread until the target number of
		//   tokens is met for the prompt
		let promptTokens = message.MessageTokenCountEstimated;
		let promptMessages: IMessage[] = [];
		let currentMessage = message.Parent;
		while (currentMessage !== null &&
			promptTokens < this._targetPromptTokenCount)
		{
			// All previous messages should have a known token count
			assert(currentMessage.MessageTokenCountEstimated !== -1);

			// If adding the current message would exceed the target token count,
			//   stop adding messages
			const newTokenCount = promptTokens +
				currentMessage.MessageTokenCountEstimated;
			if (newTokenCount > this._targetPromptTokenCount)
			{
				break;
			}

			promptTokens = newTokenCount;
			promptMessages.push(currentMessage);
			currentMessage = currentMessage.Parent;
		}

		// Create the prompt
		const prompt: IPrompt = {
			History: promptMessages.reverse(),
			Message: message,
			ApiKey: this._apiKeyProvider.ApiKeyRaw,
		};

		// Send the prompt to the LLM
		this._onMessageSent.dispatch(this, message);
		const responses = await this._llm.SendPrompt(prompt);

		// Convert the response from the LLM into a message
		// If the LLM returned multiple responses, ignore all other messages
		//   since this class represents a linear conversation
		assert(responses.length > 0, "LLM returned no responses");
		const response = responses[0];
		message.MessageTokenCountActual = response.PromptTokens;
		const responseMessage = new LlmMessage(
			message,
			response.Contents,
			response.ResponseTokens
		);

		// Update the current leaf message
		this._leafMessage = responseMessage;

		// Notify observers that the thread was updated
		this._onResponseReceived.dispatch(this, responseMessage);
		// Messages are always added in pairs since both the user message and
		//   LLM response are added at the same time
		this._onThreadUpdated.dispatch(this, 2);

		return responseMessage;
	}

	/// Counts the number of tokens used by the message thread.
	/// @param message Message to count tokens for.
	/// @returns The root message of the given message's thread, the number of
	///   messages in the thread, and the number of tokens used by the thread.
	private static CountTokens(message: IMessage):
		{
			rootMessage: IMessage,
			count: number,
			outbound: number,
			inbound: number
		}
	{
		let messageCount = 1;
		let outboundTokenCount = 0;
		let inboundTokenCount = 0;

		// Helper method used to update token counts
		const updateTokenCount = (message: IMessage): void =>
		{
			assert(message.MessageTokenCountActual !== -1);

			if (message.Role == ERole.Assistant)
			{
				inboundTokenCount += message.MessageTokenCountActual;
			}
			else
			{
				outboundTokenCount += message.MessageTokenCountActual;
			}
		};

		// Walk up the tree to find the root message and to calculate stats
		let rootMessage = message;
		while (rootMessage.Parent !== null)
		{
			rootMessage = rootMessage.Parent;
			messageCount++;
			updateTokenCount(rootMessage);
		}

		return {
			rootMessage: rootMessage,
			count: messageCount,
			outbound: outboundTokenCount,
			inbound: inboundTokenCount
		};
	}
}
