---
layout: matrix-cache-sim
title: "Matrix Cache Simulator Demo"
tags: demos simulations
category: matrix-cache-simulator
---
This is the matrix cache simulator demo. It visualizes how a processor's cache
is used when running a matrix transpose algorithm and allows you to try your
own matrix transpose algorithms to see how they affect cache usage.

Two algorithms are provided. The first algorithm is a naive matrix transpose
algorithm that performs the transpose operation without taking into account
the processor cache at all. The second algorithm is a more cache-friendly (but
still not optimal) matrix transpose algorithm that improves significantly on
cache usage. Try out the simulator on the two algorithms, then see if you can
figure out how to improve the cache usage even more!

> This demo is still **heavily** a work in progress! Support for custom
> transpose algorithms is coming soon, along with more options for playback.
> Additionally, in its current state, simulations cannot be stopped in the
> middle of playback, so a page refresh is required to restart an in-progress
> simulation.
