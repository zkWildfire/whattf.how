import { EVocabularySet } from "../Menu/VocabularySet";
import { AtomicCharacterSetLoader } from "./AtomicCharacterSetLoader";
import { ICharacterSetLoader } from "./CharacterSetLoader";

/// Base URL for all vocabulary set data files.
const VOCAB_SET_URL_BASE: string = "/assets/data/typing-game/";

/// URLs for the Hiragana vocabulary sets.
const VOCAB_SET_HIRAGANA_BASE_SET =
	`${VOCAB_SET_URL_BASE}/hiragana/base.json`;
const VOCAB_SET_HIRAGANA_DAKUON_SET =
	`${VOCAB_SET_URL_BASE}/hiragana/dakuon.json`;
const VOCAB_SET_HIRAGANA_COMBO_SET =
	`${VOCAB_SET_URL_BASE}/hiragana/combo.json`;

/// URLs for the Katakana vocabulary sets.
const VOCAB_SET_KATAKANA_BASE_SET =
	`${VOCAB_SET_URL_BASE}/katakana/base.json`;
const VOCAB_SET_KATAKANA_DAKUON_SET =
	`${VOCAB_SET_URL_BASE}/katakana/dakuon.json`;
const VOCAB_SET_KATAKANA_COMBO_SET =
	`${VOCAB_SET_URL_BASE}/katakana/combo.json`;

/// Maps each available vocabulary set to the data loader to use.
export const VOCABULARY_SET_DATA_LOADERS: Map<
	EVocabularySet,
	() => ICharacterSetLoader
> = new Map([
	[
		EVocabularySet.HiraganaBase,
		() => new AtomicCharacterSetLoader(
			VOCAB_SET_HIRAGANA_BASE_SET
		)
	],
	[
		EVocabularySet.HiraganaDakuon,
		() => new AtomicCharacterSetLoader(
			VOCAB_SET_HIRAGANA_DAKUON_SET
		)
	],
	[
		EVocabularySet.HiraganaCombo,
		() => new AtomicCharacterSetLoader(
			VOCAB_SET_HIRAGANA_COMBO_SET
		)
	],
	[
		EVocabularySet.KatakanaBase,
		() => new AtomicCharacterSetLoader(
			VOCAB_SET_KATAKANA_BASE_SET
		)
	],
	[
		EVocabularySet.KatakanaDakuon,
		() => new AtomicCharacterSetLoader(
			VOCAB_SET_KATAKANA_DAKUON_SET
		)
	],
	[
		EVocabularySet.KatakanaCombo,
		() => new AtomicCharacterSetLoader(
			VOCAB_SET_KATAKANA_COMBO_SET
		)
	]
]);
