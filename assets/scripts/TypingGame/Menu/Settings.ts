import { ICharacterMapping } from "../Data/CharacterMapping";
import { IRuleset } from "../Game/Rulesets/Ruleset";
import { EAssistanceLevel } from "./Assistance";
import { EDifficulty } from "./Difficulty";

/// Struct that defines the settings to use for the game.
export interface Settings
{
	/// The overall game difficulty.
	difficulty: EDifficulty;

	/// The assistance level to provide.
	assistanceLevel: EAssistanceLevel;

	/// The character mappings to use for the game.
	characterMappings: Array<ICharacterMapping>;

	/// The ruleset to use for the game.
	ruleset: IRuleset;
}
