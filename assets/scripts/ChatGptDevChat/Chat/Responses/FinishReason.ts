/// Enum identifying the reason why an LLM response stops.
export enum EFinishReason
{
	/// The LLM reached a natural stopping point.
	Stop,

	/// The LLM reached the maximum number of tokens allowed for a response.
	Length,

	/// The LLM's response was blocked by a filter.
	ContentFilter,

	/// The LLM called a function.
	FunctionCall
}
