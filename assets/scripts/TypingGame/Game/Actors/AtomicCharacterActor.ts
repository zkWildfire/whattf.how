import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";
import { ICharacterActor } from "./CharacterActor";
import { ITextRendererComponent } from "../Components/Renderers/TextRendererComponent";
import { MonoTextRendererComponent } from "../Components/Renderers/MonoTextRendererComponent";
import { ICharacterMapping } from "../../Data/CharacterMapping";
import { IMovementComponent } from "../Components/Movement/MovementComponent";
import { AtomicCharacterStateComponent } from "../Components/Character/AtomicCharacterStateComponent";
import { ICharacterStateComponent } from "../Components/Character/CharacterStateComponent";
import { IAssistanceComponent } from "../Components/Assistance/AssistanceComponent";

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

	/// The character mapping that the character set is displaying.
	get CharacterMapping(): ICharacterMapping
	{
		return this._stateComponent.CharacterMapping;
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

	/// Component used to enable and disable the input text.
	private readonly _assistanceComponent: IAssistanceComponent;

	/// Movement component used to move the character set.
	private readonly _movementComponent: IMovementComponent;

	/// Component used to keep track of the state of the character set.
	private readonly _stateComponent: ICharacterStateComponent;

	/// Renderer component used to render the character set.
	private readonly _renderer: ITextRendererComponent;

	/// Whether or not the input text is visible.
	private _inputTextVisibility: boolean;

	/// Initializes a new instance of the class.
	/// @param characterMapping The character mapping to use for the character
	///   set.
	/// @param movementComponent The movement component to use for the character
	///   set.
	/// @param assistanceComponent The assistance component to use for the
	///   character set.
	/// @param points The number of points the character set is worth.
	/// @param damage The amount of damage the character set will do to the
	///   player if it reaches the bottom of the screen.
	constructor(
		characterMapping: ICharacterMapping,
		movementComponent: IMovementComponent,
		assistanceComponent: IAssistanceComponent,
		points: number,
		damage: number)
	{
		this._onDestroyed = new SimpleEventDispatcher<ICharacterActor>();
		this._onRespawned = new SimpleEventDispatcher<ICharacterActor>();
		this._points = points;
		this._damage = damage;
		this._assistanceComponent = assistanceComponent;
		this._movementComponent = movementComponent;
		this._inputTextVisibility = true;

		// Set up the character state component
		this._stateComponent = new AtomicCharacterStateComponent(
			characterMapping
		);

		// Set up the text renderer
		this._renderer = new MonoTextRendererComponent(
			characterMapping.DisplayCharacters,
			{
				font: "\"Courier New\", Courier, monospace",
				fontSize: 32,
				textColor: "#FFFFFF",
				strokeColor: "#000000",
				strokeWidth: 4
			},
			characterMapping.InputCharacters,
			{
				font: "\"Courier New\", Courier, monospace",
				fontSize: 32,
				textColor: "#FFFFFF",
				strokeColor: "#000000",
				strokeWidth: 4
			}
		);

		// Bind to events
		this._assistanceComponent.OnShouldDisplayAssistance.subscribe(() =>
		{
			this._renderer.IsInputTextVisible = true;
		});
		this._assistanceComponent.OnShouldHideAssistance.subscribe(() =>
		{
			this._renderer.IsInputTextVisible = false;
		});
		this._movementComponent.OnReset.subscribe(() =>
		{
			this._onRespawned.dispatch(this);
		});
		this._stateComponent.OnComplete.subscribe(() =>
		{
			this._onDestroyed.dispatch(this);
		});
	}

	/// Notifies the character set that a character was typed.
	/// @param c The character that was typed. This will always be a single
	///   character string and will always be a lower case English letter.
	/// @returns Whether or not the typed character matched the next character
	///   required to be typed for this character set.
	public OnCharacterTyped(c: string): boolean
	{
		return this._stateComponent.OnCharacterTyped(c);
	}

	/// Runs the update logic for the character set.
	/// @param deltaTime The time in seconds since the last update.
	public Tick(deltaTime: number): void
	{
		this._movementComponent.Tick(deltaTime);
		this._assistanceComponent.Update(this._movementComponent.Position);
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
