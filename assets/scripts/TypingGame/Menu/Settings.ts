import { ICharacterMapping } from "../Data/CharacterMapping";
import { EAssistanceLevel } from "./Assistance";
import { EDifficulty } from "./Difficulty";

/// Struct that defines the settings to use for the game.
export interface Settings
{
	/// The overall game difficulty.
	difficulty: EDifficulty;

	/// The assistance level to provide.
	assistanceLevel: EAssistanceLevel;

	/// The character sets to use for the game.
	vocabularySets: Array<ICharacterMapping>;
}
