/// Interface for classes that determine where a character actor is spawned.
export interface ISpawner
{
	/// Gets the next spawn position for a character actor.
	/// @returns The next spawn position for a character actor.
	GetNextSpawnPosition(): { x: number, y: number };
}
