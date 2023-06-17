import OnCacheLineEvictedEventArgs from "../../Simulation/Events/OnCacheLineEvictedEventArgs";
import OnCacheLineLoadedEventArgs from "../../Simulation/Events/OnCacheLineLoadedEventArgs";
import OnMemoryAccessedEventArgs from "../../Simulation/Events/OnMemoryAccessedEventArgs";
import DomMatrixRenderer from "./DomMatrixRenderer";

class DomSimulationRendererTests
{
	public readonly changeMatrixElement = jest.fn();
	public readonly renderer: DomMatrixRenderer;

	// Indices of method arguments
	public readonly CHANGE_MATRIX_ELEMENT_X = 0;
	public readonly CHANGE_MATRIX_ELEMENT_Y = 1;
	public readonly CHANGE_MATRIX_ELEMENT_VALUE = 2;
	public readonly CHANGE_MATRIX_ELEMENT_COLOR = 3;
	public readonly CHANGE_MATRIX_ELEMENT_TEXT_COLOR = 4;

	public readonly GET_MATRIX_ELEMENT_VALUE_X = 0;
	public readonly GET_MATRIX_ELEMENT_VALUE_Y = 1;

	// "Colors" used by tests
	public readonly LOADED_COLOR = "loaded color";
	public readonly LOADED_TEXT_COLOR = "loaded text color";
	public readonly UNLOADED_COLOR = "unloaded color";
	public readonly UNLOADED_TEXT_COLOR = "unloaded text color";
	public readonly ACCESSED_COLOR = "accessed color";
	public readonly ACCESSED_TEXT_COLOR = "accessed text color";
	public readonly MATRIX_X = 2;
	public readonly MATRIX_Y = 2;

	constructor()
	{
		this.renderer = new DomMatrixRenderer(
			this.changeMatrixElement,
			this.LOADED_COLOR,
			this.LOADED_TEXT_COLOR,
			this.UNLOADED_COLOR,
			this.UNLOADED_TEXT_COLOR,
			this.ACCESSED_COLOR,
			this.ACCESSED_TEXT_COLOR,
			this.MATRIX_X,
			this.MATRIX_Y
		);
	}

	// Helper method used to get the "color" argument to each change matrix
	//   element call
	public getChangeMatrixElementColor(index: number): string
	{
		return this.changeMatrixElement.mock.calls[index][
			this.CHANGE_MATRIX_ELEMENT_COLOR
		];
	}

	// Helper method used to get the "textColor" argument to each change matrix
	//   element call
	public getChangeMatrixElementTextColor(index: number): string
	{
		return this.changeMatrixElement.mock.calls[index][
			this.CHANGE_MATRIX_ELEMENT_TEXT_COLOR
		];
	}
}

test("Matrix cleared when simulation starts", () =>
{
	const test = new DomSimulationRendererTests();
	const renderer = test.renderer;

	renderer.onSimulationStarted();
	expect(test.changeMatrixElement.mock.calls.length).toBe(
		test.MATRIX_X * test.MATRIX_Y
	);

	// All calls to the change matrix element function should have changed the
	//   matrix elements to the unloaded colors
	for (let i = 0; i < test.changeMatrixElement.mock.calls.length; i++)
	{
		expect(test.getChangeMatrixElementColor(i)).toBe(
			test.UNLOADED_COLOR
		);
		expect(test.getChangeMatrixElementTextColor(i)).toBe(
			test.UNLOADED_TEXT_COLOR
		);
	}
});

test("Matrix updated when cache line loaded", () =>
{
	const test = new DomSimulationRendererTests();
	const renderer = test.renderer;
	renderer.onSimulationStarted();

	// Record the number of calls to the change matrix element function before
	//   the cache line loaded event is fired
	// This ensures that when evaluating the calls to the change matrix element
	//   function later, the test only checks the calls made as a result of the
	//   cache line loaded event
	const callsBeforeCacheLineLoaded =
		test.changeMatrixElement.mock.calls.length;

	const CACHE_INDEX = 0;
	const MEMORY_INDEX = 0;
	const LINE_SIZE = 4;

	renderer.onCacheLineLoaded(new OnCacheLineLoadedEventArgs(
		CACHE_INDEX,
		MEMORY_INDEX,
		LINE_SIZE
	));

	// The number of calls to the change matrix element function should have
	//   increased by the size of the cache line
	expect(test.changeMatrixElement.mock.calls.length).toBe(
		callsBeforeCacheLineLoaded + LINE_SIZE
	);

	// Each call to the change matrix element function should have changed the
	//   matrix elements to the loaded colors
	for (let i = callsBeforeCacheLineLoaded;
		i < test.changeMatrixElement.mock.calls.length;
		i++)
	{
		expect(test.getChangeMatrixElementColor(i)).toBe(
			test.LOADED_COLOR
		);
		expect(test.getChangeMatrixElementTextColor(i)).toBe(
			test.LOADED_TEXT_COLOR
		);
	}
});

