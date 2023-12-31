import assert from "assert";
import { EAssistanceLevel } from "./Assistance";
import { EDifficulty } from "./Difficulty";
import { EVocabularySet } from "./VocabularySet";
import { Settings } from "./Settings";
import { ICharacterMapping } from "../Data/CharacterMapping";
import { VOCABULARY_SET_DATA_LOADERS } from "../Data/VocabularySets";
import { ClassicRuleset } from "../Game/Rulesets/ClassicRuleset";
import { GameInstance } from "../Game/GameInstance";
import { GameResults } from "../Game/GameResults";

/// ID of the game menu HTML element
const ID_GAME_MENU = "game-menu";

/// ID of the start button HTML element
export const ID_START_BUTTON = "start-button";

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

/// ID of the top-level element for all game elements
const ID_GAME_ROOT = "game";

/// ID of the game canvas HTML element
const ID_GAME_CANVAS = "game-canvas";

/// IDs of the various UI elements for the game
const ID_SCORE = "score";
const ID_LIVES = "lives";
const ID_ACTIVE_TEXT = "active-text";

/// ID of the top-level element for the post-game menu
const ID_POST_GAME_MENU = "post-game-menu";

/// ID of the score element on the post-game menu
const ID_POST_GAME_SCORE = "post-game-score";

/// ID of the play again button on the post-game menu
export const ID_PLAY_AGAIN_BUTTON = "play-again";

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
export const OnStartClicked: () => void = async () =>
{
	// Get the vocabulary sets to use
	// TODO: Display an error instead of doing nothing if no vocabulary sets are
	//   selected
	const selectedVocabularySets = GetSelectedVocabularySets();
	if (selectedVocabularySets.size === 0)
	{
		return;
	}

	// Load the character mappings for each vocabulary set
	const characterMappings = new Array<ICharacterMapping>();
	for (const vocabularySet of selectedVocabularySets)
	{
		const mappings = await LoadVocabularySet(vocabularySet);
		characterMappings.push(...mappings);
	}

	// Hide the main menu and show the game canvas
	const gameMenu = document.getElementById(ID_GAME_MENU);
	assert(
		gameMenu !== null,
		`Could not find game menu element with ID ${ID_GAME_MENU}`
	);
	gameMenu.classList.add("d-none");

	const gameRoot = document.getElementById(ID_GAME_ROOT);
	assert(
		gameRoot !== null,
		`Could not find game root element with ID ${ID_GAME_ROOT}`
	);
	gameRoot.classList.remove("d-none");
	gameRoot.classList.add("d-flex");

	// Get the game canvas
	const gameCanvas = document.getElementById(
		ID_GAME_CANVAS
	) as HTMLCanvasElement;
	assert(
		gameCanvas !== null,
		`Could not find game canvas element with ID ${ID_GAME_CANVAS}`
	);

	// Get the game UI elements
	const scoreElement = document.getElementById(ID_SCORE);
	assert(
		scoreElement !== null,
		`Could not find score element with ID ${ID_SCORE}`
	);
	const livesElement = document.getElementById(ID_LIVES);
	assert(
		livesElement !== null,
		`Could not find lives element with ID ${ID_LIVES}`
	);
	const activeTextElement = document.getElementById(ID_ACTIVE_TEXT);
	assert(
		activeTextElement !== null,
		`Could not find active text element with ID ${ID_ACTIVE_TEXT}`
	);

	// Get the post-game menu elements
	const postGameMenu = document.getElementById(ID_POST_GAME_MENU);
	assert(
		postGameMenu !== null,
		`Could not find post-game menu element with ID ${ID_POST_GAME_MENU}`
	);
	const postGameScoreElement = document.getElementById(ID_POST_GAME_SCORE);
	assert(
		postGameScoreElement !== null,
		`Could not find post-game score element with ID ${ID_POST_GAME_SCORE}`
	);

	// Create the game instance
	const settings: Settings = {
		difficulty: GetSelectedDifficulty(),
		assistanceLevel: GetSelectedAssistanceLevel(),
		characterMappings: characterMappings,
		ruleset: new ClassicRuleset()
	};
	const gameInstance = new GameInstance(
		gameCanvas,
		settings
	);

	// Bind to the game instance's events
	gameInstance.OnScoreChanged.subscribe((score: number) =>
	{
		scoreElement.innerText = score.toString();
	});
	gameInstance.OnLivesChanged.subscribe((lives: number) =>
	{
		livesElement.innerText = lives.toString();
	});
	gameInstance.OnActiveTextChanged.subscribe((activeText: string) =>
	{
		activeTextElement.innerText = activeText;
	});
	gameInstance.OnGameOver.subscribe((results: GameResults) =>
	{
		// Hide the game UI elements
		gameRoot.classList.add("d-none");

		// Set the score on the post-game menu
		postGameScoreElement.innerText = results.points.toString();

		// Show the post-game menu
		postGameMenu.classList.remove("d-none");
	});

	// Scroll the page so that the top of the game's element is at the top of
	//   the viewport
	gameRoot.scrollIntoView();

	// Run the game
	gameInstance.Start();
}

export const OnPlayAgainClicked: () => void = () =>
{
	// Get the post-game menu element
	const postGameMenu = document.getElementById(ID_POST_GAME_MENU);
	assert(
		postGameMenu !== null,
		`Could not find post-game menu element with ID ${ID_POST_GAME_MENU}`
	);

	// Hide the post-game menu
	postGameMenu.classList.add("d-none");

	// Get the game menu element
	const gameMenu = document.getElementById(ID_GAME_MENU);
	assert(
		gameMenu !== null,
		`Could not find game menu element with ID ${ID_GAME_MENU}`
	);

	// Show the game menu
	gameMenu.classList.remove("d-none");
};

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
		throw new Error("No difficulty selected.");
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
		throw new Error("No assistance level selected.");
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

/// Loads the character mappings for the given vocabulary set.
/// @param vocabularySet The vocabulary set to load the character mappings for.
/// @returns The character mappings for the given vocabulary set.
const LoadVocabularySet:
	(vocabularySet: EVocabularySet) => Promise<Array<ICharacterMapping>> =
	async (vocabularySet: EVocabularySet) =>
{
	// Get the data loader for the vocabulary set
	const dataLoader = VOCABULARY_SET_DATA_LOADERS.get(vocabularySet);
	assert(
		dataLoader !== undefined,
		`No data loader found for vocabulary set ${vocabularySet}`
	);

	// Load the character mappings
	return dataLoader().LoadAsync();
}
