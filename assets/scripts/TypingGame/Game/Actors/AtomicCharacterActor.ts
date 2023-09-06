import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";
import { ICharacterActor } from "./CharacterActor";
import { ITextRendererComponent } from "../Components/Renderers/TextRendererComponent";
import { MonoTextRendererComponent } from "../Components/Renderers/MonoTextRendererComponent";
import { ICharacterMapping } from "../../Data/CharacterMapping";
import { IMovementComponent } from "../Components/Movement/MovementComponent";

/// Character actor that supports atomic characters.
export class AtomicCharacterActor implements ICharacterActor
{
	/// Event broadcast when the character set is destroyed.
	/// The event parameter will be the character set that was destroyed.
	public get OnDestroyed(): ISimpleEvent<ICharacterActor>
	{
		return this._onDestroyed.asEvent();
	}

	/// Event broadcast when the character set is respawned.
	/// If the character set reaches the bottom of the screen, it will be
	///   respawned at the top of the screen. Note that the word "respawn" is
	///   a bit of a misnomer; the character set is not destroyed and recreated,
	///   it is simply moved to the top of the screen.
	public get OnRespawned(): ISimpleEvent<ICharacterActor>
	{
		return this._onRespawned.asEvent();
	}

	/// Number of points the character set is worth.
	public get Points(): number
	{
		return this._points;
	}

	/// Amount of damage the character set will do to the player if it reaches
	///   the bottom of the screen.
	public get Damage(): number
	{
		return this._damage;
	}

	/// Gets whether or not the input text is visible.
	public get InputTextVisibility(): boolean
	{
		return this._inputTextVisibility;
	}

	/// Sets whether or not the input text should be visible.
	/// @param isVisible Whether or not the input text should be visible.
	public set InputTextVisibility(isVisible: boolean)
	{
		this._inputTextVisibility = isVisible;
	}

	/// Dispatcher for the `OnDestroyed` event.
	private readonly _onDestroyed: SimpleEventDispatcher<ICharacterActor>;

	/// Dispatcher for the `OnRespawned` event.
	private readonly _onRespawned: SimpleEventDispatcher<ICharacterActor>;

	/// Number of points the character set is worth.
	private readonly _points: number;

	/// Amount of damage the character set will do to the player if it reaches
	///   the bottom of the screen.
	private readonly _damage: number;

	/// Movement component used to move the character set.
	private readonly _movementComponent: IMovementComponent;

	/// Renderer component used to render the character set.
	private readonly _renderer: ITextRendererComponent;

	/// Whether or not the input text is visible.
	private _inputTextVisibility: boolean;

	/// Initializes a new instance of the class.
	constructor(
		characterMapping: ICharacterMapping,
		movementComponent: IMovementComponent,
		points: number,
		damage: number)
	{
		this._onDestroyed = new SimpleEventDispatcher<ICharacterActor>();
		this._onRespawned = new SimpleEventDispatcher<ICharacterActor>();
		this._points = points;
		this._damage = damage;
		this._movementComponent = movementComponent;
		this._inputTextVisibility = true;

		// Set up the text renderer
		this._renderer = new MonoTextRendererComponent(
			characterMapping.DisplayCharacters,
			{
				font: "\"Courier New\", Courier, monospace",
				fontSize: 24,
				textColor: "#FFFFFF",
				strokeColor: "#000000",
				strokeWidth: 2
			},
			characterMapping.InputCharacters,
			{
				font: "\"Courier New\", Courier, monospace",
				fontSize: 24,
				textColor: "#FFFFFF",
				strokeColor: "#000000",
				strokeWidth: 2
			}
		);

		// Bind to events
		this._movementComponent.OnReset.subscribe(() =>
		{
			this._onRespawned.dispatch(this);
		});
	}

	/// Notifies the character set that a character was typed.
	/// @param c The character that was typed. This will always be a single
	///   character string and will always be a lower case English letter.
	public OnCharacterTyped(c: string): void
	{
	}

	/// Runs the update logic for the character set.
	/// @param deltaTime The time in seconds since the last update.
	public Tick(deltaTime: number): void
	{
		this._movementComponent.Tick(deltaTime);
	}

	/// Renders the character set.
	/// @param canvas The canvas to render to.
	/// @param ctx The 2D rendering context to use.
	public Render(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D): void
	{
		this._renderer.Render(
			canvas,
			ctx,
			this._movementComponent.Position
		);
	}
}
