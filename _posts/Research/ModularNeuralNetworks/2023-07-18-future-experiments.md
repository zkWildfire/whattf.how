---
layout: post
title: "Future Modular Neural Network Experiments"
tags: research machine-learning
category: modular-neural-networks
---
Several facets of the design proposed for this research project could be revised
and/or expanded in future projects, assuming the results from this project are
promising. These changes were intentionally omitted from this project to avoid
unnecessary complexity when simply trying to determine the feasibility of the
proposed design; however, these changes could have significant benefits for
future designs based on the research prototype.

## Disclaimer
All ideas discussed here are purely speculative and have not been explored in
detail. It is entirely possible that upon more thorough investigation, some of
these ideas would not be feasible or would not provide any benefits. However,
these ideas are worth mentioning as even if they themselves are not feasible,
they may inspire other ideas that are feasible and/or beneficial.

## Increased Depth
The design used for this project calls for three layers, which are referred to
in the [design post]({% post_url Research/ModularNeuralNetworks/2023-07-09-initial-design %})
as the input layer, the decision layer, and the action layer. However, there
could be significant benefits to supporting multiple layers in place of each
singular layer in the prototype design. Allowing for multiple instances of the
same logical layer type would likely allow for improved agent performance
similar to how deep neural networks outperform shallow neural networks.

For example, consider the input layer. The main benefit of allowing for multiple
input layers is that later input layers would be able to read the output of the
previous layer, which would have added additional contextual data to the raw
input data. This extra contextual data could then be expanded on again by the
next layer, thus producing a more complex and useful representation of the
input data for the decision layers.

## Complex Scheduling
It's possible that for more complex agents with higher layer counts, some layers
would make use of data that is not needed by other layers. As a result, complex
agents could benefit from different scheduling logic, which could allow a layer
to be scheduled to run on the GPU as soon as all its input data is available.
Depending on the equivalent sequential design, improved scheduling could allow
for faster training and/or inference times.

Something that could be an interesting improvement would be for classical logic
in the agent to periodically analyze the weights for network modules. The idea
here would be that if the modules can be divided into separate sets of modules
where all modules in one set use some specific discrete subset of the input data
(where "discrete" is in reference to modules of other sets), then the layer
could be split into two layers or more layers that can be scheduled separately.
This would likely require defining some sort of threshold, e.g. if a network
module assigns a low but non-zero weight to a specific input, then that input
is considered to be not used by the module.

Complex scheduling may have benefits regardless of whether layers can be
auto-split since agent modules are not required to be network-based modules due
to the proposed design of modular neural networks. As a result, it may be worth
having complex scheduling logic to improve the efficiency of processing
classical modules, especially if some classical modules are computationally
expensive or can be run in parallel with each other.

## Agent Synthesized Layers
The stretch goal for this research project is to allow agents to synthesize
new modules for the modular neural network design, but the end goal for modular
neural networks would be to allow agents to synthesize entirely layers of
modules themselves. This would build upon the [increased depth](#increased-depth)
change by allowing agents to generate new layers to deepen the network on their
own. Of course, with the current state of machine learning research, how this
could be done is entirely unknown. However, there is a good chance that this is
something that would need to be solved before truly multi-domain agents could be
created.

## Multi-Dimensional Output Vectors
Each layer in the modular neural network design is currently designed to produce
a single dimensional output vector for the next layer to consume. While
unlikely, there may be benefits to switching to multi-dimensional tensors for
the output of each layer instead of single dimensional vectors. For example,
tensors could be processed more efficiently than single dimensional vectors by
hardware, so using tensors might allow for faster training and inference times.

This is an area where the potential gain from such a switch is extremely unclear
and it's entirely possible there's no benefit at all. However, it's something
that would be relatively easy to experiment with, so it's worth mentioning as a
potential change for future experiments.

## What's Next?
This post wraps up the set of posts that discuss the concept and design of the
modular neural network research project. Subsequent posts are expected to touch
on lower level implementation details and results of experiments run using the
prototype agents. These posts are likely to be less frequent as it will take
time to implement and test the new code, and this research is taking place in
off hours after my day job.
