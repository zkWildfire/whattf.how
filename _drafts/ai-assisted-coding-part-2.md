---
layout: post
title: "Leveraging AI-Assisted Coding: Part 2"
tags: software-engineering best-practices ai opinion
category: software-engineering
---
In part 1, I took a look at my history with ChatGPT and why I now consider AI
tools to be an invaluable item in any programmer's tool belt. This next post in
the series demonstrates how ChatGPT can be leveraged to significantly increase
development velocity.

## Background
Many different content creators have put out articles or videos that look at
AI tools by placing the entire creative process in the tool's control. For
example, there are numerous videos where the premise of the video is that the
content creator simply does what the AI says without applying the creator's
own prior knowledge to fix errors or avoid unnecessary inefficiencies. While
this may be a practical approach to farming views, it's borderline entirely
useless for anyone who cares about making effective use of AI tools.

The approach I've opted for in this post is to take on a project in an area of
software development that I have no prior experience in. As a result, while I'll
still be able to rely on my experience in general software development, I won't
have in depth knowledge of the libraries and/or APIs that I'll be using.
Instead, I'll be making use of ChatGPT (specifically, the GPT-4 variant of
ChatGPT) and GitHub Copilot when working on this project.

My typical workflow is to use Google, Stack Overflow, or API references for
"simple" topics and only fall back to ChatGPT for more complex questions.
However, for this project, I'll be using ChatGPT as my primary source and
will only fall back to external sources if ChatGPT's responses are unsuitable.
This will allow me to focus on how ChatGPT improves my productivity while also
remaining close enough to my normal workflow that this project's workflow can
be indicative of how developers can make use of AI tools. Also, while I wouldn't
recommend this workflow when using ChatGPT-3.5, ChatGPT-4's replies are
significantly better and I may switch to using ChatGPT as my first point of
contact in the future, especially as newer versions of GPT are released.

Importantly, I will not be taking ChatGPT suggestions unconditionally. My goal
for this series is to look at how AI tools can be used by programmers,
especially experienced ones, to improve their workflow. Just as I would not use
an obviously incorrect answer from ChatGPT in my own projects, neither will I
make use of obviously incorrect answers for this project. The point of this
project is to create a functioning project, not to accept all ChatGPT
suggestions mindlessly.

## The Project
The project I'll be taking on is to automate a workflow that I've been handling
manually for a Discord server I help manage. The Discord server is an invite
only Discord server where I maintain a diagram that tracks who each person
was invited by. Whenever a person joins the server, I manually add an entry
to a graphviz `.dot` file, generate the diagram, and upload it to the server.
The `.dot` file is tracked via source control (git) and is pushed to GitHub.

The bot that I'll be building for this project will be added to one or more
Discord servers, starting with a private server I'll create for testing the
bot. Later, the bot will be added to the Discord server I help manage. The
bot will need to listen for events such as a user joining, a user leaving,
changes to users' nicknames, plus a few bot commands. When a user-related
change occurs, the bot will need to generate a new diagram, upload it to the
Discord server on which the event occurred, then delete the post containing
the previous, now-outdated diagram (if any).

To complicate matters, with the number of nodes that the diagram I manually
manage contains, I often need to regenerate the diagram multiple times before
I get one whose layout is satisfactory. This will be something that the bot
will have to handle as well. However, since I don't have a good way of
determining whether a given image file is a "good" diagram or a "messy" diagram,
regenerating the image will need to be triggered manually. I plan to make it
so that the bot will reply to a `regenerate` command issued via Discord (with
appropriate permission checks), which should cause the bot to generate multiple
new versions of the graph image. Those images should then be uploaded as a
separate message, where the user that triggered the generation of the new images
can select one to use.

Lastly, the diagram I currently maintain uses different colors for different
nodes to make the diagram a bit more readable. This information will need to
be tracked by the bot as well and should be something that can be modified via
the bot.

