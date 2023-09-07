import { ICharacterMapping } from "../Data/CharacterMapping";
import { EDifficulty } from "../Menu/Difficulty";
import { Settings } from "../Menu/Settings";
import { ICharacterActor } from "./Actors/CharacterActor";
import { GameResults } from "./GameResults";
import { IRuleset } from "./Rulesets/Ruleset";
import { FixedIntervalSpawnTimer } from "./SpawnTimers/FixedIntervalSpawnTimer";
import { ISpawnTimer } from "./SpawnTimers/SpawnTimer";
import { LineSpawner } from "./Spawners/LineSpawner";
import { ISpawner } from "./Spawners/Spawner";

/// Class that handles running an instance of the typing game.
export class GameInstance
{
	/// Convenience alias for the game's ruleset instance.
	private get Ruleset(): IRuleset
	{
		return this._settings.ruleset;
	}

	/// The canvas to use for the game.
	private readonly _canvas: HTMLCanvasElement;

	/// The spawn timer to use for the game.
	private readonly _spawnTimer: ISpawnTimer;

	/// The spawner to use for the game.
	private readonly _spawner: ISpawner;

	/// Settings for the game.
	private readonly _settings: Settings;

	/// All active actors in the game.
	private readonly _actors: Set<ICharacterActor>;

	/// Current score data for the game
	private _results: GameResults;

	/// Character(s) that the user has input since the last tick.
	private _userInput: string;

	/// Number of lives the player has remaining.
	private _remainingLives: number;

	/// Whether the game is running.
	private _isActive: boolean;

	/// Initializes a new instance of the class.
	/// @param canvas The canvas to use for the game.
	/// @param settings The settings to use for the game.
	constructor(
		canvas: HTMLCanvasElement,
		settings: Settings)
	{
		// Initialize basic fields
		this._canvas = canvas;
		this._settings = settings;
		this._actors = new Set<ICharacterActor>();
		this._userInput = "";
		this._isActive = false;
		this._results = {
			correctCharacters: 0,
			points: 0
		};

		// Initialize ruleset-dependent fields
		this._spawnTimer = this.Ruleset.GetSpawnTimer(settings.difficulty);
		this._remainingLives = this.Ruleset.GetStartingLives(
			settings.difficulty
		);

		// For now, spawn characters anywhere along the top of the screen
		// TODO: Restrict this to a smaller range to account for longer
		//   characters' width
		this._spawner = new LineSpawner(
			{ x: 0, y: 0 },
			{ x: canvas.width, y: 0 }
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

		// Bind to events
		window.addEventListener("keypress", this.OnKeyPress.bind(this))

		requestAnimationFrame(this.Tick.bind(this));
	}

	/// Runs a single tick of the game.
	/// @param timestamp Timestamp data provided by the browser.
	private Tick(timestamp: DOMHighResTimeStamp): void
	{
		// Process user input
		// This may also result in actors being removed from `_actors` by way
		//   of the callback for the `OnDestroyed` event
		this.ProcessInput();

		// Update the position of all actors
		for (const actor of this._actors)
		{
			actor.Tick(timestamp);
		}

		// Check whether the game is over
		if (this._remainingLives <= 0)
		{
			this._isActive = false;
		}

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
	}
}