test("Matrix updated when cache line evicted", () =>
{
	const test = new DomSimulationRendererTests();
	const renderer = test.renderer;
	renderer.onSimulationStarted();

	// Load a cache line, then unload it
	const CACHE_INDEX = 0;
	const MEMORY_INDEX = 0;
	const LINE_SIZE = 4;
	renderer.onCacheLineLoaded(new OnCacheLineLoadedEventArgs(
		CACHE_INDEX,
		MEMORY_INDEX,
		LINE_SIZE
	));

	// Record the number of calls to the mocked methods before the cache line
	//   evicted event is fired. This is done so that when evaluating the calls
	//   to the mocked methods later, the test only checks the calls made as a
	//   result of the cache line evicted event
	const callsBeforeCacheLineEvicted =
		test.changeMatrixElement.mock.calls.length;

	// Remove the cache line
	renderer.onCacheLineEvicted(new OnCacheLineEvictedEventArgs(
		CACHE_INDEX,
		MEMORY_INDEX,
		LINE_SIZE
	));

	// The number of calls to the change matrix element function should have
	//   increased by the size of the cache line
	expect(test.changeMatrixElement.mock.calls.length).toBe(
		callsBeforeCacheLineEvicted + LINE_SIZE
	);

	// Each call to the change matrix element function should have changed the
	//   matrix elements to the unloaded colors
	for (let i = callsBeforeCacheLineEvicted;
		i < test.changeMatrixElement.mock.calls.length;
		i++)
	{
		expect(test.getChangeMatrixElementColor(i)).toBe(
			test.UNLOADED_COLOR
		);
		expect(test.getChangeMatrixElementTextColor(i)).toBe(
			test.UNLOADED_TEXT_COLOR
		);
	}
});

test("Matrix updated when memory accessed", () =>
{
	const test = new DomSimulationRendererTests();
	const renderer = test.renderer;
	renderer.onSimulationStarted();

	// Load a cache line first to ensure that the element that gets "accessed"
	//   is a loaded element
	const CACHE_INDEX = 0;
	const MEMORY_INDEX = 0;
	const LINE_SIZE = 4;
	renderer.onCacheLineLoaded(new OnCacheLineLoadedEventArgs(
		CACHE_INDEX,
		MEMORY_INDEX,
		LINE_SIZE
	));

	// Record the number of calls to the mocked methods before the memory
	//   accessed event is fired. This is done so that when evaluating the calls
	//   to the mocked methods later, the test only checks the calls made as a
	//   result of the memory accessed event
	const callsBeforeMemoryAccessed =
		test.changeMatrixElement.mock.calls.length;

	// Access the memory location
	const X = 1;
	const Y = 1;
	const INDEX = X + Y * test.MATRIX_X;
	renderer.onMemoryAccessed(new OnMemoryAccessedEventArgs(
		INDEX,
		true,
		1
	));

	// Verify that the change matrix element function was called to change
	//   the colors of the accessed element
	expect(test.changeMatrixElement.mock.calls.length).toBe(
		callsBeforeMemoryAccessed + 1
	);
	expect(test.getChangeMatrixElementColor(callsBeforeMemoryAccessed)).toBe(
		test.ACCESSED_COLOR
	);
	expect(test.getChangeMatrixElementTextColor(callsBeforeMemoryAccessed)).toBe(
		test.ACCESSED_TEXT_COLOR
	);
});

test("Memory access not cleared when new cache line loaded", () =>
{
	const test = new DomSimulationRendererTests();
	const renderer = test.renderer;
	renderer.onSimulationStarted();

	// Load a cache line first to ensure that the element that gets "accessed"
	//   is a loaded element
	const CACHE_INDEX = 0;
	const MEMORY_INDEX = 0;
	const LINE_SIZE = 4;
	renderer.onCacheLineLoaded(new OnCacheLineLoadedEventArgs(
		CACHE_INDEX,
		MEMORY_INDEX,
		LINE_SIZE
	));

	// Access an element in the cache line
	const X = 1;
	const Y = 1;
	const INDEX = X + Y * test.MATRIX_X;
	renderer.onMemoryAccessed(new OnMemoryAccessedEventArgs(
		INDEX,
		true,
		1
	));

	// Record the number of calls to the mocked methods before the second cache
	//   line loaded event is fired. This is done so that when evaluating the
	//   calls to the mocked methods later, the test only checks the calls made
	//   as a result of the second cache line loaded event
	const callsBeforeSecondCacheLineLoaded =
		test.changeMatrixElement.mock.calls.length;

	// Load a second cache line
	const SECOND_CACHE_INDEX = 1;
	const SECOND_MEMORY_INDEX = 4;
	renderer.onCacheLineLoaded(new OnCacheLineLoadedEventArgs(
		SECOND_CACHE_INDEX,
		SECOND_MEMORY_INDEX,
		LINE_SIZE
	));

	// Make sure that there were calls to the change matrix element function
	expect(test.changeMatrixElement.mock.calls.length).toBeGreaterThan(
		callsBeforeSecondCacheLineLoaded
	);

	// Make sure that no calls were made that changed the color of the accessed
	//   element back to the loaded color
	let accessedElementCallIndex = -1;
	for (let i = callsBeforeSecondCacheLineLoaded;
		i < test.changeMatrixElement.mock.calls.length;
		i++)
	{
		const call = test.changeMatrixElement.mock.calls[i];
		const x = call[test.CHANGE_MATRIX_ELEMENT_X];
		const y = call[test.CHANGE_MATRIX_ELEMENT_Y];

		if (x === X && y === Y)
		{
			accessedElementCallIndex = i;
			break;
		}
	}

	// Make sure a call was not made for the accessed element
	expect(accessedElementCallIndex).toBe(-1);
});

