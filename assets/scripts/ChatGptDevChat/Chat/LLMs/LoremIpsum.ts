import assert from "assert";
import { IPrompt } from "../Prompts/Prompt";
import { EFinishReason } from "../Responses/FinishReason";
import { IResponse } from "../Responses/Response";
import { ERole } from "../Role";
import { ILlm } from "./Llm";

/// Fake LLM implementation used for testing.
export class LoremIpsum extends ILlm
{
	/// List of responses that the LLM may return.
	private static readonly _responses: IResponse[] = [
		LoremIpsum.GenerateResponse(1),
		LoremIpsum.GenerateResponse(2),
		LoremIpsum.GenerateResponse(3),
		LoremIpsum.GenerateResponse(4)
	];

	/// Initializes the LLM.
	constructor()
	{
		super(
			"Lorem Ipsum",
			"Lipsum",
			16 * 1024,
			// Use the rates from GPT-4 (32k) since that's the most expensive
			//   model currently supported
			0.06,
			0.12
		);
	}

	/// Counts the number of tokens in the given text.
	/// The value returned by this method should be considered an estimate, not
	///   an exact value. This is because the APIs of some LLMs may add
	///   additional tokens when processing a prompt. Always use the token
	///   counts returned by the LLM API if an exact token count is needed.
	/// @param text Text to count tokens in.
	/// @returns Estimate of the number of tokens in the text.
	public CountTokens(text: string): number
	{
		// Count the number of words in the string and use it as the token count
		return text.split(/\s+/).length;
	}

	/// Sends a prompt to the LLM and returns the response.
	/// @param prompt Prompt to send.
	/// @returns Response(s) from the LLM. If the LLM offers multiple choices
	///   for a response, multiple responses may be returned. At least one
	///   response will always be returned.
	public SendPrompt(prompt: IPrompt): Promise<IResponse[]>
	{
		// Calculate the number of tokens in the newest prompt message
		const promptMessageTokenCount = prompt.Message.Contents.split(
			/\s+/
		).length;
		prompt.Message.MessageTokenCountActual = promptMessageTokenCount;

		// Pick a response at random and return it
		const index = Math.floor(Math.random() * LoremIpsum._responses.length);
		const loremIpsumResponse = LoremIpsum._responses[index];

		// Generate the actual response object to return
		return Promise.resolve([{
			Role: loremIpsumResponse.Role,
			Contents: loremIpsumResponse.Contents,
			FinishReason: loremIpsumResponse.FinishReason,
			ModelId: loremIpsumResponse.ModelId,
			PromptTokens: promptMessageTokenCount,
			PromptCost: 0.0,
			ResponseTokens: loremIpsumResponse.ResponseTokens,
			ResponseCost: 0.0,
			TotalTokens: promptMessageTokenCount +
				loremIpsumResponse.ResponseTokens,
			TotalCost: 0.0
		}]);
	}

