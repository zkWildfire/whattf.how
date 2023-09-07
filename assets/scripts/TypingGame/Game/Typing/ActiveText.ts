import { ISimpleEvent } from "strongly-typed-events";
import { ICharacterActor } from "../Actors/CharacterActor";

/// Interface for classes that keep track of what characters are "active".
/// Typed text is considered active if it applies to one or more character
///   sets on screen.
export interface IActiveText
{
	/// Event broadcast when the active text changes.
	/// The event parameter will be the new text to display as active.
	get OnActiveTextChanged(): ISimpleEvent<string>;

	/// Notifies the component that a character actor was spawned.
	/// @param actor The character actor that was spawned.
	OnCharacterSetSpawned(actor: ICharacterActor): void;

	/// Notifies the component that a character actor was destroyed.
	/// @param actor The character actor that was destroyed.
	OnCharacterSetDestroyed(actor: ICharacterActor): void;

	/// Notifies the component that a character was typed.
	/// @warning This must be called *after* the component has been notified
	///   of any destroyed character actors.
	/// @param c The character that was typed. This will always be a single
	///   character string and will always be a lower case English letter.
	OnKeyPressed(key: string): void;
}
