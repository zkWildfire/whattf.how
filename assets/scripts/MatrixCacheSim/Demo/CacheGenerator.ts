/// Interface for classes that generate the initial DOM elements for the cache.
/// Cache generator implementations are responsible for generating the initial
///   DOM elements that make up the cache line visualization.
export default interface ICacheGenerator
{
	/// Called to generate the DOM elements for the cache.
	/// This should clear existing elements if any exist and reset the cache
	///   line visualization to its initial state.
	/// @param lineCount Number of cache lines in the cache.
	generateCacheLines(lineCount: number): void;
}