	/// Constructs a response object from a lorem ipsum string.
	/// @param paragraphs Number of paragraphs to generate. Must be in the range
	///   `[1, 10]`.
	/// @returns The response object with the specified number of paragraphs.
	///   The caller is responsible for setting the prompt and total token
	///   counts and costs.
	private static GenerateResponse(paragraphs: number): IResponse
	{
		const loremIpsum = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam laoreet
pellentesque quam, sit amet dapibus dolor tincidunt eget. Ut eget odio et mauris
maximus accumsan vel quis arcu. Curabitur et eleifend metus.  Morbi interdum ex
ligula, vel pharetra mauris mollis a. Nunc venenatis lacus sed blandit eleifend.
Maecenas vel orci sit amet lectus bibendum euismod. Sed bibendum aliquam velit
in ullamcorper.  Phasellus scelerisque urna eget faucibus aliquet. Phasellus
efficitur est et mi viverra commodo. Etiam tempor ultrices eros, et volutpat
nibh tristique a. Donec ultrices facilisis dolor, id cursus urna placerat nec.

Nunc sodales ante sed quam finibus, in viverra est pulvinar. Aenean faucibus
neque in metus consequat pellentesque. Curabitur et condimentum dui. Etiam
feugiat ex metus, quis placerat urna sodales eget. Ut leo nisi, eleifend quis
varius a, aliquet non tortor.  Nullam sit amet molestie metus, quis malesuada
sem. Nullam semper lorem ut lacinia aliquam. Sed et libero non ex vestibulum
facilisis nec vel sapien.  Curabitur erat libero, ullamcorper faucibus tempor
eget, consequat vitae orci.

Maecenas eu rutrum nisi, at euismod velit. Donec ac scelerisque tellus.  Vivamus
suscipit posuere lobortis. Orci varius natoque penatibus et magnis dis
parturient montes, nascetur ridiculus mus.  Integer ut quam neque. Suspendisse
varius nibh risus, vel placerat lectus dignissim quis. Duis non congue tellus.
Curabitur lobortis quam sit amet ligula iaculis, aliquam imperdiet neque
rhoncus.  Aenean aliquet, elit ac feugiat aliquam, erat nunc semper tellus,
bibendum lobortis turpis tortor eu quam. Suspendisse tincidunt tincidunt mauris
id condimentum.  Donec molestie lectus nisi, id dapibus diam euismod vitae.
Phasellus lobortis euismod orci id sagittis. In in urna quis massa dapibus
sollicitudin sed id nulla.  Sed cursus est vel lorem rhoncus, ac malesuada
tortor malesuada.  Donec et egestas tortor, ut rhoncus nisi.  Nulla et libero
sit amet lacus egestas luctus nec sed arcu.

Vivamus in leo et ligula ullamcorper eleifend vel at erat. Donec faucibus nisl
ac erat tempor, vitae porta massa auctor. Nulla facilisi.  Sed aliquam porttitor
velit sit amet sollicitudin. Ut commodo nisi felis. Nam imperdiet ultricies
cursus. Sed quam ex, pharetra accumsan lorem commodo, condimentum facilisis
lectus. In sodales fermentum convallis. Fusce odio lacus, accumsan at tincidunt
ut, sollicitudin at leo. Ut in massa ac quam auctor fermentum vel ut purus.
Integer vitae congue ante.

Nam at felis eget felis lobortis cursus. Nunc nibh nisl, rhoncus vitae tempus
at, ornare ac sapien. Mauris et ex rhoncus, lobortis nunc ut, placerat lectus.
Proin nec ante scelerisque, suscipit urna in, sagittis ipsum. Suspendisse
pulvinar blandit ligula facilisis laoreet. Class aptent taciti sociosqu ad
litora torquent per conubia nostra, per inceptos himenaeos. Morbi semper laoreet
orci, vitae consectetur tortor tempus ut. Vivamus id luctus risus. Vestibulum
lacinia tincidunt nulla sed feugiat. Ut rhoncus convallis sodales.  Sed sit amet
pharetra tellus.  Vestibulum bibendum, erat nec imperdiet blandit, libero libero
tempus risus, quis eleifend augue mi sed purus. Ut luctus sit amet mi a luctus.

Aliquam rutrum felis sit amet luctus vulputate. Donec eu faucibus odio.  Cras
vulputate mi at sollicitudin euismod. Integer iaculis luctus libero ac
efficitur. Nulla ut fermentum nisi. Maecenas a augue vitae elit ultricies
egestas. Mauris sed vestibulum mauris.  Proin a sollicitudin mi, a fermentum
nibh. Vivamus id vehicula leo.  Orci varius natoque penatibus et magnis dis
parturient montes, nascetur ridiculus mus. Morbi feugiat imperdiet lectus, ac
pellentesque elit. Aliquam consectetur metus dictum purus scelerisque mattis.
Praesent porttitor lobortis ligula, nec euismod erat ultrices ut. Ut posuere
orci elementum risus tristique, id sollicitudin magna elementum. Duis ac est
feugiat sapien porttitor interdum.

Nulla non diam nulla. Donec porta porta mauris at rhoncus. Maecenas viverra enim
non lacinia egestas. Mauris rhoncus at turpis id rutrum. In ex erat, fermentum
quis eros et, venenatis lobortis ipsum. Proin ut efficitur sapien. Curabitur
egestas tincidunt posuere. Cras quis libero suscipit eros pellentesque faucibus
et non quam. Mauris sem nisl, aliquam consequat ex in, ultrices blandit tortor.
Vivamus condimentum est et nisi commodo interdum. Sed mattis consequat diam et
eleifend.  Quisque iaculis eget odio id condimentum. Curabitur mattis placerat
posuere. Sed bibendum, enim at placerat rhoncus, nibh sapien auctor urna, nec
pulvinar sem nisi a sapien. Mauris ut consequat metus, et sollicitudin lectus.

Praesent aliquet risus non dolor vehicula dapibus. Nunc dapibus odio vitae
condimentum sollicitudin. Morbi hendrerit congue ante. Nunc sit amet mi quis
augue auctor molestie vel in orci. Aliquam vel tortor tincidunt, fringilla
tortor ut, consequat ligula. Integer consequat nunc convallis erat scelerisque,
in feugiat eros dictum.  Sed quis magna nec lacus pulvinar feugiat. Etiam
fringilla fermentum mauris, in consectetur sem. Maecenas in bibendum elit.
Maecenas condimentum eros est, eget interdum velit ultrices nec. Sed euismod dui
nisl, in sollicitudin erat interdum sit amet. Mauris lobortis dolor vel ex
congue convallis.  Maecenas tempor magna et metus interdum malesuada. Quisque
cursus at felis id sodales. Quisque vel velit sit amet dui semper commodo non
vel velit. Morbi lectus magna, porttitor sodales ligula nec, finibus posuere
lacus.

Nullam varius volutpat nunc. Mauris ipsum enim, hendrerit a lorem et, pharetra
euismod lacus. Cras tristique, augue sed porta dictum, leo elit maximus augue,
quis varius eros odio nec massa.  Pellentesque habitant morbi tristique senectus
et netus et malesuada fames ac turpis egestas.  Duis quis velit eu mi euismod
vehicula a quis mauris. Suspendisse ultricies ut dui at dignissim. Etiam
pellentesque sit amet orci eu feugiat. Curabitur ac elit enim.  Praesent sit
amet viverra erat.  Vestibulum et commodo tortor, quis pulvinar elit. Vivamus
quis est et ligula tincidunt euismod. Quisque elementum est sit amet mi
dignissim faucibus. Vestibulum viverra malesuada leo vitae interdum.

In pulvinar metus vel ex auctor tempor. Maecenas at rhoncus nulla.  Sed
consequat ultrices pretium. Curabitur sodales sem tortor, nec ullamcorper diam
tristique nec. Aenean pulvinar venenatis elementum.  Fusce fermentum eu sapien
eget auctor. Vivamus lacus purus, dapibus sit amet turpis et, auctor accumsan
est. Praesent sodales rutrum odio sit amet volutpat. Aliquam felis mi, lobortis
at malesuada ut, auctor at felis. Mauris eget ipsum a est semper dignissim.
Morbi sed ipsum eget nisi congue viverra eget at tortor.
			`;
		const loremIpsumParagraphs = loremIpsum.split("\n\n").map(
			paragraph => paragraph.trim()
		).map(
			// The string used for the Lorem Ipsum text is formatted to fit
			//   the standard width of code. Remove the new line characters
			//   so that each paragraph is a single line.
			paragraph => paragraph.replace(/\n/g, " ")
		);

		// Get the string with the number of paragraphs requested
		const contents = loremIpsumParagraphs.slice(0, paragraphs).join("\n\n");

		// Count the number of words in the string and use it as the token count
		const tokenCount = contents.split(/\s+/).length;

		return {
			Role: ERole.Assistant,
			Contents: contents,
			FinishReason: EFinishReason.Stop,
			ModelId: "lorem-ipsum",
			PromptTokens: tokenCount,
			PromptCost: 0.0,
			ResponseTokens: tokenCount,
			ResponseCost: 0.0,
			TotalTokens: tokenCount,
			TotalCost: 0.0,
		};
	}
}
