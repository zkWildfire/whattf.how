/// Identifies the speed at which the simulation should play at.
/// Each enum value is mapped to the number of milliseconds to wait between each
///   step when set to that speed.
export enum ESimulationSpeed
{
	/// Slow simulation speed.
	Slow = 200,

	/// Normal simulation speed.
	Normal = 100,

	/// Fast simulation speed.
	Fast = 50,

	/// Fastest possible simulation speed.
	Maximum = 0
}
