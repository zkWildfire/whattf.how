import { ISimpleEvent } from "strongly-typed-events";

/// Base interface for actors that display a character set on screen.
export interface ICharacterSet
{
	/// Event broadcast when the character set is destroyed.
	/// The event parameter will be the character set that was destroyed.
	get OnDestroyed(): ISimpleEvent<ICharacterSet>;

	/// Event broadcast when the character set is respawned.
	/// If the character set reaches the bottom of the screen, it will be
	///   respawned at the top of the screen. Note that the word "respawn" is
	///   a bit of a misnomer; the character set is not destroyed and recreated,
	///   it is simply moved to the top of the screen.
	get OnRespawned(): ISimpleEvent<ICharacterSet>;

	/// Number of points the character set is worth.
	get Points(): number;

	/// Amount of damage the character set will do to the player if it reaches
	///   the bottom of the screen.
	get Damage(): number;

	/// Gets whether or not the input text is visible.
	get InputTextVisibility(): boolean;

	/// Sets whether or not the input text should be visible.
	/// @param isVisible Whether or not the input text should be visible.
	set InputTextVisibility(isVisible: boolean);

	/// Notifies the character set that a character was typed.
	/// @param c The character that was typed. This will always be a single
	///   character string and will always be a lower case English letter.
	OnCharacterTyped(c: string): void;

	/// Runs the update logic for the character set.
	/// @param deltaTime The time in seconds since the last update.
	Tick(deltaTime: number): void;

	/// Renders the character set.
	/// @param canvas The canvas to render to.
	/// @param ctx The 2D rendering context to use.
	Render(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D
	): void;
}
