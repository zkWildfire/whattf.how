import { ILlm } from "../LLMs/Llm";
import { IConversation } from "./Conversation";
import { IMessage } from "../Messages/Message";

/// Conversation implementation only used for testing.
/// This conversation implementation only allows for a single linear
///   conversation path and does not support branching. The functionality of
///   this class is approximately equivalent to that of the default ChatGPT
///   web interface.
export class LinearConversation implements IConversation
{
	/// User-assigned name of the conversation.
	get Name(): string
	{
		return this._name;
	}

	/// LLM used by the conversation.
	get ILlm(): ILlm
	{
		return this._llm;
	}

	/// Root message of the conversation.
	get RootMessage(): IMessage
	{
		return this._rootMessage;
	}

	/// All leaf messages in the conversation.
	get LeafMessages(): IMessage[]
	{
		return [this._currentLeafMessage];
	}

	/// Name assigned to the conversation.
	private readonly _name: string;

	/// LLM used by the conversation.
	private readonly _llm: ILlm;

	/// Root message of the conversation.
	private readonly _rootMessage: IMessage;

	/// Current leaf message in the conversation.
	private _currentLeafMessage: IMessage;

	/// Initializes the conversation.
	/// @param name Name assigned to the conversation.
	/// @param llm LLM used by the conversation.
	/// @param rootMessage Root message of the conversation.
	constructor(name: string, llm: ILlm, rootMessage: IMessage)
	{
		this._name = name;
		this._llm = llm;
		this._rootMessage = rootMessage;
		this._currentLeafMessage = rootMessage;
	}

	/// Adds a new message to the conversation.
	/// @param message Message to add.
	/// @throws Error If the parent message is not the conversation's leaf
	///   message.
	public AddMessage(message: IMessage): void
	{
		// This is a linear conversation, so the parent message must be the
		//   current leaf message
		if (message.Parent !== this._currentLeafMessage)
		{
			throw new Error("Parent message is not a leaf message.");
		}

		this._currentLeafMessage = message;
	}
}
