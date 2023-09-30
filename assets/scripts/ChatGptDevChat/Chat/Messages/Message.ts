import { ERole } from "../Role";

/// Represents a message in a conversation.
export interface IMessage
{
	/// Message that this message is a response to.
	get Parent(): IMessage | null;

	/// Role of the message.
	get Role(): ERole;

	/// Text contents of the message.
	get Contents(): string;

	/// Estimated number of LLM tokens consumed by this message.
	/// This counts only the tokens consumed by the message contents. The total
	///   tokens consumed by sending this message to the LLM may be greater than
	///   this value due to internal formatting handled by the LLM API.
	get MessageTokenCountEstimated(): number;

	/// Total number of LLM tokens consumed by this message.
	/// This value will be -1 until the message has been sent to the LLM API
	///   and the response has been received.
	get MessageTokenCountActual(): number;

	/// Sets the actual number of LLM tokens consumed by this message.
	/// @throws Error If the message has already had its actual token count set.
	set MessageTokenCountActual(value: number);

	/// Estimated number of LLM tokens consumed by the current thread.
	/// This value considers the estimated tokens from this message as well as
	///   all previous messages in the thread.
	get ThreadTokenCountEstimated(): number;

	/// Total number of LLM tokens consumed by the current thread.
	/// This value considers the actual tokens from this message as well as all
	///   previous messages in the thread. If this message has not yet been sent
	///   to the LLM API, this value will be -1.
	get ThreadTokenCountActual(): number;
}
