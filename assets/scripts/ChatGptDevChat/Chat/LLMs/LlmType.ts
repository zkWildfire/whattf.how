/// Enum identifying each supported LLM.
export enum ELlmType
{
	/// OpenAI's GPT-3.5 with a 4K context window.
	Gpt3_4k,

	/// OpenAI's GPT-3.5 with a 16K context window.
	Gpt3_16k,

	/// OpenAI's GPT-4 with a 8K context window.
	Gpt4_8k,

	/// OpenAI's GPT-4 with a 32K context window.
	Gpt4_32k,

	/// The Lorem Ipsum faux-LLM.
	LoremIpsum
}
