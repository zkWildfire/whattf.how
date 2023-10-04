import { ChatCompletion, ChatCompletionMessageParam } from "openai/resources/chat";
import { ERole } from "../Role";
import { ILlm } from "./Llm";
import { ELlmType } from "./LlmType";
import { IMessage } from "../Messages/Message";
import assert from "assert";
import { IResponse } from "../Responses/Response";
import { EFinishReason } from "../Responses/FinishReason";
import { CompletionUsage } from "openai/resources";
import { IPrompt } from "../Prompts/Prompt";

/// Base class for all OpenAI GPT LLM implementations.
export abstract class IGptLlm extends ILlm
{
	/// Initializes the LLM.
	/// @param displayName UI-displayable name of the LLM.
	/// @param displayNameShort Short, possibly non-unique display name for the
	///   LLM.
	/// @param llmType Enum for the LLM class.
	/// @param contextWindowSize Size of the LLM's context window in number of
	///   tokens.
	/// @param inboundCost Cost in dollars per 1000 characters of input text.
	/// @param outboundCost Cost in dollars per 1000 characters of output text.
	protected constructor(
		displayName: string,
		displayNameShort: string,
		llmType: ELlmType,
		contextWindowSize: number,
		inboundCost: number,
		outboundCost: number)
	{
		super(
			displayName,
			displayNameShort,
			llmType,
			contextWindowSize,
			inboundCost,
			outboundCost
		);
	}

	/// Converts the given OpenAI response to an internal response object.
	/// @param response Response to convert.
	/// @returns Equivalent internal response object(s). Will contain at least
	///   one response.
	protected OpenAiResponseToResponses(response: ChatCompletion):
		IResponse[]
	{
		// Calculate usage values
		assert(response.usage != undefined);
		const promptTokens = response.usage.prompt_tokens;
		const promptCost = this.CalcInboundCost(promptTokens);
		const responseTokens = response.usage.completion_tokens;
		const responseCost = this.CalcOutboundCost(responseTokens);

		// Helper function to convert the finish reason string to the enum
		const convertFinishReason = (finishReason: string): EFinishReason =>
		{
			switch (finishReason)
			{
			case "stop":
				return EFinishReason.Stop;
			case "length":
				return EFinishReason.Length;
			case "content_filter":
				return EFinishReason.ContentFilter;
			case "function_call":
				return EFinishReason.FunctionCall;
			default:
				throw new Error(`Unknown finish reason: ${finishReason}`);
			}
		};

		// Generate the response object(s)
		const responses: IResponse[] = [];
		for (const choice of response.choices)
		{
			if (choice.message.content == null)
			{
				continue;
			}

			responses.push({
				Role: ERole.Assistant,
				Contents: choice.message.content,
				FinishReason: convertFinishReason(choice.finish_reason),
				ModelId: response.model,
				PromptTokens: promptTokens,
				PromptCost: promptCost,
				ResponseTokens: responseTokens,
				ResponseCost: responseCost,
				TotalTokens: promptTokens + responseTokens,
				TotalCost: promptCost + responseCost
			});
		}
		assert(responses.length > 0);
		return responses;
	}

	/// Updates the token count fields of the prompt message.
	/// @param prompt Prompt whose prompt message should be updated.
	/// @param usage Usage object from the response.
	protected UpdatePromptMessage(
		prompt: IPrompt,
		usage: CompletionUsage)
	{
		// This is likely to be slightly inaccurate since it doesn't fully
		//   factor in the token count that may be consumed by providing the
		//   data in prompt form
		const contextTokenCount = prompt.History.reduce(
			(total, message) => total + message.MessageTokenCount,
			0
		);
		const messageTokenCount = usage.prompt_tokens - contextTokenCount;
		assert(contextTokenCount >= 0);
		assert(messageTokenCount >= 0);

		prompt.Message.ContextTokenCount = contextTokenCount;
		prompt.Message.MessageTokenCount = messageTokenCount;
	}

	/// Converts the role enum to the equivalent OpenAI role string.
	/// @param role Role enum to convert.
	/// @returns Equivalent OpenAI role string.
	protected static RoleToOpenAiRole(role: ERole): string
	{
		switch (role)
		{
		case ERole.Assistant:
			return "assistant";
		case ERole.User:
			return "user";
		case ERole.System:
			return "system";
		default:
			throw new Error(`Unknown role: ${role}`);
		}
	};

	/// Converts the given message to an OpenAI message.
	/// @param message Message to convert.
	/// @returns Equivalent OpenAI message.
	protected static MessageToOpenAiMessage(
		message: IMessage): ChatCompletionMessageParam
	{
		const role = IGptLlm.RoleToOpenAiRole(message.Role);
		assert(role == "assistant" || role == "user" || role == "system");
		return {
			role: role,
			content: message.Contents
		};
	}
}
