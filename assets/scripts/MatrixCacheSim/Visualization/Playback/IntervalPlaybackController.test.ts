import OnCacheLineEvictedEventArgs from "../../Simulation/Events/OnCacheLineEvictedEventArgs";
import OnCacheLineLoadedEventArgs from "../../Simulation/Events/OnCacheLineLoadedEventArgs";
import OnMemoryAccessedEventArgs from "../../Simulation/Events/OnMemoryAccessedEventArgs";
import ArrayEventBuffer from "../Buffers/ArrayEventBuffer";
import IntervalPlaybackController from "./IntervalPlaybackController";

test("Properties match ctor args", () =>
{
	const INTERVAL = 100;
	const eventBuffer = new ArrayEventBuffer();
	const controller = new IntervalPlaybackController(eventBuffer, INTERVAL);

	expect(controller.interval).toBe(INTERVAL);
});

test("Constructing controller with negative interval throws", () =>
{
	const INTERVAL = -1;
	const eventBuffer = new ArrayEventBuffer();

	expect(() => new IntervalPlaybackController(eventBuffer, INTERVAL))
		.toThrow(RangeError);
});

test("Change interval to valid value", () =>
{
	const INTERVAL = 100;
	const eventBuffer = new ArrayEventBuffer();
	const controller = new IntervalPlaybackController(eventBuffer, INTERVAL);
	const NEW_INTERVAL = 200;

	controller.interval = NEW_INTERVAL;
	expect(controller.interval).toBe(NEW_INTERVAL);
});

test("Change interval to invalid value throws", () =>
{
	const INTERVAL = 100;
	const eventBuffer = new ArrayEventBuffer();
	const controller = new IntervalPlaybackController(eventBuffer, INTERVAL);

	expect(() => controller.interval = -1).toThrow(RangeError);
});

test("Visualization start and stop event raised", async () =>
{
	const eventBuffer = new ArrayEventBuffer();
	const controller = new IntervalPlaybackController(eventBuffer, 100);

	// Bind to controller events
	let startEventCount = 0;
	let stopEventCount = 0;

	controller.OnVisualizationStarted.subscribe(() => startEventCount++);
	controller.OnVisualizationFinished.subscribe(() => stopEventCount++);

	controller.startVisualization();
	await controller.waitForSimulation();
	controller.stopVisualization();

	expect(startEventCount).toBe(1);
	expect(stopEventCount).toBe(1);
});

test("Run visualization with single event", async () =>
{
	const INTERVAL = 0;
	const eventBuffer = new ArrayEventBuffer();
	const controller = new IntervalPlaybackController(eventBuffer, INTERVAL);

	// Generate events for the test
	const INDEX = 1;
	eventBuffer.onCacheLineLoaded(new OnCacheLineLoadedEventArgs(INDEX, 0, 0));

	// Bind to controller events
	let eventEmitted = false;
	let simulationEvent: OnCacheLineLoadedEventArgs | null = null;
	controller.OnCacheLineLoaded.subscribe((eventArgs) =>
	{
		eventEmitted = true;
		simulationEvent = eventArgs;
	});

	// Run the test
	controller.startVisualization();
	await controller.waitForSimulation();

	// Verify the results
	expect(eventEmitted).toBe(true);
	expect(simulationEvent).not.toBeNull();
	expect(simulationEvent!.cacheIndex).toBe(INDEX);
});

test("Run visualization with multiple events", async () =>
{
	const INTERVAL = 0;
	const eventBuffer = new ArrayEventBuffer();
	const controller = new IntervalPlaybackController(eventBuffer, INTERVAL);

	// Generate events for the test
	const cacheLineLoadedEvent = new OnCacheLineLoadedEventArgs(1, 0, 0);
	const cacheLineEvictedEvent = new OnCacheLineEvictedEventArgs(2, 0, 0);
	const memoryAccessedEvent = new OnMemoryAccessedEventArgs(3, false);
	eventBuffer.onCacheLineLoaded(cacheLineLoadedEvent);
	eventBuffer.onCacheLineEvicted(cacheLineEvictedEvent);
	eventBuffer.onMemoryAccessed(memoryAccessedEvent);

	// Bind to controller events
	let eventCount = 0;
	let loadedEvent: OnCacheLineLoadedEventArgs | null = null;
	let evictedEvent: OnCacheLineEvictedEventArgs | null = null;
	let accessedEvent: OnMemoryAccessedEventArgs | null = null;
	controller.OnCacheLineLoaded.subscribe((eventArgs) =>
	{
		eventCount++;
		loadedEvent = eventArgs;
	});
	controller.OnCacheLineEvicted.subscribe((eventArgs) =>
	{
		eventCount++;
		evictedEvent = eventArgs;
	});
	controller.OnMemoryAccessed.subscribe((eventArgs) =>
	{
		eventCount++;
		accessedEvent = eventArgs;
	});

	// Run the test
	controller.startVisualization();
	await controller.waitForSimulation();

	// Verify the results
	expect(eventCount).toBe(3);
	expect(loadedEvent).toBe(cacheLineLoadedEvent);
	expect(evictedEvent).toBe(cacheLineEvictedEvent);
	expect(accessedEvent).toBe(memoryAccessedEvent);
});

