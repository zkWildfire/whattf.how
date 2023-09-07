import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";
import { ICharacterMapping } from "../Data/CharacterMapping";
import { EAssistanceLevel } from "../Menu/Assistance";
import { EDifficulty } from "../Menu/Difficulty";
import { Settings } from "../Menu/Settings";
import { AtomicCharacterActor } from "./Actors/AtomicCharacterActor";
import { ICharacterActor } from "./Actors/CharacterActor";
import { ThresholdAssistanceComponent } from "./Components/Assistance/ThresholdAssistanceComponent";
import { GameResults } from "./GameResults";
import { IRuleset } from "./Rulesets/Ruleset";
import { FixedIntervalSpawnTimer } from "./SpawnTimers/FixedIntervalSpawnTimer";
import { ISpawnTimer } from "./SpawnTimers/SpawnTimer";
import { LineSpawner } from "./Spawners/LineSpawner";
import { ISpawner } from "./Spawners/Spawner";

/// Class that handles running an instance of the typing game.
export class GameInstance
{
	/// Event broadcast to when the player's score changes.
	/// The event parameter will be the new score.
	get OnScoreChanged(): ISimpleEvent<number>
	{
		return this._onScoreChanged.asEvent();
	}

	/// Event broadcast to when the player's lives change.
	/// The event parameter will be the new number of lives.
	get OnLivesChanged(): ISimpleEvent<number>
	{
		return this._onLivesChanged.asEvent();
	}

	/// Convenience alias for the game's ruleset instance.
	private get Ruleset(): IRuleset
	{
		return this._settings.ruleset;
	}

	/// Dispatcher for the `OnScoreChanged` event.
	private readonly _onScoreChanged: SimpleEventDispatcher<number>;

	/// Dispatcher for the `OnLivesChanged` event.
	private readonly _onLivesChanged: SimpleEventDispatcher<number>;

	/// The canvas to use for the game.
	private readonly _canvas: HTMLCanvasElement;

	/// The rendering context for the canvas.
	private readonly _ctx: CanvasRenderingContext2D;

	/// The spawn timer to use for the game.
	private readonly _spawnTimer: ISpawnTimer;

	/// The spawner to use for the game.
	private readonly _spawner: ISpawner;

	/// Settings for the game.
	private readonly _settings: Settings;

	/// All active actors in the game.
	private readonly _actors: Set<ICharacterActor>;

	/// Y-position at which point assistance should be provided.
	private readonly _assistanceThreshold: number;

	/// Effective size of the canvas, ignoring the device pixel ratio.
	private readonly _canvasSize: { width: number, height: number };

	/// Current score data for the game
	private _results: GameResults;

	/// Character(s) that the user has input since the last tick.
	private _userInput: string;

	/// Number of lives the player has remaining.
	private _remainingLives: number;

	/// Whether the game is running.
	private _isActive: boolean;

	/// Timestamp of the last tick.
	private _lastTickTimestamp: DOMHighResTimeStamp | null = null;

	/// Initializes a new instance of the class.
	/// @param canvas The canvas to use for the game.
	/// @param settings The settings to use for the game.
	constructor(
		canvas: HTMLCanvasElement,
		settings: Settings)
	{
		// Initialize basic fields
		this._onScoreChanged = new SimpleEventDispatcher<number>();
		this._onLivesChanged = new SimpleEventDispatcher<number>();
		this._canvas = canvas;
		this._canvasSize = GameInstance.SetupCanvas(canvas);
		this._settings = settings;
		this._actors = new Set<ICharacterActor>();
		this._userInput = "";
		this._isActive = false;
		this._results = {
			points: 0
		};

		// Initialize the assistance threshold
		switch (settings.assistanceLevel)
		{
			case EAssistanceLevel.Always:
				this._assistanceThreshold = -Infinity;
				break;
			case EAssistanceLevel.Halfway:
				this._assistanceThreshold = this._canvasSize.height * 0.5;
				break;
			case EAssistanceLevel.Quarter:
				this._assistanceThreshold = this._canvasSize.height * 0.75;
				break;
			case EAssistanceLevel.Off:
				this._assistanceThreshold = Infinity;
				break;
			default:
				throw new Error(
					`Unknown assistance level: ${settings.assistanceLevel}`
				);
		}

		// Get the rendering context for the canvas
		const ctx = canvas.getContext("2d");
		if (ctx === null)
		{
			throw new Error("Could not get 2D rendering context for canvas");
		}
		this._ctx = ctx;

		// Initialize ruleset-dependent fields
		this._spawnTimer = this.Ruleset.GetSpawnTimer(settings.difficulty);
		this._remainingLives = this.Ruleset.GetStartingLives(
			settings.difficulty
		);

		// For now, spawn characters anywhere along the top of the screen
		// TODO: Base the minimum and maximum X-values on the widest character
		//   mapping in the game
		const offset = 0.1;
		const minX = this._canvasSize.width * offset;
		const maxX = this._canvasSize.width * (1 - offset);
		this._spawner = new LineSpawner(
			{ x: minX, y: 0 },
			{ x: maxX, y: 0 }
		);

		// Bind to events
		this._spawnTimer.OnShouldSpawn.subscribe(
			this.SpawnCharacter.bind(this)
		);
	}

