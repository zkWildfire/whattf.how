import { EFinishReason } from "./FinishReason";
import { ERole } from "../Role";

/// Represents the data that may be returned by an LLM.
export interface IResponse
{
	/// Conversation role that the response is generated for.
	/// This will generally always be `ERole.Assistant`.
	get Role(): ERole;

	/// Text contents of the response.
	get Contents(): string;

	/// Reason why the response ends.
	get FinishReason(): EFinishReason;

	/// Unique ID identifying the model that was used to generate the response.
	/// This will be an ID defined by the organization that owns the LLM.
	get ModelId(): string;

	/// Number of tokens consumed by the prompt that generated this response.
	/// This will be a value computed by the LLM API and should be considered
	///   the source of truth value for any prompt token count.
	get PromptTokens(): number;

	/// Cost in dollars of the prompt that generated this response.
	get PromptCost(): number;

	/// Number of tokens consumed by the response.
	/// This will be a value computed by the LLM API and should be considered
	///   the source of truth value for any response token count.
	get ResponseTokens(): number;

	/// Cost in dollars of the response.
	get ResponseCost(): number;

	/// Total tokens consumed by the prompt and response.
	/// This will be a value computed by the LLM API and should be considered
	///   the source of truth value for any total token count.
	get TotalTokens(): number;

	/// Total cost in dollars of the prompt and response.
	get TotalCost(): number;
}