test("Visualization speed matches expected", async () =>
{
	const INTERVAL = 10;
	const COUNT = 10;
	const eventBuffer = new ArrayEventBuffer();
	const controller = new IntervalPlaybackController(eventBuffer, INTERVAL);

	// Generate events for the test
	for (let i = 0; i < COUNT; i++)
	{
		eventBuffer.onCacheLineLoaded(new OnCacheLineLoadedEventArgs(i, 0, 0));
	}

	// Track how long the test takes to execute
	const startTime = Date.now();

	// Run the test
	controller.startVisualization();
	await controller.waitForSimulation();

	// Verify the results
	const endTime = Date.now();
	const duration = endTime - startTime;

	// The test should take at least INTERVAL * COUNT milliseconds to execute
	expect(duration).toBeGreaterThanOrEqual(INTERVAL * COUNT);
});

test("Start already running visualization throws", () =>
{
	const eventBuffer = new ArrayEventBuffer();
	const controller = new IntervalPlaybackController(eventBuffer, 100);

	// Generate some events so the test doesn't finish immediately
	eventBuffer.onCacheLineLoaded(new OnCacheLineLoadedEventArgs(1, 0, 0));
	eventBuffer.onCacheLineLoaded(new OnCacheLineLoadedEventArgs(2, 0, 0));

	controller.startVisualization();
	expect(() => controller.startVisualization()).toThrow(Error);
});

test("Stop visualization early", async () =>
{
	const INTERVAL = 100;
	const eventBuffer = new ArrayEventBuffer();
	const controller = new IntervalPlaybackController(eventBuffer, INTERVAL);

	// Generate some events so the test doesn't finish immediately
	eventBuffer.onCacheLineLoaded(new OnCacheLineLoadedEventArgs(1, 0, 0));
	eventBuffer.onCacheLineLoaded(new OnCacheLineLoadedEventArgs(2, 0, 0));

	// Run the test
	let startTime = Date.now();
	controller.startVisualization();
	await controller.stopVisualization();
	let endTime = Date.now();

	// Make sure the test finished quickly
	// Note that since the controller doesn't support aborting within the
	//   interval, the wait time may be as long as the interval
	let duration = endTime - startTime;
	expect(duration).toBeLessThan(INTERVAL * 1.2);
});

test("Stop visualization after all events emitted", async () =>
{
	const INTERVAL = 10;
	const eventBuffer = new ArrayEventBuffer();
	const controller = new IntervalPlaybackController(eventBuffer, INTERVAL);

	// Generate some events so the test doesn't finish immediately
	eventBuffer.onCacheLineLoaded(new OnCacheLineLoadedEventArgs(1, 0, 0));
	eventBuffer.onCacheLineLoaded(new OnCacheLineLoadedEventArgs(2, 0, 0));

	// Run the test
	controller.startVisualization();
	await controller.waitForSimulation();

	// This should not throw and should return immediately
	let startTime = Date.now();
	await controller.stopVisualization();
	let endTime = Date.now();
	let duration = endTime - startTime;

	expect(duration).toBeLessThan(INTERVAL);
});

test("Wait for simulation before starting throws", async () =>
{
	const INTERVAL = 100;
	const eventBuffer = new ArrayEventBuffer();
	const controller = new IntervalPlaybackController(eventBuffer, INTERVAL);

	expect(() => controller.waitForSimulation()).toThrow(Error);
});

test("Stop visualization before starting returns immediately", async () =>
{
	const INTERVAL = 100;
	const eventBuffer = new ArrayEventBuffer();
	const controller = new IntervalPlaybackController(eventBuffer, INTERVAL);

	let startTime = Date.now();
	await controller.stopVisualization();
	let endTime = Date.now();
	let duration = endTime - startTime;

	expect(duration).toBeLessThan(INTERVAL);
});
