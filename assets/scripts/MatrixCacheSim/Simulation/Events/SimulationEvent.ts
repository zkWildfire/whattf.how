import ISimulationEventVisitor from "./SimulationEventVisitor";

/// Base interface for all simulation events types.
export default interface ISimulationEvent
{
	/// Accepts a visitor to visit the simulation event.
	/// @param visitor Simulation event visitor to accept.
	accept(visitor: ISimulationEventVisitor): void;
}
