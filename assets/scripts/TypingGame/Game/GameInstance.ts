import { EDifficulty } from "../Menu/Difficulty";
import { Settings } from "../Menu/Settings";
import { FixedIntervalSpawnTimer } from "./FixedIntervalSpawnTimer";
import { ISpawnTimer } from "./SpawnTimer";

/// Class that handles running an instance of the typing game.
export class GameInstance
{
	/// The settings to use for the game.
	private readonly _settings: Settings;

	/// Initializes a new instance of the class.
	/// @param settings The settings to use for the game.
	constructor(settings: Settings)
	{
		this._settings = settings;
	}

	/// Gets the spawn timer to use for the game.
	/// @param difficulty The difficulty to get the spawn timer for.
	/// @returns The spawn timer to use for the game.
	private GetSpawnTimer(difficulty: EDifficulty): ISpawnTimer
	{
		switch (difficulty)
		{
			case EDifficulty.Easy:
				return new FixedIntervalSpawnTimer(2000);
			case EDifficulty.Normal:
				return new FixedIntervalSpawnTimer(1500);
			case EDifficulty.Hard:
				return new FixedIntervalSpawnTimer(1000);
			case EDifficulty.Expert:
				return new FixedIntervalSpawnTimer(500);
			default:
				throw new Error(`Unknown difficulty: ${difficulty}`);
		}
	}
}
