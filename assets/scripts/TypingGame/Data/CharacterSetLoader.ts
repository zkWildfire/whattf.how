import { ICharacterMapping } from "./CharacterMapping";

/// Interface for classes that load character mappings from a data file.
export interface ICharacterSetLoader
{
	/// Loads the character mappings from the data file.
	/// @returns The character mappings from the file.
	LoadAsync(): Promise<Array<ICharacterMapping>>;
}
