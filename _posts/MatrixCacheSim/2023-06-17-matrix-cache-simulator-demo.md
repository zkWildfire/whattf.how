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

> This demo is still **heavily** a work in progress! Currently, the only
> eviction algorithm supported is LRU, and the only transpose algorithm is
> the naive algorithm. The other options available to be selected will be
> implemented soon along with additional playback controls for the animation!