test("Memory access not cleared when cache line evicted if not in evicted cache line", () =>
{
	const test = new DomSimulationRendererTests();
	const renderer = test.renderer;
	renderer.onSimulationStarted();

	// Load multiple cache lines
	const CACHE_INDEX = 0;
	const MEMORY_INDEX = 0;
	const LINE_SIZE = 4;
	renderer.onCacheLineLoaded(new OnCacheLineLoadedEventArgs(
		CACHE_INDEX,
		MEMORY_INDEX,
		LINE_SIZE
	));
	renderer.onCacheLineLoaded(new OnCacheLineLoadedEventArgs(
		CACHE_INDEX + 1,
		MEMORY_INDEX + LINE_SIZE,
		LINE_SIZE
	));

	// Access an element in the first cache line
	const X = 1;
	const Y = 1;
	const INDEX = X + Y * test.MATRIX_X;
	renderer.onMemoryAccessed(new OnMemoryAccessedEventArgs(
		INDEX,
		true,
		1
	));

	// Record the number of calls to the mocked methods before the second cache
	//   line loaded event is fired. This is done so that when evaluating the
	//   calls to the mocked methods later, the test only checks the calls made
	//   as a result of the cache line evicted event
	const callsBeforeCacheLineEvicted =
		test.changeMatrixElement.mock.calls.length;

	// Remove the second cache line
	renderer.onCacheLineEvicted(new OnCacheLineEvictedEventArgs(
		CACHE_INDEX + 1,
		MEMORY_INDEX + LINE_SIZE,
		LINE_SIZE
	));

	// Make sure that calls were made to the change matrix element function
	expect(test.changeMatrixElement.mock.calls.length).toBeGreaterThan(
		callsBeforeCacheLineEvicted
	);

	// Make sure none of the calls correspond to the accessed element
	// This is because the accessed element is outside the cache line that was
	//   evicted, so it should remain unchanged
	let accessedElementCallIndex = -1;
	for (let i = callsBeforeCacheLineEvicted;
		i < test.changeMatrixElement.mock.calls.length;
		i++)
	{
		const call = test.changeMatrixElement.mock.calls[i];
		const x = call[test.CHANGE_MATRIX_ELEMENT_X];
		const y = call[test.CHANGE_MATRIX_ELEMENT_Y];

		// Note that two calls should have this x and y coordinate since the
		//   element should have been first changed to the loaded color, then
		//   to the unloaded color. The call that this test is interested in
		//   is the first call, which should be the call that changes the
		//   element back to the loaded color
		if (x === X && y === Y)
		{
			accessedElementCallIndex = i;
			break;
		}
	}

	// Make sure a call was not made for the accessed element
	expect(accessedElementCallIndex).toBe(-1);
});