	/// Starts the game.
	public Start(): void
	{
		// Initialize game state for the start of the game
		this._isActive = true;
		this._spawnTimer.Start();

		// Broadcast the starting data for the game
		this._onScoreChanged.dispatch(this._results.points);
		this._onLivesChanged.dispatch(this._remainingLives);

		// Bind to events
		window.addEventListener("keypress", this.OnKeyPress.bind(this))

		requestAnimationFrame(this.Tick.bind(this));
	}

	/// Runs a single tick of the game.
	/// @param timestamp Timestamp data provided by the browser.
	private Tick(timestamp: DOMHighResTimeStamp): void
	{
		// Calculate the amount of time since the last tick
		if (this._lastTickTimestamp === null)
		{
			this._lastTickTimestamp = timestamp;
		}
		const deltaTimeMs = timestamp > this._lastTickTimestamp
			? timestamp - this._lastTickTimestamp
			: 0.01;
		this._lastTickTimestamp = timestamp;

		// Get the delta time in seconds
		const deltaTime = deltaTimeMs / 1000;

		// Process user input
		// This may also result in actors being removed from `_actors` by way
		//   of the callback for the `OnDestroyed` event
		this.ProcessInput();

		// Update the position of all actors
		for (const actor of this._actors)
		{
			actor.Tick(deltaTime);
		}

		// Render all actors
		this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
		for (const actor of this._actors)
		{
			actor.Render(this._canvas, this._ctx);
		}

		// Check whether the game is over
		if (this._remainingLives <= 0)
		{
			this._isActive = false;
		}
		this._isActive = true;

		// If the game is still running, queue up for the next tick
		if (this._isActive)
		{
			requestAnimationFrame(this.Tick.bind(this));
		}
		else
		{
			this.FinishGame();
		}
	}

	/// Handles game cleanup and transitions to the score screen.
	private FinishGame(): void
	{
		this._spawnTimer.Stop();

		// TODO: Transition to the score screen
		console.log(`Game over! Score: ${this._results.points}`);
	}

	/// Gets a random character mapping to use for a new character.
	/// @returns A random character mapping to use for a new character.
	private GetRandomCharacterMapping(): ICharacterMapping
	{
		return this._settings.characterMappings[
			Math.floor(Math.random() * this._settings.characterMappings.length)
		];
	}

	/// Callback invoked when a key is pressed.
	/// @param e The keyboard event data.
	private OnKeyPress(e: KeyboardEvent): void
	{
		// Ignore the event if the game is not running
		if (!this._isActive)
		{
			return;
		}

		// Ignore the event if the key pressed was not an English letter
		if (e.key.length !== 1 || !/[a-z]/.test(e.key))
		{
			return;
		}

		this._userInput += e.key;
	}

	/// Processes user input typed since the last tick.
	private ProcessInput(): void
	{
		// Process each typed character individually
		for (const c of this._userInput)
		{
			// Iterate over a local copy of the actors set
			// This is necessary because the `OnCharacterTyped` callback may
			//   result in actors being destroyed, which would cause the actor
			//   to be removed from the set while it is being iterated over.
			const localActors = new Set<ICharacterActor>(this._actors);

			// TODO: Keep track of whether the input matched the next character
			//   of any of the active actors
			for (const actor of localActors)
			{
				actor.OnCharacterTyped(c);
			}
		}
	}

	/// Spawns a new character.
	private SpawnCharacter(): void
	{
		// Randomly select a character mapping to use for the new character
		const characterMapping = this.GetRandomCharacterMapping();

		// Determine the spawn location for the new character
		const spawnPosition = this._spawner.GetNextSpawnPosition();

		// Create the assistance component for the new character
		const assistanceComponent = new ThresholdAssistanceComponent(
			this._assistanceThreshold
		);

		// Create the new character
		// TODO: Support other types of characters
		const character = new AtomicCharacterActor(
			characterMapping,
			this.Ruleset.CreateMovementComponent(
				spawnPosition,
				this._canvasSize,
				this._settings.difficulty
			),
			assistanceComponent,
			this.Ruleset.GetPoints(
				characterMapping,
				this._settings.difficulty
			),
			this.Ruleset.GetDamage(
				characterMapping,
				this._settings.difficulty
			)
		);
		this._actors.add(character);

		// Bind to events
		character.OnDestroyed.subscribe((actor) =>
		{
			this._results.points += actor.Points;
			this._onScoreChanged.dispatch(this._results.points);
			this._actors.delete(actor);
		});
		character.OnRespawned.subscribe((actor) =>
		{
			this._remainingLives -= actor.Damage;
			this._onLivesChanged.dispatch(this._remainingLives);
		});
	}

	/// Initializes canvas properties for the game.
	/// @param canvas The canvas to initialize.
	/// @returns The effective canvas size, ignoring the device pixel ratio.
	private static SetupCanvas(canvas: HTMLCanvasElement):
		{ width: number, height: number}
	{
		// Get the device pixel ratio, falling back to 1 as necessary
		const dpr = window.devicePixelRatio || 1;

		// Get the size of the canvas in CSS pixels
		const rect = canvas.getBoundingClientRect();

		// Modify the canvas's width and height properties to match the
		//   canvas's on screen size in device pixels
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;

		// Scale all drawing operations by the dpr so that the pixel ratio
		//   doesn't affect the canvas's internal coordinate system
		const ctx = canvas.getContext('2d')!;
		ctx.scale(dpr, dpr);

		// Return the effective canvas size
		return {
			width: rect.width,
			height: rect.height
		};
	}
}
