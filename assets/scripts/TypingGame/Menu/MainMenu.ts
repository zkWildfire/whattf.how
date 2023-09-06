import assert from "assert";
import { EAssistanceLevel } from "./Assistance";
import { EDifficulty } from "./Difficulty";
import { EVocabularySet } from "./VocabularySet";
import { Settings } from "./Settings";

/// ID of the game menu HTML element
const ID_GAME_MENU = "game-menu";

/// ID of the start button HTML element
const ID_START_BUTTON = "start-button";

/// IDs of the game difficulty radio buttons
const ID_DIFFICULTY_EASY = "difficulty-easy";
const ID_DIFFICULTY_NORMAL = "difficulty-normal";
const ID_DIFFICULTY_HARD = "difficulty-hard";
const ID_DIFFICULTY_EXPERT = "difficulty-expert";

/// IDs of the assistance level radio buttons
const ID_ASSISTANCE_ALWAYS = "assistance-always";
const ID_ASSISTANCE_HALFWAY = "assistance-halfway";
const ID_ASSISTANCE_QUARTER = "assistance-quarter";
const ID_ASSISTANCE_OFF = "assistance-off";

/// IDs of the hiragana vocabulary set checkboxes
const ID_VOCAB_HIRAGANA_BASE = "vocab-hiragana-base";
const ID_VOCAB_HIRAGANA_DAKUON = "vocab-hiragana-dakuon";
const ID_VOCAB_HIRAGANA_COMBO = "vocab-hiragana-combo";

/// IDs of the katakana vocabulary set checkboxes
const ID_VOCAB_KATAKANA_BASE = "vocab-katakana-base";
const ID_VOCAB_KATAKANA_DAKUON = "vocab-katakana-dakuon";
const ID_VOCAB_KATAKANA_COMBO = "vocab-katakana-combo";

/// Displays the game menu element.
export const DisplayMenu: () => void = () =>
{
	// Get the game menu element
	const gameMenu = document.getElementById(ID_GAME_MENU);
	assert(
		gameMenu !== null,
		`Could not find game menu element with ID ${ID_GAME_MENU}`
	);

	// Remove the `d-none` class from the element
	gameMenu.classList.remove("d-none");
}

/// Method to invoke when the start button is clicked
export const OnStartClicked: () => void = () =>
{
	// Get the selected settings
	const settings: Settings = {
		difficulty: GetSelectedDifficulty(),
		assistanceLevel: GetSelectedAssistanceLevel(),
		vocabularySets: GetSelectedVocabularySets()
	};
}

/// Gets the selected difficulty level.
/// @returns The selected difficulty level.
const GetSelectedDifficulty: () => EDifficulty = () =>
{
	// Get the easy difficulty radio button
	const easyDifficulty = document.getElementById(
		ID_DIFFICULTY_EASY
	) as HTMLInputElement;
	assert(
		easyDifficulty !== null,
		`Could not find radio button with ID ${ID_DIFFICULTY_EASY}`
	);

	// Get the normal difficulty radio button
	const normalDifficulty = document.getElementById(
		ID_DIFFICULTY_NORMAL
	) as HTMLInputElement;
	assert(
		normalDifficulty !== null,
		`Could not find radio button with ID ${ID_DIFFICULTY_NORMAL}`
	);

	// Get the hard difficulty radio button
	const hardDifficulty = document.getElementById(
		ID_DIFFICULTY_HARD
	) as HTMLInputElement;
	assert(
		hardDifficulty !== null,
		`Could not find radio button with ID ${ID_DIFFICULTY_HARD}`
	);

	// Get the expert difficulty radio button
	const expertDifficulty = document.getElementById(
		ID_DIFFICULTY_EXPERT
	) as HTMLInputElement;
	assert(
		expertDifficulty !== null,
		`Could not find radio button with ID ${ID_DIFFICULTY_EXPERT}`
	);

	// Get the selected difficulty
	if (easyDifficulty.checked)
	{
		return EDifficulty.Easy;
	}
	else if (normalDifficulty.checked)
	{
		return EDifficulty.Normal;
	}
	else if (hardDifficulty.checked)
	{
		return EDifficulty.Hard;
	}
	else if (expertDifficulty.checked)
	{
		return EDifficulty.Expert;
	}
	else
	{
		assert(false, "No difficulty level selected.");
	}
}

