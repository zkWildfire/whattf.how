import Ajv from "ajv";
import { ICharacterSetLoader } from "./CharacterSetLoader";
import { ICharacterMapping } from "./CharacterMapping";
import { AtomicCharacterSet } from "./AtomicCharacterSet";
import { AtomicCharacterMapping } from "./AtomicCharacterMapping";

/// Data loader for data sets consisting entirely of atomic character mappings.
/// This class requires the data files to match the schema defined at
///   `assets/data/typing-game/schemas/atomic-character-set.schema.json`.
export class AtomicCharacterSetLoader implements ICharacterSetLoader
{
	/// URL of the JSON schema file to use for validation.
	public static readonly SCHEMA_URL: string =
		"/assets/data/typing-game/schemas/atomic-character-set.schema.json";

	/// URL of the JSON data file to load.
	private readonly _dataUrl: string;

	/// Initializes the character set loader.
	/// @param dataUrl URL of the JSON data file to load.
	constructor(dataUrl: string)
	{
		this._dataUrl = dataUrl;
	}

	/// Loads the character mappings from the data file.
	/// @returns The character mappings from the file.
	public async LoadAsync(): Promise<Array<ICharacterMapping>>
	{
		try
		{
			// Get the data and schema
			const [dataResponse, schemaResponse] = await Promise.all([
				fetch(this._dataUrl),
				fetch(AtomicCharacterSetLoader.SCHEMA_URL),
			]);

			if (!dataResponse.ok || !schemaResponse.ok) {
				throw new Error("Failed to fetch data or schema");
			}

			// Validate the data
			const jsonData: AtomicCharacterSet = await dataResponse.json();
			const jsonSchema = await schemaResponse.json();

			const ajv = new Ajv();
			const validate = ajv.compile(jsonSchema);

			if (!validate(jsonData)) {
				console.error("JSON data is invalid", validate.errors);
				throw new Error("JSON data is invalid");
			}

			// Convert the data to character mappings
			const characterMappings = new Array<ICharacterMapping>();
			for (const mapping of jsonData.CharacterPairs)
			{
				characterMappings.push(new AtomicCharacterMapping(
					mapping.DisplayText,
					mapping.EnglishText
				));
			}

			return characterMappings;
		}
		catch (error)
		{
			console.error("An error occurred:", error);
			throw error;
		}
	}
}
