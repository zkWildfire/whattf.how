---
layout: post
title: "Modular Neural Networks: Status Update (Aug 11)"
tags: research machine-learning
category: modular-neural-networks
---
It's been about a month since the initial posts about the Modular Neural
Networks research project, so it's time for a status update.

## Roadmap
> This section uses the phases described in the
> [Roadmap]({% post_url Research/ModularNeuralNetworks/2023-07-11-roadmap %})
> post.
{: .prompt-info }

| Phase | Status | Description |
|:-----:|:------:|:------------|
| 1 | Complete | Simulation code |
| 2 | In Progress | Basic agents |
| 3 | Not Started | Modular agents |
| 4 | Not Started | Neural network modules |
| 5 | Not Started | Network-based decision making |
| 6 | Not Started | Higher complexity network modules |
| 7 | Not Started | Component synthesis |

## Phase 1 Progress
The goal of phase 1 was to write the code for handling the simulation that
agents would be tasked with optimizing. A version of the code had already been
written in TypeScript for this site, but would need some modifications to allow
feedback to be provided to agents after each action. Additionally, the code
would need to be written in a different language since TypeScript is not ideal
for use in machine learning.

All code has been fully written for the simulation itself and sits at
[100% code coverage](https://app.codecov.io/gh/zkWildfire/wizard.dev). No
significant changes are expected to be made to this code in the future.

## Phase 2 Progress
Phase 2 is where the current work is being done. The goal of this phase is to
implement the framework for agents to interact with the simulation. Currently,
a single agent has been implemented that implements the naive transpose
algorithm; however, the code for this agent was meant to verify that a CLI
could be created that can handle running an agent and the simulation. Now that
this test was successful, the next step will be to introduce the framework
that future modular agents will build off of. Additionally, more work will need
to be done to the CLI project to allow for improved data gathering and analysis.
