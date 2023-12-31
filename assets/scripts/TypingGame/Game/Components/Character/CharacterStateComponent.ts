import { ISignal } from "strongly-typed-events";
import { ICharacterMapping } from "../../../Data/CharacterMapping";

/// Component that tracks the current progress towards typing the character.
export interface ICharacterStateComponent
{
	/// Event broadcast to when one of the input characters is correct.
	get OnCorrectInput(): ISignal;

	/// Event broadcast to when one of the input characters is incorrect.
	/// This will only be broadcast to if at least one input character was
	///   typed correctly before the incorrect character was typed.
	get OnIncorrectInput(): ISignal;

	/// Event broadcast to when the character(s) have been fully typed.
	get OnComplete(): ISignal;

	/// The character mapping that the component is handling.
	get CharacterMapping(): ICharacterMapping;

	/// Gets the string of display characters that have been typed.
	get TypedDisplayCharacters(): string;

	/// Gets the string of display characters that have not been typed.
	get RemainingDisplayCharacters(): string;

	/// Gets the string of input characters that have been typed.
	get TypedInputCharacters(): string;

	/// Gets the string of input characters that have not been typed.
	get RemainingInputCharacters(): string;

	/// Notifies the component that a character was typed.
	/// @returns Whether or not the typed character matched the next character
	///   required to be typed for this character set.
	OnCharacterTyped(c: string): boolean;
}
