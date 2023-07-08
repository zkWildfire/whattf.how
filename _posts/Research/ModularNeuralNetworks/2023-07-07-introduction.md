---
layout: post
title: "Research Project Introduction: Modular Neural Networks"
tags: research machine-learning
category: modular-neural-networks
---
Machine Learning is a field of computer science that I've been extremely
interested in, but so far haven't had much experience with. This research
project is my attempt to both gain a better understanding of machine learning
and to explore a topic that I find particularly interesting: modular neural
networks.

## Background
As of the time of starting this project, I only have a basic understanding of
how machine learning works. My experience with machine learning consists almost
entirely of the machine learning classes I took at UW Seattle, which covered
the fundamentals of machine learning and neural networks. Beyond that, I have
very little hands on experience with machine learning. However, I have well over
a decade's worth of experience in general software development and programming,
which is one of the reasons why the idea of modular neural networks is so
interesting to me.

To my knowledge, even massive networks like large language models are trained as
a single monolithic network. This, I assume, is one of the major factors behind
why training these types of networks can take so long and can be so expensive.
Additionally, the large, monolithic design of these networks contributes to
many difficulties faced by researchers, such as the difficulty of determining
why a network made a particular decision, or the difficulty of reusing parts of
a network in other networks.

The goal I have for this research project is to explore the idea of breaking
neural networks down into smaller, more modular components. This will ideally
allow for faster training times, easier reuse of network components, and easier
interpretation of network decisions. Of course, these are lofty goals that many
researchers are chasing and I have no idea if this idea will actually work, but
I'm excited to find out! After all, it wouldn't be called research if we already
knew the answers.

Surprisingly, the research into modular neural networks seems to be relatively
limited... or perhaps I simply had overinflated expectations for how many papers
I would find. Considering the potential benefits of modular neural networks, I
thought I'd find a lot more research into the topic. Regardless, seeing as I
tend to learn significantly better by tackling challenges and solving them
myself, this presents a fantastic opportunity for me to explore the topic
myself. I may end up reinventing the wheel a few times, but that's something
that often ends up being an extremely valuable learning experience to me.
And since the topic of modular neural networks is not well understood, there's a
good chance I won't reinvent the wheel too many times.

## The Project
For this project, I plan on reusing the matrix cache simulator demo that's
[hosted on this blog]({% post_url MatrixCacheSim/2023-06-17-matrix-cache-simulator-demo %}).
The matrix cache simulator is a simple demo that I wrote which visualizes how a
processor's cache is used when running a matrix transpose algorithm that
performs an in-place transpose. This is a relatively simple problem to solve,
but it's also one that can be solved in a variety of different ways - some more
efficient, some less efficient. This makes it perfect for this project for
numerous reasons.

Matrix transposition is a problem that can be that can be solved using classical
agents, which makes it significantly more approachable than a problem that would
require the use of machine learning agents. This means that I can start off by
implementing classical agents to solve the problem, allowing me to establish
several baselines to compare future agents against. It's also a problem that can
be easily customized by modifying the matrix size or the cache properties,
meaning it can be made significantly more difficult for an agent to solve
efficiently since an agent won't know the cache configuration at the start of a
run. Allowing the matrix size and cache properties to vary additionally has the
benefit of making it harder for a machine learning agent to overfit to the
problem, especially if I reserve some configurations for an agent's training set
and some for its test set. And since the challenge is programmatically
generated, I don't need to worry about putting together a large data set for
training and testing.

It's also extremely easy to quantify the performance of agents performing the
matrix transposition task. Agents can be scored on how many cache hits and
misses they incur, how long they take to complete the task, etc. These metrics
can be used to compare the performance of different agents, and can be used in
reward functions for reinforcement learning agents. And since the values in each
matrix cell can be tracked, it will be easy to implement safeguards to prevent
agents from [padding their score without solving the actual
problem](https://openai.com/research/faulty-reward-functions).

Lastly, matrix transposition is easily visualizable, *and* I already have the
code for rendering the visualization! The data required for the visualization is
very simple and easy to record, so I can implement the agents in any language
that can dump the actions as JSON. The JSON data can then be loaded and used to
render the visualization using much of the same code as that used by the matrix
cache simulator demo. This will make it significantly easier to debug agents,
demonstrate the performance of agents, and to show off progress as I work on the
project and implement new agents.

## What's Next?
A post will be coming shortly that will go into more details about the design
that I'm planning on testing out. While I have a general idea of how I want to
implement the various agents, I also expect I'll end up deviating from the
initial design as I try out different agent designs and come up with new ideas.