## Getting Started
I started by checking with ChatGPT on what options I have available, with my
preferences being a C# or Python library. ChatGPT suggested
[Discord.Net](https://discordnet.dev/guides/introduction/intro.html) for C# and
[discord.py](https://discordpy.readthedocs.io/en/stable/) for Python. Both
libraries exist and appear to be what I need, so kudos to ChatGPT.

After a brief back and forth with ChatGPT, I selected Python with `discord.py`
as my language and library of choice. This was driven by code snippets generated
by ChatGPT in response to a request I made to show me sample code for generating
an image using graphviz. For C#, ChatGPT generated the following code:
```cs
using System.Diagnostics;

namespace GraphvizExample
{
    class Program
    {
        static void Main(string[] args)
        {
            string inputPath = "path/to/yourfile.dot";
            string outputPath = "path/to/output.png";

            var processStartInfo = new ProcessStartInfo
            {
                FileName = "dot", // Ensure that Graphviz is in your PATH
                Arguments = $"-Tpng {inputPath} -o {outputPath}",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            };

            var process = new Process { StartInfo = processStartInfo };
            process.Start();
            process.WaitForExit();
        }
    }
}
```

For Python, ChatGPT generated the following code:
```py
import pygraphviz as pgv

input_path = "path/to/yourfile.dot"
output_path = "path/to/output.png"

# Load the graph from the DOT file
graph = pgv.AGraph(string=open(input_path).read())

# Render the graph to the output file
graph.draw(output_path, prog='dot')
```

For hosting the bot, I plan on using Docker and a Digital Ocean droplet as I
have prior experience with both.

## Family Tree Code
The first step I took for building this bot was to implement the code for
keeping track of each node that would be present in the generated diagram. For
this step, I relied largely on my prior programming experience rather than
ChatGPT.

The design for the code I added as part of this stage is loosely based on the
design used by C++ data structures, where iterators are obtained from the
data structures they operate on:

{% plantuml %}
title Family Tree Classes

interface IFamilyTreeService {
    Keeps track of family tree instances for each server the bot is added to.
}

interface IFamilyTree {
    Interface that is used by the rest of the bot's code for working with family tree instances.
}

class DictFamilyTree {
    Family tree implementation that stores nodes in a dictionary.
}

class TreeNode {
    Represents a node that will be generated in graphviz diagrams.
}

class ITreeView {
    Provides access to nodes in a family tree instance.
}

class ListTreeView {
    Tree view backed internally by a list.
}

IFamilyTreeService . IFamilyTree
IFamilyTree <-- DictFamilyTree
DictFamilyTree "1" *-- "n" TreeNode
IFamilyTree . ITreeView
ITreeView <-- ListTreeView

{% endplantuml %}

Since I'm working towards the initial prototype, I've implemented each interface
using a naive implementation that favors simplicity over efficiency. I also
don't expect the bot's code to run very often since the events the bot will
listen for won't happen very often, so I'm more concerned about speed of
implementation rather than speed of execution.

Most of the classes in the above diagram are relatively straightforward, so
there's not much to discuss. However, the `IFamilyTreeService` interface is
supposed to keep track of family tree data structures for each server the bot
is added to, which means I need to know how Discord identifies each Discord
server. This is something I don't know, which means it's time to ask ChatGPT.

I asked ChatGPT to generate the `IFamilyTreeService` interface using this prompt:
````
I'm building a Discord bot using Python and discord.py. I need to define a
service class called `IFamilyTreeService`, which will provide access to
`IFamilyTree` instances. The service will keep track of family tree instances
for each server that the bot is added to. Can you generate the
`IFamilyTreeService` type as an abstract interface where it defines the
following methods?

* `register_discord_server()`: A method that accepts information about a discord
  server as parameters and creates a new family tree for the server. One of the
  parameters must be a `TreeNode` object, which will be the root node for the
  server's family tree instance.
* `remove_discord_server()`: A method that removes a previously added discord server.
* `get_family_tree()`: Returns the family tree object for a discord server the
  bot has been added to.

Please use the same style as what's used for this class when generating code:
```
[family_tree.py contents]
```
````
In the last segment, where I wrote `[family_tree.py contents]` in the above
snippet, I pasted the contents of
[this file](https://github.com/zkWildfire/FamilyTreeDiscordBot/blob/981d5d16c509f4f9a05012517bb3cbf0361c0ebf/src/bot/models/family_tree.py)
in the real prompt to ChatGPT.

ChatGPT's reply:
![ChatGPT reply #1](/assets/img/ai-assisted-coding/family-tree-1.png)

I also asked ChatGPT about what Discord uses to identify servers, to which
ChatGPT replied:

![ChatGPT reply #2](/assets/img/ai-assisted-coding/family-tree-2.png)

The code that ChatGPT generated for the interface is exactly what I wanted,
and the only changes I made to it were stylistic changes - modifying comments
to use my writing style and a few formatting changes. You can see the version
of the class that I committed [here](https://github.com/zkWildfire/FamilyTreeDiscordBot/blob/981d5d16c509f4f9a05012517bb3cbf0361c0ebf/src/bot/services/family_tree_service.py).
