/// Represents a role in a conversation.
export enum ERole
{
	/// Represents a system message.
	/// System messages are used to instruct LLMs how to respond to user
	///   messages. For example, they can be used to instruct the LLM to
	///   respond in a specific style or format responses in a specific way.
	System,

	/// Represents a message written by the user.
	/// All messages typed by the user will have this role, but not all messages
	///   with this role may have been written by the user. Messages may be
	///   generated and added to a conversation with this role to "seed" the
	///   conversation.
	User,

	/// Represents a message written by the LLM.
	/// A message received from the LLM will always have this role, but not all
	///   messages with this role may have been written by the LLM. Messages
	///   may be generated and added to a conversation with this role to "seed"
	///   the conversation.
	Assistant
}
