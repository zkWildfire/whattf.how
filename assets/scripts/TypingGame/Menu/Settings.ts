import { EAssistanceLevel } from "./Assistance";
import { EDifficulty } from "./Difficulty";
import { EVocabularySet } from "./VocabularySet";

/// Struct that defines the settings to use for the game.
export interface Settings
{
	/// The overall game difficulty.
	difficulty: EDifficulty;

	/// The assistance level to provide.
	assistanceLevel: EAssistanceLevel;

	/// The vocabulary sets to use.
	vocabularySets: Set<EVocabularySet>;
}
