---
layout: post
title: "Designing a Modular Neural Network for Matrix Transposition"
tags: research machine-learning
category: modular-neural-networks
---
Prior to starting any research, it's important to have a clear goal in mind.
This post describes the design I have in mind for the modular neural network
that I plan on implementing as part of my research project, including describing
how the design could be adapted to use cases other than the matrix transposition
challenge. Also, while I have high hopes for this design, there is a high
probability that the final implementation for this project will deviate from
this design.

## Goals
The goals that I have for this design can be succinctly summarized with three
words: modularity, extensibility, and intelligibility.

**Modularity** is of course the primary goal of this project. After all, the
point of this research project is to explore how modular neural networks can be
implemented. The design to be implemented therefore must allow for the use of
discrete components that may be combined in different ways. These components
will be the basic building blocks of future modular networks, and it should be
possible to reuse components created for this network in future networks with
minimal changes.

Modularizing a network has numerous benefits, but it must also be possible to
easily extend a design to add new functionality. The **extensibility** of a
design is therefore another important goal. I also want to ensure that it's
possible to extend a network at runtime, without requiring the network to be
recompiled. Ideally, this would allow a network to synthesize its own new
components and attach them to the existing network. However, the ability to
do so is definitely out of scope for this project and would require its own
research project.

Lastly, the design should be **intelligible**. This comes partially for free
due to the modularity of the design, which means it's possible to inspect the
output of specific components in the network and understand what the output
means. Additionally, an intelligible design should also be easily testable since
a component can be expected to produce specific output or range of output for
specific types of input. This should make it possible to test each component in
isolation, which will allow classical components to be debugged more easily and
machine learning components to be trained more easily.

## The Plan
I plan on implementing the design I have in mind in various phases, which will
allow me transition agents from a purely classically implemented design to one
that uses more and more machine learning components. This is possible thanks to
the modular design that each agent will use, which allows me to replace
individual components with different implementations without having to change
the entire agent's implementation. This sort of incremental refactoring is a
major benefit of the modular design I'm proposing, since it allows specific
parts of an agent's implementation to use classical algorithms while other parts
use machine learning algorithms.

This mixing of classical and machine learning algorithms is another important
aspect of the modular design I'll be experimenting with. While machine learning
algorithms are extremely powerful, they also have some major drawbacks. For
one, machine learning algorithms require a lot of training time and data, which
isn't always feasible. As a result, if both a classical algorithm and a machine
learning algorithm can be used to solve a problem, the classical algorithm
should be preferred.

For this project, I plan on testing agents that range from fully classical to
fully machine learning. I expect that the best performing agents will be those
that use a hybrid approach that mixes classical components with machine learning
components, but the only way to be sure will be to implement and test the
agents.

## The Design
The design I have in mind is based around three layers that are used to generate
decisions that the agent should take. Each layer consists of a set of components
that read in the data from the previous layer (or the input data for the first
layer) and produce output data that is used by the next layer. Each component
in a layer must produce a single dimensional vector, which is then merged with
the output of the other components in the layer. The resulting vector is then
passed to the next layer, which repeats the process until the final layer is
reached. The output of the final layer is then used to generate the action(s)
that the agent should take.

The **input layer** is the first layer in the network, and is responsible for
reading in the input data and converting it to a form that the second layer
can use. This layer is meant to add contextual information to the input data,
which can then be used by the second layer to make decisions. In a way, this
layer fills the same role that a person's memory does, since it allows domain
knowledge or prior experience to be used to augment the data that will be used
to make decisions.

The second layer is the **decision layer**, which is responsible for taking the
input layer's vector and converting it to a vector that represents what action
the agent should take. This layer is the most important layer in the network,
since it's responsible for making the actual decisions that the agent will
take. The decision layer is also the first layer that will be implemented using
machine learning algorithms as the project moves from classical components
to machine learning components.

Lastly, the output from the decision layer is passed to the **action layer**,
which converts the vector produced by the decision layer into the actual action
that the agent should take. Components used in this layer will be highly
context dependent, since the actions that an agent can take will vary greatly
depending on the environment that the agent is operating in. For this project,
the actions that an agent can take will be limited to a read operation and a
write operation.

Something to note about this design is that my use of the term "layer" is not
the same as the use of the term in a traditional neural network. In my design,
a component in a single layer could be a component implemented using machine
learning, where the component's network consists of multiple network layers.

Also, unlike many types of networks currently in use, the design I have in mind
will not be trained as a single unit. Instead, each component will be trained
independently of the other components. This means that I am not restricted to
using a design that is end to end differentiable, which gives me greater
flexibility in the overall design of agents.

## What's Next?
Next up will be a post that lays out the plan for how this design will be
implemented. The post will describe the various phases that will be used to
incrementally implement and expand on the design, and will also touch on
potential future work that could be done to extend the design.

As a sneak peek for what's to come, one of the areas I'm really excited to test
out is how well a network can adapt to a new component being added. For example,
let's say the input layer generates a 10 element vector and the decision layer
makes use of one or more machine learning components. If a new component is
added to the input layer that generates a 2 element vector (thus modifying the
output of the input layer to be a 12 element vector), how well can the decision
layer adapt to the new information that the input layer is providing?

At the very least, layers in the machine learning components will need to be
resized to account for the new input vector. This will also need to be done in
such a way that the additional information provided by the new input vector does
not reduce the performance of the agent, except when choosing exploratory
actions to try and learn how to use the data from the new element. And of
course, the expectation would be that over time, the new information should also
allow the agent to make better decisions than it could before the new component
was added.

> Find the next post in this series [here]({% post_url Research/ModularNeuralNetworks/2023-07-11-roadmap %})
