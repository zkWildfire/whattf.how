import { ISignal, SignalDispatcher } from "strongly-typed-events";
import { ICharacterStateComponent } from "./CharacterStateComponent";
import { ICharacterMapping } from "../../../Data/CharacterMapping";

/// Character state component usable with atomic character mappings.
export class AtomicCharacterStateComponent implements ICharacterStateComponent
{
	/// Event broadcast to when one of the input characters is correct.
	get OnCorrectInput(): ISignal
	{
		return this._onCorrectInput.asEvent();
	}

	/// Event broadcast to when one of the input characters is incorrect.
	/// This will only be broadcast to if at least one input character was
	///   typed correctly before the incorrect character was typed.
	get OnIncorrectInput(): ISignal
	{
		return this._onIncorrectInput.asEvent();
	}

	/// Event broadcast to when the character(s) have been fully typed.
	get OnComplete(): ISignal
	{
		return this._onComplete.asEvent();
	}

	/// Gets the string of display characters that have been typed.
	get TypedDisplayCharacters(): string
	{
		// Atomic character mappings are either fully typed or fully untyped.
		//   Since a character actor is destroyed when it is fully typed, this
		//   method can simply return an empty string since the typed display
		//   characters string will never be used.
		return "";
	}

	/// Gets the string of display characters that have not been typed.
	get RemainingDisplayCharacters(): string
	{
		// Atomic character mappings are either fully typed or fully untyped.
		//   Since a character actor is destroyed when it is fully typed, this
		//   method can assume that all display characters are remaining since
		//   the only time this assumption is wrong is when the character actor
		//   is destroyed, in which case it doesn't matter what this method
		//   returns.
		return this._characterMapping.DisplayCharacters;
	}

	/// Gets the string of input characters that have been typed.
	get TypedInputCharacters(): string
	{
		return this._characterMapping.InputCharacters.substring(0, this._index);
	}

	/// Gets the string of input characters that have not been typed.
	get RemainingInputCharacters(): string
	{
		return this._characterMapping.InputCharacters.substring(this._index);
	}

	/// Dispatcher for the `OnCorrectInput` event.
	private readonly _onCorrectInput: SignalDispatcher;

	/// Dispatcher for the `OnIncorrectInput` event.
	private readonly _onIncorrectInput: SignalDispatcher;

	/// Dispatcher for the `OnComplete` event.
	private readonly _onComplete: SignalDispatcher;

	/// The character mapping to use.
	private readonly _characterMapping: ICharacterMapping;

	/// The index of the next input character that needs to be typed.
	private _index: number;

	/// Initializes a new instance of the class.
	/// @param characterMapping The character mapping to use.
	constructor(characterMapping: ICharacterMapping)
	{
		this._onCorrectInput = new SignalDispatcher();
		this._onIncorrectInput = new SignalDispatcher();
		this._onComplete = new SignalDispatcher();
		this._characterMapping = characterMapping;
		this._index = 0;
	}

	/// Notifies the component that a character was typed.
	/// @returns Whether or not the typed character matched the next character
	///   required to be typed for this character set.
	public OnCharacterTyped(c: string): boolean
	{
		// Check if the character is correct
		if (c === this._characterMapping.InputCharacters[this._index])
		{
			// The character is correct; advance to the next character
			this._index++;

			// Check if the input string was fully typed
			if (this._index === this._characterMapping.InputCharacters.length)
			{
				this._onComplete.dispatch();
			}
			else
			{
				this._onCorrectInput.dispatch();
			}

			return true;
		}
		else if (this._index > 0)
		{
			// Require the input string to be typed from the beginning
			this._index = 0;

			// Only dispatch the incorrect input event if at least one input
			//   character was typed correctly before the incorrect character
			//   was typed
			this._onIncorrectInput.dispatch();
		}

		return false;
	}
}
