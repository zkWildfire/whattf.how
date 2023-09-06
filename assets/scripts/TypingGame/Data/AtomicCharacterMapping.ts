import { ICharacterMapping } from "./CharacterMapping";

/// Defines a mapping between two sets of characters.
/// This class is specifically for mappings that map one or more display
///   characters that must be treated as an atomic unit, e.g. the display
///   character or characters maps to the entire input range.
export class AtomicCharacterMapping implements ICharacterMapping
{
	/// The characters that should be displayed.
	public get DisplayCharacters(): string
	{
		return this._displayCharacters;
	}

	/// The characters that should be input.
	public get InputCharacters(): string
	{
		return this._inputCharacters;
	}

	/// The characters that should be displayed.
	private readonly _displayCharacters: string;

	/// The characters that should be input.
	private readonly _inputCharacters: string;

	/// Initializes the character mapping.
	/// @param displayCharacters The characters that should be displayed.
	/// @param inputCharacters The characters that should be input.
	constructor(displayCharacters: string, inputCharacters: string)
	{
		this._displayCharacters = displayCharacters;
		this._inputCharacters = inputCharacters;
	}

	/// Gets the range of input characters corresponding to the display
	///   character.
	/// @param displayCharIndex The index of the display character to get the
	///   input range for. Must be a valid index into the display characters
	///   string.
	/// @returns The range of input characters corresponding to the display
	///   character. The first value will be the index of the first input
	///   character, and the second value will be the past-the-end index for
	///   the range.
	public GetInputRange(displayCharIndex: number): [number, number]
	{
		// Handle invalid input
		if (displayCharIndex < 0 ||
			displayCharIndex >= this._displayCharacters.length)
		{
			throw new Error("Invalid display character index - expected a " +
				`value in the range [0, ${this._displayCharacters.length}), ` +
				`but got ${displayCharIndex}.`
			);
		}

		// Atomic character mappings map the display character(s) to the
		//   entire input range.
		return [0, this._inputCharacters.length];
	}
}
