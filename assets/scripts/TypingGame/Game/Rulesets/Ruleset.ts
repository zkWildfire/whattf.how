import { ICharacterMapping } from "../../Data/CharacterMapping";
import { EDifficulty } from "../../Menu/Difficulty";
import { IMovementComponent } from "../Components/Movement/MovementComponent";
import { FixedIntervalSpawnTimer } from "../SpawnTimers/FixedIntervalSpawnTimer";
import { ISpawnTimer } from "../SpawnTimers/SpawnTimer";

/// Defines methods for functionality affected by game settings.
export interface IRuleset
{
	/// Constructs a new movement component for a character actor.
	/// @param spawnPosition The position that the character actor is being
	///   spawned at.
	/// @param canvasSize The size of the game canvas.
	/// @param difficulty The difficulty setting for the game.
	/// @returns A new movement component for a character actor.
	CreateMovementComponent(
		spawnPosition: { x: number, y: number },
		canvasSize: { width: number, height: number },
		difficulty: EDifficulty
	): IMovementComponent;

	/// Gets the damage a character mapping should deal.
	/// @param characterMapping The character mapping to get the damage for.
	/// @param difficulty The difficulty setting for the game.
	/// @returns The amount of damage the character mapping will deal.
	GetDamage(
		characterMapping: ICharacterMapping,
		difficulty: EDifficulty
	): number;

	/// Gets the number of points a character mapping is worth.
	/// @param characterMapping The character mapping to get the points for.
	/// @param difficulty The difficulty setting for the game.
	/// @returns The number of points the character mapping is worth.
	GetPoints(
		characterMapping: ICharacterMapping,
		difficulty: EDifficulty
	): number;

	/// Gets the spawn timer to use for the game.
	/// @param difficulty The difficulty to get the spawn timer for.
	/// @returns The spawn timer to use for the game.
	GetSpawnTimer(difficulty: EDifficulty): ISpawnTimer;

	/// Gets the number of starting lives for the game.
	/// @param difficulty The difficulty to get the number of starting lives for.
	/// @returns The number of starting lives for the game.
	GetStartingLives(difficulty: EDifficulty): number;
}
