---
layout: post
title: "Matrix Cache Simulator Design"
tags: demos design simulations
category: matrix-cache-simulator
---
Interested in how the matrix cache simulator demo was implemented? This post
gives a high level overview of the simulator's design and how it works. You
can also view the source code for the demo on GitHub in the
[`matrix-cache-sim`](https://github.com/zkWildfire/whattf.how/tree/master/assets/scripts/matrix-cache-sim)
folder.

The matrix cache simulator consists of three primary groups of components,
which are loosely modeled after the model-view-controller pattern. The
simulation components are responsible for simulating the behavior of the cache
and for emitting events that are used by the visualization components. The
visualization components are responsible for displaying the simulation results
and handle displaying the simulation over a period of time. Lastly, the
algorithm components are used to allow a matrix transpose algorithm to run
using the simulation components instead of real memory.

The simulation components are relatively straight forward since they mirror
real hardware. The main class within this set of components is the `ICache`
interface, which simulates the behavior of a processor cache and emits events
when the cache is accessed.

{% plantuml %}
title Simulation Components

interface IMemory {
    Keeps track of all memory used by the app.
}

interface ICache {
    Simulates the behavior of a processor cache.
}

interface ICacheLine {
    Simulates the behavior of a cache line.
}

interface IEvictionPolicy {
    Determines which cache line to evict when the cache is full.
    --
    Implementations of this interface simulate eviction policies such as least
    recently used, round robin, etc.
}

interface IPlacementPolicy {
    Determines which locations a cache line may be placed at.
    --
    This simulates the associativity of the cache.
}

IMemory "1" .. "1" ICache
ICache "1" *-- "n" ICacheLine
ICache "1" *--- "1" IEvictionPolicy
ICache "1" *-- "1" IPlacementPolicy

{% endplantuml %}

The next set of components is the visualization components. These components
are responsible for recording events emitted by the simulation components and
recording them to a buffer. The visualization components then allow the events
to be played back over a period of time to show the simulation.

{% plantuml %}
title Visualization Components

interface IVisualization {
    Records events emitted by the simulation components and plays them back.
}

interface IEventsBuffer {
    Buffer that stores events emitted by the simulation components.
}

interface IPlaybackComponent {
    Component that emits events from the buffer over time.
}

interface IVisualizationController {
    Component that updates page state in response to emitted events.
}

IVisualization "1" *-- "1" IEventsBuffer
IVisualization "1" *--- "1" IPlaybackComponent
IVisualization "1" *-- "1" IVisualizationController

{% endplantuml %}

All components are hidden behind interfaces. This is partially because some
components may be swapped out at runtime for different implementations, but is
also heavily because this greatly increases the testability of the
implementation. This design is how I typically write C# and C++ code, but is
less necessary with TypeScript and JavaScript due to being dynamic languages.
