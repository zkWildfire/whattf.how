import { ICharacterMapping } from "../../Data/CharacterMapping";
import { EDifficulty } from "../../Menu/Difficulty";
import { ConstantMovementComponent } from "../Components/Movement/ConstantMovementComponent";
import { IMovementComponent } from "../Components/Movement/MovementComponent";
import { FixedIntervalSpawnTimer } from "../SpawnTimers/FixedIntervalSpawnTimer";
import { ISpawnTimer } from "../SpawnTimers/SpawnTimer";
import { IRuleset } from "./Ruleset";

/// Classic ruleset for the game.
export class ClassicRuleset implements IRuleset
{
	/// Constructs a new movement component for a character actor.
	/// @param spawnPosition The position that the character actor is being
	///   spawned at.
	/// @param difficulty The difficulty setting for the game.
	/// @returns A new movement component for a character actor.
	public CreateMovementComponent(
		spawnPosition: { x: number, y: number },
		difficulty: EDifficulty): IMovementComponent
	{
		// TODO: The movement speed should be scaled by the canvas size
		// TODO: The reset Y position should be based on the canvas size
		switch (difficulty)
		{
			case EDifficulty.Easy:
				return new ConstantMovementComponent(
					spawnPosition,
					0.75,
					0
				);
			case EDifficulty.Normal:
				return new ConstantMovementComponent(
					spawnPosition,
					1,
					0
				);
			case EDifficulty.Hard:
				return new ConstantMovementComponent(
					spawnPosition,
					1.25,
					0
				);
			case EDifficulty.Expert:
				return new ConstantMovementComponent(
					spawnPosition,
					1.5,
					0
				);
			default:
				throw new Error(`Unknown difficulty: ${difficulty}`);
		}
	}

	/// Gets the damage a character mapping should deal.
	/// @param characterMapping The character mapping to get the damage for.
	/// @param difficulty The difficulty setting for the game.
	/// @returns The amount of damage the character mapping will deal.
	public GetDamage(
		characterMapping: ICharacterMapping,
		difficulty: EDifficulty): number
	{
		return characterMapping.DisplayCharacters.length;
	}

	/// Gets the number of points a character mapping is worth.
	/// @param characterMapping The character mapping to get the points for.
	/// @param difficulty The difficulty setting for the game.
	/// @returns The number of points the character mapping is worth.
	public GetPoints(
		characterMapping: ICharacterMapping,
		difficulty: EDifficulty): number
	{
		// Get the score multiplier for the current difficulty
		let scoreMultiplier: number;
		switch (difficulty)
		{
			case EDifficulty.Easy:
				scoreMultiplier = 1;
				break;
			case EDifficulty.Normal:
				scoreMultiplier = 2;
				break;
			case EDifficulty.Hard:
				scoreMultiplier = 3;
				break;
			case EDifficulty.Expert:
				scoreMultiplier = 4;
				break;
			default:
				throw new Error(`Unknown difficulty: ${difficulty}`);
		}

		return characterMapping.DisplayCharacters.length * scoreMultiplier;
	}

	/// Gets the spawn timer to use for the game.
	/// @param difficulty The difficulty to get the spawn timer for.
	/// @returns The spawn timer to use for the game.
	public GetSpawnTimer(difficulty: EDifficulty): ISpawnTimer
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

	/// Gets the number of starting lives for the game.
	/// @param difficulty The difficulty to get the number of starting lives for.
	/// @returns The number of starting lives for the game.
	public GetStartingLives(difficulty: EDifficulty): number
	{
		switch (difficulty)
		{
			case EDifficulty.Easy:
				return 20;
			case EDifficulty.Normal:
				return 10;
			case EDifficulty.Hard:
				return 5;
			case EDifficulty.Expert:
				return 1;
			default:
				throw new Error(`Unknown difficulty: ${difficulty}`);
		}
	}
}
