/// Interface for classes that manage and update a model for a simulation.
/// Simulation components are responsible for managing the state of a
///   simulation, updating the state of the simulation as each simulation
///   tick occurs, and notifying any listeners of simulation state changes.
/// @tparam TEventHub Type that defines the various events that this component
///   can emit.
export default interface ISimulationComponent<TEventHub>
{
	/// Event hub for the simulation component.
	/// The event hub defines event handlers for each event that the simulation
	///   component may emit during the course of the simulation. When a modular
	///   simulator is constructed, the simulator will fetch the simulation
	///   component's event hub and pass it to the recorder component so that
	///   the recorder component can listen for simulation state changes.
	get EventHub(): TEventHub;

	/// Starts the simulation and runs until completion.
	/// This will generate events for each simulation tick and will not return
	///   until the simulation has completed.
	Run(): void;
}
