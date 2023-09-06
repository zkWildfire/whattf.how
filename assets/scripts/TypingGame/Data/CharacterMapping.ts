/// Defines a mapping between two sets of characters.
/// This class is used for mapping display characters to their corresponding
///   input characters. Display characters may be in any language, whereas
///   input characters should always be lower case English letters.
export interface ICharacterMapping
{
	/// The characters that should be displayed.
	get DisplayCharacters(): string;

	/// The characters that should be input.
	get InputCharacters(): string;

	/// Gets the range of input characters corresponding to the display
	///   character.
	/// @param displayCharIndex The index of the display character to get the
	///   input range for. Must be a valid index into the display characters
	///   string.
	/// @returns The range of input characters corresponding to the display
	///   character. The first value will be the index of the first input
	///   character, and the second value will be the past-the-end index for
	///   the range.
	GetInputRange(displayCharIndex: number): [number, number];
}
