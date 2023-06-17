import ICacheGenerator from "./CacheGenerator";

/// Generator that generates the initial DOM elements for the cache.
export default class DemoCacheGenerator implements ICacheGenerator
{
	/// Function that clears the cache by removing all existing elements.
	private readonly _clearCacheElements: () => void;

	/// Function that adds a new row to the matrix.
	private readonly _addCacheLine: (y: number) => HTMLElement;

	/// Initializes the generator.
	/// @param clearCacheElements Function that clears the cache by removing all
	///   existing elements.
	/// @param addCacheLine Function that adds a new row to the matrix.
	///   This callback will be passed the row index and should return the row
	///   element that was created.
	constructor(
		clearCacheElements: () => void,
		addCacheLine: (y: number) => HTMLElement)
	{
		this._clearCacheElements = clearCacheElements;
		this._addCacheLine = addCacheLine;
	}

	/// Called to generate the DOM elements for the cache.
	/// This should clear existing elements if any exist and reset the cache
	///   line visualization to its initial state.
	/// @param lineCount Number of cache lines in the cache.
	public generateCacheLines(lineCount: number): void
	{
		this._clearCacheElements();

		// Add the cache lines
		for (let i = 0; i < lineCount; ++i)
		{
			this._addCacheLine(i);
		}
	}
}
