import IMemory from "../Memory/Memory";

/// Interface for validating that all memory indices contain the expected value.
export default interface IMemoryValidator
{
	/// Checks if the simulator memory is in the expected final state.
	/// @returns An array of error messages describing any issues detected with
	///   the simulator memory, or an empty array if no issues were detected.
	validateMemory(memory: IMemory): string[];
}
