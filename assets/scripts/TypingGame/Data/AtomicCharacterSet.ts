/// Layout used within JSON files that define atomic character sets.
export interface AtomicCharacterSet
{
	/// The name of the character set.
	DisplayName: string;

	/// The characters in the set.
	CharacterPairs: Array<AtomicCharacterPair>;
}

/// Format of each character mapping within an atomic character set.
export interface AtomicCharacterPair
{
	/// The characters that should be displayed.
	DisplayText: string;

	/// The characters that should be input.
	EnglishText: string;
}