/// Gets the selected assistance level.
/// @returns The selected assistance level.
const GetSelectedAssistanceLevel: () => EAssistanceLevel = () =>
{
	// Get the always assistance radio button
	const alwaysAssistance = document.getElementById(
		ID_ASSISTANCE_ALWAYS
	) as HTMLInputElement;
	assert(
		alwaysAssistance !== null,
		`Could not find radio button with ID ${ID_ASSISTANCE_ALWAYS}`
	);

	// Get the halfway assistance radio button
	const halfwayAssistance = document.getElementById(
		ID_ASSISTANCE_HALFWAY
	) as HTMLInputElement;
	assert(
		halfwayAssistance !== null,
		`Could not find radio button with ID ${ID_ASSISTANCE_HALFWAY}`
	);

	// Get the quarter assistance radio button
	const quarterAssistance = document.getElementById(
		ID_ASSISTANCE_QUARTER
	) as HTMLInputElement;
	assert(
		quarterAssistance !== null,
		`Could not find radio button with ID ${ID_ASSISTANCE_QUARTER}`
	);

	// Get the off assistance radio button
	const offAssistance = document.getElementById(
		ID_ASSISTANCE_OFF
	) as HTMLInputElement;
	assert(
		offAssistance !== null,
		`Could not find radio button with ID ${ID_ASSISTANCE_OFF}`
	);

	// Get the selected assistance level
	if (alwaysAssistance.checked)
	{
		return EAssistanceLevel.Always;
	}
	else if (halfwayAssistance.checked)
	{
		return EAssistanceLevel.Halfway;
	}
	else if (quarterAssistance.checked)
	{
		return EAssistanceLevel.Quarter;
	}
	else if (offAssistance.checked)
	{
		return EAssistanceLevel.Off;
	}
	else
	{
		assert(false, "No assistance level selected.");
	}
}

/// Gets the selected vocabulary sets.
/// @returns A set containing the enum values for the selected vocabulary sets.
const GetSelectedVocabularySets: () => Set<EVocabularySet> = () =>
{
	// IDs of each vocabulary set checkbox and the enum value it maps to
	const vocabularySetCheckboxes: Map<string, EVocabularySet> = new Map([
		[ID_VOCAB_HIRAGANA_BASE, EVocabularySet.HiraganaBase],
		[ID_VOCAB_HIRAGANA_DAKUON, EVocabularySet.HiraganaDakuon],
		[ID_VOCAB_HIRAGANA_COMBO, EVocabularySet.HiraganaCombo],
		[ID_VOCAB_KATAKANA_BASE, EVocabularySet.KatakanaBase],
		[ID_VOCAB_KATAKANA_DAKUON, EVocabularySet.KatakanaDakuon],
		[ID_VOCAB_KATAKANA_COMBO, EVocabularySet.KatakanaCombo]
	]);

	// Get the selected vocabulary sets
	const selectedVocabularySets = new Set<EVocabularySet>();
	for (const [checkboxID, vocabularySet] of vocabularySetCheckboxes)
	{
		// Get the checkbox
		const checkbox = document.getElementById(
			checkboxID
		) as HTMLInputElement;
		assert(
			checkbox !== null,
			`Could not find checkbox with ID ${checkboxID}`
		);

		// Add the vocabulary set to the set if the checkbox is checked
		if (checkbox.checked)
		{
			selectedVocabularySets.add(vocabularySet);
		}
	}

	return selectedVocabularySets;
}
