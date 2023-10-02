import { EventDispatcher, IEvent } from "strongly-typed-events";
import { ILlm } from "../LLMs/Llm";
import { IMessage } from "../Messages/Message";
import { IChatThread } from "../Threads/ChatThread";
import { IConversation } from "./Conversation";

/// Conversation implementation that allows for only a single thread.
/// This conversation implementation is primarily meant for testing and is not
///   meant to be used in production.
export class LinearConversation implements IConversation
{
	/// Event broadcast to when a new thread is added.
	/// The event arguments will be the conversation that was updated and the
	///   thread that was added.
	get OnThreadAdded(): IEvent<IConversation, IChatThread>
	{
		return this._onThreadAdded.asEvent();
	}

	/// User-assigned name of the conversation.
	get Name(): string
	{
		return this._name;
	}

	/// LLM used by the conversation.
	get Llm(): ILlm
	{
		return this._llm;
	}

	/// Target context window size for the conversation, in number of tokens.
	get TargetContextWindowSize(): number
	{
		return this._targetContextWindowSize;
	}

	/// Root message of the conversation.
	get RootMessage(): IMessage
	{
		return this._thread.RootMessage;
	}

	/// All threads in the conversation.
	get Threads(): IChatThread[]
	{
		return [this._thread];
	}

	/// Total number of messages in the conversation.
	get MessageCount(): number
	{
		return this._thread.MessageCount;
	}

	/// Total number of tokens sent to the LLM.
	get OutboundTokenCount(): number
	{
		return this._thread.OutboundTokenCount;
	}

	/// Total number of tokens received from the LLM.
	get InboundTokenCount(): number
	{
		return this._thread.InboundTokenCount;
	}

	/// Total number of tokens sent to and received from the LLM.
	get TotalTokenCount(): number
	{
		return this._thread.TotalTokenCount;
	}

	/// Total cost incurred by sending tokens to the LLM.
	/// @warning "Outbound" here refers to messages sent to the LLM, which
	///   corresponds to the "inbound" cost of the LLM.
	get OutboundCost(): number
	{
		return this._thread.OutboundCost;
	}

	/// Total cost incurred by receiving tokens from the LLM.
	/// @warning "Inbound" here refers to messages received from the LLM, which
	///   corresponds to the "outbound" cost of the LLM.
	get InboundCost(): number
	{
		return this._thread.InboundCost;
	}

	/// Total cost of the conversation in dollars.
	get TotalCost(): number
	{
		return this._thread.TotalCost;
	}

	/// Event dispatcher backing the `OnThreadAdded` property.
	private readonly _onThreadAdded =
		new EventDispatcher<IConversation, IChatThread>();

	/// Field backing the `Name` property.
	private readonly _name: string;

	/// LLM to use for the conversation.
	private readonly _llm: ILlm;

	/// Target context window size for the conversation, in number of tokens.
	private readonly _targetContextWindowSize: number;

	/// Chat thread for the conversation.
	private _thread: IChatThread;

	/// Initializes the conversation.
	/// @param name User-assigned name of the conversation.
	/// @param llm LLM to use for the conversation.
	/// @param targetContextWindowSize Target context window size for the
	///   conversation, in number of tokens.
	/// @param thread Thread to initialize the conversation with.
	constructor(
		name: string,
		llm: ILlm,
		targetContextWindowSize: number,
		thread: IChatThread)
	{
		this._name = name;
		this._llm = llm;
		this._targetContextWindowSize = targetContextWindowSize;
		this._thread = thread;
	}
}
