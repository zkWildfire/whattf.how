
import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";
import { IActiveText } from "./ActiveText";
import { ICharacterActor } from "../Actors/CharacterActor";

/// Basic implementation of the active text interface.
/// This implementation will not handle the case where there's a partial overlap
///   between two character sets. For example, assume a character set with the
///   input text "abc" and a character set with the input text "bcd" are on
///   screen. If the user types "abc", the component will detect that the
///   current active text is "abc", then will clear the active text because
///   it doesn't match any character sets on screen (due to the "abc" actor
///   getting destroyed). However, when the user types "d", the "bcd" actor
///   will be destroyed because the previously typed "bc" will have been applied
///   to the "bcd" actor.
export class BasicActiveText implements IActiveText
{
	/// Event broadcast when the active text changes.
	/// The event parameter will be the new text to display as active.
	get OnActiveTextChanged(): ISimpleEvent<string>
	{
		return this._onActiveTextChanged.asEvent();
	}

	/// Dispatcher for the `OnActiveTextChanged` event.
	private readonly _onActiveTextChanged = new SimpleEventDispatcher<string>();

	/// Set of all character actors that are currently on screen.
	private readonly _characterActors: Set<ICharacterActor> =
		new Set<ICharacterActor>();

	/// The current active text.
	private _activeText: string = "";

	/// Notifies the component that a character actor was spawned.
	/// @param actor The character actor that was spawned.
	public OnCharacterSetSpawned(actor: ICharacterActor): void
	{
		this._characterActors.add(actor);
	}

	/// Notifies the component that a character actor was destroyed.
	/// @param actor The character actor that was destroyed.
	public OnCharacterSetDestroyed(actor: ICharacterActor): void
	{
		this._characterActors.delete(actor);
	}

	/// Notifies the component that a character was typed.
	/// @warning This must be called *after* the component has been notified
	///   of any destroyed character actors.
	/// @param c The character that was typed. This will always be a single
	///   character string and will always be a lower case English letter.
	public OnKeyPressed(key: string): void
	{
		// Update the active text
		const originalActiveText = this._activeText;
		this._activeText += key;

		// Check if the active text matches any character actors
		let activeTextMatches = false;
		for (const actor of this._characterActors)
		{
			if (actor.CharacterMapping.InputCharacters.startsWith(
				this._activeText))
			{
				activeTextMatches = true;
				break;
			}
		}

		// If the active text doesn't match any character actors, clear it
		if (!activeTextMatches)
		{
			this._activeText = "";
		}

		// If the active text changed, notify listeners
		if (this._activeText !== originalActiveText)
		{
			this._onActiveTextChanged.dispatch(this._activeText);
		}
	}
}
