import { EventDispatcher, IEvent } from "strongly-typed-events";
import { ILlm } from "../LLMs/Llm";
import { IMessage } from "../Messages/Message";
import { IChatThread } from "../Threads/ChatThread";
import { IConversation } from "./Conversation";
import { ERole } from "../Role";

/// Basic conversation implementation that allows threads to be branched.
/// This class was designed to be implemented quickly rather than efficiently.
export class NaiveConversation implements IConversation
{
	/// Event broadcast to when a new thread is added.
	/// The event arguments will be the conversation that was updated and the
	///   thread that was added.
	get OnThreadAdded(): IEvent<IConversation, IChatThread>
	{
		return this._onThreadAdded.asEvent();
	}

	/// Unique ID assigned to the conversation.
	get Id(): string
	{
		return this._id;
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
		return this._threads[0].RootMessage;
	}

	/// All threads in the conversation.
	get Threads(): IChatThread[]
	{
		return this._threads;
	}

	/// Total number of messages in the conversation.
	get MessageCount(): number
	{
		return NaiveConversation.Accumulate(
			(value, message) => value + 1,
			0,
			this.RootMessage
		);
	}

	/// Total number of tokens sent to the LLM.
	get OutboundTokenCount(): number
	{
		return NaiveConversation.Accumulate(
			(value, message) =>
			{
				if (message.Role == ERole.Assistant)
				{
					// Ignore the message; it's an inbound message
					return value;
				}
				else
				{
					return value + message.MessageTokenCount;
				}
			},
			0,
			this.RootMessage
		);
	}

	/// Total number of tokens received from the LLM.
	get InboundTokenCount(): number
	{
		return NaiveConversation.Accumulate(
			(value, message) =>
			{
				if (message.Role == ERole.Assistant)
				{
					return value + message.MessageTokenCount;
				}
				else
				{
					// Ignore the message; it's an outbound message
					return value;
				}
			},
			0,
			this.RootMessage
		);
	}

	/// Total number of tokens sent to and received from the LLM.
	get TotalTokenCount(): number
	{
		return this.OutboundTokenCount + this.InboundTokenCount;
	}

	/// Total cost incurred by sending tokens to the LLM.
	/// @warning "Outbound" here refers to messages sent to the LLM, which
	///   corresponds to the "inbound" cost of the LLM.
	get OutboundCost(): number
	{
		// The mismatch here is intentional since the LLM's "inbound" cost
		//   corresponds to messages sent to the LLM, which is the "outbound"
		//   cost of the conversation.
		return this._llm.CalcInboundCost(this.OutboundTokenCount);
	}

	/// Total cost incurred by receiving tokens from the LLM.
	/// @warning "Inbound" here refers to messages received from the LLM, which
	///   corresponds to the "outbound" cost of the LLM.
	get InboundCost(): number
	{
		// The mismatch here is intentional since the LLM's "outbound" cost
		//   corresponds to messages received from the LLM, which is the
		//   "inbound" cost of the conversation.
		return this._llm.CalcOutboundCost(this.InboundTokenCount);
	}

	/// Total cost of the conversation in dollars.
	get TotalCost(): number
	{
		return this.OutboundCost + this.InboundCost;
	}

	/// Event dispatcher backing the `OnThreadAdded` property.
	private readonly _onThreadAdded =
		new EventDispatcher<IConversation, IChatThread>();

	/// Field backing the `Id` property.
	private readonly _id: string;

	/// Field backing the `Name` property.
	private readonly _name: string;

	/// LLM to use for the conversation.
	private readonly _llm: ILlm;

	/// Target context window size for the conversation, in number of tokens.
	private readonly _targetContextWindowSize: number;

	/// Chat threads in the conversation.
	private _threads: IChatThread[] = [];

	/// Initializes the conversation.
	/// @param id Unique ID assigned to the conversation.
	/// @param name User-assigned name of the conversation.
	/// @param llm LLM to use for the conversation.
	/// @param targetContextWindowSize Target context window size for the
	///   conversation, in number of tokens.
	/// @param thread Thread or threads to initialize the conversation with.
	constructor(
		id: string,
		name: string,
		llm: ILlm,
		targetContextWindowSize: number,
		thread: IChatThread | IChatThread[])
	{
		this._id = id;
		this._name = name;
		this._llm = llm;
		this._targetContextWindowSize = targetContextWindowSize;

		if (Array.isArray(thread))
		{
			this._threads = thread;
		}
		else
		{
			this._threads.push(thread);
		}
	}

	/// Adds a new thread to the conversation.
	/// @param thread Thread to add.
	public AddThread(thread: IChatThread): void
	{
		this._threads.push(thread);
		this._onThreadAdded.dispatch(this, thread);
	}

	/// Helper method for walking over all messages in the conversation.
	/// @param accumulator Accumulator function to call for each message.
	/// @param initialValue Initial value to pass to the accumulator function.
	/// @returns The accumulated value.
	public AccumulateMessages<T>(
		accumulator: (value: T, message: IMessage) => T,
		initialValue: T): T
	{
		return NaiveConversation.Accumulate(
			accumulator,
			initialValue,
			this.RootMessage
		);
	}

	/// Helper method for walking over all messages in the conversation.
	/// @param accumulator Accumulator function to call for each message.
	/// @param initialValue Initial value to pass to the accumulator function.
	/// @returns The accumulated value.
	private static Accumulate<T>(
		accumulator: (value: T, message: IMessage) => T,
		initialValue: T,
		message: IMessage): T
	{
		let value = accumulator(initialValue, message);
		for (const child of message.Children)
		{
			value = NaiveConversation.Accumulate(
				accumulator,
				value,
				child
			);
		}

		return value;
	}
}
