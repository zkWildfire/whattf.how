import ICache from "./Caches/Cache";
import ICacheLine from "./CacheLines/CacheLine";
import ICacheLineAllocator from "./CacheLines/CacheLineAllocator";
import IMemory from "./Memory/Memory";
import ISimulator from "./Simulator";
import OnCacheLineEvictedEventArgs from "./Events/OnCacheLineEvictedEventArgs";
import OnCacheLineLoadedEventArgs from "./Events/OnCacheLineLoadedEventArgs";
import OnMemoryAccessedEventArgs from "./Events/OnMemoryAccessedEventArgs";
import { EventDispatcher, IEvent } from "ste-events";
import IMemoryValidator from "./Validators/MemoryValidator";

/// Simulator used for the matrix transpose demo.
export default class TransposeSimulator implements ISimulator
{
	/// Field backing the `OnCacheLineLoaded` event.
	private readonly _onCacheLineLoaded =
		new EventDispatcher<ISimulator, OnCacheLineLoadedEventArgs>();

	/// Field backing the `OnCacheLineEvicted` event.
	private readonly _onCacheLineEvicted =
		new EventDispatcher<ISimulator, OnCacheLineEvictedEventArgs>();

	/// Field backing the `OnMemoryAccessed` event.
	private readonly _onMemoryAccessed =
		new EventDispatcher<ISimulator, OnMemoryAccessedEventArgs>();

	/// Memory instance used by the simulator.
	private readonly _memory: IMemory;

	/// Cache instance used by the simulator.
	private readonly _cache: ICache;

	/// Cache line allocator instance used by the simulator.
	private readonly _cacheLineAllocator: ICacheLineAllocator;

	/// Validator to use to verify the final memory state.
	private readonly _memoryValidator: IMemoryValidator;

	/// Event raised when a new cache line is loaded into the cache.
	get OnCacheLineLoaded(): IEvent<ISimulator, OnCacheLineLoadedEventArgs>
	{
		return this._onCacheLineLoaded.asEvent();
	}

	/// Event raised when a cache line is evicted from the cache.
	get OnCacheLineEvicted(): IEvent<ISimulator, OnCacheLineEvictedEventArgs>
	{
		return this._onCacheLineEvicted.asEvent();
	}

	/// Event raised when a memory location is accessed.
	/// This event will be raised *after* any cache events caused by the memory
	///   access have been raised.
	get OnMemoryAccessed(): IEvent<ISimulator, OnMemoryAccessedEventArgs>
	{
		return this._onMemoryAccessed.asEvent();
	}

	/// Initializes the simulator.
	/// @param memory Memory instance to use for the simulation.
	/// @param cache Cache instance to use for the simulation.
	/// @param cacheLineAllocator Cache line allocator instance to use for the
	///   simulation.
	/// @param memoryValidator Validator to use to verify the final memory state.
	constructor(
		memory: IMemory,
		cache: ICache,
		cacheLineAllocator: ICacheLineAllocator,
		memoryValidator: IMemoryValidator)
	{
		this._memory = memory;
		this._cache = cache;
		this._cacheLineAllocator = cacheLineAllocator;
		this._memoryValidator = memoryValidator;
	}

	/// Reads a value from memory.
	/// @param index Index of the value to read from memory.
	/// @throws RangeError Thrown if the given index is out of range.
	/// @returns The value at the given index.
	public read(index: number): number
	{
		return this.getCacheLine(index).read(index);
	}

	/// Writes a value to memory.
	/// @param index Index of the value to write to memory.
	/// @param value Value to write to memory.
	/// @throws RangeError Thrown if the given index is out of range.
	public write(index: number, value: number): void
	{
		this.getCacheLine(index).write(index, value);
	}

	/// Checks if the simulator memory is in the expected final state.
	/// This method is called after the simulation has finished running and is
	///   used to verify that the matrix transpose operation completed
	///   successfully. If any values in memory are incorrect, error messages
	///   should be generated that can be displayed to inform the user of what
	///   issues were detected.
	/// @returns An array of error messages describing any issues detected with
	///   the simulator memory, or an empty array if no issues were detected.
	public validateMemory(): string[]
	{
		return this._memoryValidator.validateMemory(this._memory);
	}

	/// Gets the cache line at the given index, loading it if necessary.
	/// @param index Memory index to get the cache line for. A memory access
	///   will be logged for this location.
	/// @returns The cache line at the given index.
	private getCacheLine(index: number): ICacheLine
	{
		// Check if the index is present with the cache
		if (this._cache.isPresent(index))
		{
			const cacheLine = this._cache.getCacheLine(index);
			this._onMemoryAccessed.dispatch(
				this,
				{
					index: index,
					isHit: true
				}
			);
			return cacheLine;
		}

		// The index is not present in the cache
		// Load the cache line from main memory
		const cacheLine = this._cacheLineAllocator.allocate(index);
		const result = this._cache.loadCacheLine(cacheLine);

		// Broadcast events as necessary
		if (result.cacheLineEvicted)
		{
			this._onCacheLineEvicted.dispatch(
				this,
				{
					index: result.index
				}
			);
		}
		this._onCacheLineLoaded.dispatch(
			this,
			{
				index: result.index
			}
		);
		this._onMemoryAccessed.dispatch(
			this,
			{
				index: index,
				isHit: false
			}
		);

		return cacheLine;
	}
}
