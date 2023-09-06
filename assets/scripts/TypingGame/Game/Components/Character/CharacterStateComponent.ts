import { ISignal } from "strongly-typed-events";

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

	/// Gets the string of display characters that have been typed.
	get TypedDisplayCharacters(): string;

	/// Gets the string of display characters that have not been typed.
	get RemainingDisplayCharacters(): string;

	/// Gets the string of input characters that have been typed.
	get TypedInputCharacters(): string;

	/// Gets the string of input characters that have not been typed.
	get RemainingInputCharacters(): string;

	/// Notifies the component that a character was typed.
	OnCharacterTyped(c: string): void;
}