test("Memory access cleared when cache line evicted if in evicted cache line", () =>
{
	const test = new DomSimulationRendererTests();
	const renderer = test.renderer;
	renderer.onSimulationStarted();

	// Load a cache line
	const CACHE_INDEX = 0;
	const MEMORY_INDEX = 0;
	const LINE_SIZE = 4;
	renderer.onCacheLineLoaded(new OnCacheLineLoadedEventArgs(
		CACHE_INDEX,
		MEMORY_INDEX,
		LINE_SIZE
	));

	// Access an element in the cache line
	const X = 1;
	const Y = 1;
	const INDEX = X + Y * test.MATRIX_X;
	renderer.onMemoryAccessed(new OnMemoryAccessedEventArgs(
		INDEX,
		true,
		1
	));

	// Record the number of calls to the mocked methods before the cache line
	//   evicted event is fired. This is done so that when evaluating the calls
	//   to the mocked methods later, the test only checks the calls made as a
	//   result of the cache line evicted event
	const callsBeforeCacheLineEvicted =
		test.changeMatrixElement.mock.calls.length;

	// Remove the cache line
	renderer.onCacheLineEvicted(new OnCacheLineEvictedEventArgs(
		CACHE_INDEX,
		MEMORY_INDEX,
		LINE_SIZE
	));

	// Make sure that calls were made to the change matrix element function
	expect(test.changeMatrixElement.mock.calls.length).toBeGreaterThan(
		callsBeforeCacheLineEvicted
	);

	// Make sure one of the calls was made for the accessed element
	let accessedElementCallIndex = -1;
	for (let i = callsBeforeCacheLineEvicted;
		i < test.changeMatrixElement.mock.calls.length;
		i++)
	{
		const call = test.changeMatrixElement.mock.calls[i];
		const x = call[test.CHANGE_MATRIX_ELEMENT_X];
		const y = call[test.CHANGE_MATRIX_ELEMENT_Y];

		// Note that two calls should have this x and y coordinate since the
		//   element should have been first changed to the loaded color, then
		//   to the unloaded color. The call that this test is interested in
		//   is the first call, which should be the call that changes the
		//   element back to the loaded color
		if (x === X && y === Y)
		{
			accessedElementCallIndex = i;
			break;
		}
	}

	// Make sure a call was not made for the accessed element
	expect(accessedElementCallIndex).not.toBe(-1);

	// The call that changes the accessed element should not be the last call
	//   since the accessed element should have been reset back to the loaded
	//   color, then reset again later to the unloaded color as a result of the
	//   cache line being evicted
	expect(accessedElementCallIndex).not.toBe(
		test.changeMatrixElement.mock.calls.length - 1
	);

	// Make sure that the accessed element was changed back to the loaded color
	const accessedElementCall = test.changeMatrixElement.mock.calls[
		accessedElementCallIndex
	];
	expect(accessedElementCall[test.CHANGE_MATRIX_ELEMENT_COLOR]).toBe(
		test.LOADED_COLOR
	);
	expect(accessedElementCall[test.CHANGE_MATRIX_ELEMENT_TEXT_COLOR]).toBe(
		test.LOADED_TEXT_COLOR
	);
});

test("Active element cleared when simulation finishes", () =>
{
	const test = new DomSimulationRendererTests();
	const renderer = test.renderer;
	renderer.onSimulationStarted();

	// Load a cache line and access an element
	const CACHE_INDEX = 0;
	const MEMORY_INDEX = 0;
	const LINE_SIZE = 4;
	renderer.onCacheLineLoaded(new OnCacheLineLoadedEventArgs(
		CACHE_INDEX,
		MEMORY_INDEX,
		LINE_SIZE
	));

	const X = 1;
	const Y = 1;
	const INDEX = X + Y * test.MATRIX_X;
	renderer.onMemoryAccessed(new OnMemoryAccessedEventArgs(
		INDEX,
		true,
		1
	));

	// Record the number of calls to the mocked methods before the simulation
	//   finished event is fired. This is done so that when evaluating the
	//   calls to the mocked methods later, the test only checks the calls made
	//   as a result of the simulation finished event
	const callsBeforeSimulationFinished =
		test.changeMatrixElement.mock.calls.length;

	// Make sure that finishing the simulation clears the active element
	renderer.onSimulationFinished();
	expect(test.changeMatrixElement.mock.calls.length).toBeGreaterThan(
		callsBeforeSimulationFinished
	);

	// Find the call corresponding to the accessed element
	let accessedElementCallIndex = -1;
	for (let i = callsBeforeSimulationFinished;
		i < test.changeMatrixElement.mock.calls.length;
		i++)
	{
		const call = test.changeMatrixElement.mock.calls[i];
		const x = call[test.CHANGE_MATRIX_ELEMENT_X];
		const y = call[test.CHANGE_MATRIX_ELEMENT_Y];

		// Note that two calls should have this x and y coordinate since the
		//   element should have been first changed to the loaded color, then
		//   to the unloaded color. The call that this test is interested in
		//   is the first call, which should be the call that changes the
		//   element back to the loaded color
		if (x === X && y === Y)
		{
			accessedElementCallIndex = i;
			break;
		}
	}

	// Make sure a call was made for the accessed element and that it changes
	//   the element back to the loaded color
	expect(accessedElementCallIndex).not.toBe(-1);

	const accessedElementCall = test.changeMatrixElement.mock.calls[
		accessedElementCallIndex
	];
	expect(accessedElementCall[test.CHANGE_MATRIX_ELEMENT_COLOR]).toBe(
		test.LOADED_COLOR
	);
	expect(accessedElementCall[test.CHANGE_MATRIX_ELEMENT_TEXT_COLOR]).toBe(
		test.LOADED_TEXT_COLOR
	);
});
