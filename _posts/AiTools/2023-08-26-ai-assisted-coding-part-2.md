---
layout: post
title: "Leveraging AI-Assisted Coding: Part 2"
tags: software-engineering best-practices ai opinion
category: software-engineering
---
I recently began work on a Blazor web app to help with learning to use the
PyTorch machine learning library (via TorchSharp). As part of this project, I
wanted to be able to display data elements from datasets on the app's web UI
so I can visually see which elements the model does well on and which it does
poorly on. This is the story of how ChatGPT greatly sped up the process of
debugging the code that generates bitmap images for the app.

## The Problem
This particular bug falls into one of the worst categories in terms of bug
difficulty. Why? Because the problem can simply be described as "it don't work".

This style of bug is awful to debug because you can't work on it incrementally.
For bugs where something *mostly* works, you can tackle specific bits of the
problem to try and figure out why the code isn't working in the buggy scenarios.
But when code flat out doesn't work, you have a lot less wiggle room when it
comes to trying to figure out where to start.

Adding to my problems is the fact that the issue has to do with the binary data
my code was outputting. The output was supposed to be a valid `.bmp` file in
base64 format, but nothing recognized it as a valid file. This of course further
degrades the debuggability of this bug since while I have the code for
*generating* a `.bmp` file, I don't have the code for *decoding* a `.bmp` file.
So not only do I not have a baseline to work off of because "it don't work", I
also have the pleasure of staring at a wall of text that is entirely
unintelligible to me:

```
Qk1GBwAAAAAAADYEAAAoAAAAHAAAABwAAAABAAAACAAAABADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE
BAQACAgIAAwMDAAQEBAAFBQUABgYGAAcHBwAICAgACQkJAAoKCgALCwsADAwMAA0NDQAODg4ADw8PAB
AQEAAREREAEhISABMTEwAUFBQAFRUVABYWFgAXFxcAGBgYABkZGQAaGhoAGxsbABwcHAAdHR0AHh4eA
B8fHwAgICAAISEhACIiIgAjIyMAJCQkACUlJQAmJiYAJycnACgoKAApKSkAKioqACsrKwAsLCwALS0t
AC4uLgAvLy8AMDAwADExMQAyMjIAMzMzADQ0NAA1NTUANjY2ADc3NwA4ODgAOTk5ADo6OgA7OzsAPDw
8AD09PQA+Pj4APz8/AEBAQABBQUEAQkJCAENDQwBEREQARUVFAEZGRgBHR0cASEhIAElJSQBKSkoAS0
tLAExMTABNTU0ATk5OAE9PTwBQUFAAUVFRAFJSUgBTU1MAVFRUAFVVVQBWVlYAV1dXAFhYWABZWVkAW
lpaAFtbWwBcXFwAXV1dAF5eXgBfX18AYGBgAGFhYQBiYmIAY2NjAGRkZABlZWUAZmZmAGdnZwBoaGgA
aWlpAGpqagBra2sAbGxsAG1tbQBubm4Ab29vAHBwcABxcXEAcnJyAHNzcwB0dHQAdXV1AHZ2dgB3d3c
AeHh4AHl5eQB6enoAe3t7AHx8fAB9fX0Afn5+AH9/fwCAgIAAgYGBAIKCggCDg4MAhISEAIWFhQCGho
YAh4eHAIiIiACJiYkAioqKAIuLiwCMjIwAjY2NAI6OjgCPj48AkJCQAJGRkQCSkpIAk5OTAJSUlACVl
ZUAlpaWAJeXlwCYmJgAmZmZAJqamgCbm5sAnJycAJ2dnQCenp4An5+fAKCgoAChoaEAoqKiAKOjowCk
pKQApaWlAKampgCnp6cAqKioAKmpqQCqqqoAq6urAKysrACtra0Arq6uAK+vrwCwsLAAsbGxALKysgC
zs7MAtLS0ALW1tQC2trYAt7e3ALi4uAC5ubkAurq6ALu7uwC8vLwAvb29AL6+vgC/v78AwMDAAMHBwQ
DCwsIAw8PDAMTExADFxcUAxsbGAMfHxwDIyMgAycnJAMrKygDLy8sAzMzMAM3NzQDOzs4Az8/PANDQ0
ADR0dEA0tLSANPT0wDU1NQA1dXVANbW1gDX19cA2NjYANnZ2QDa2toA29vbANzc3ADd3d0A3t7eAN/f
3wDg4OAA4eHhAOLi4gDj4+MA5OTkAOXl5QDm5uYA5+fnAOjo6ADp6ekA6urqAOvr6wDs7OwA7e3tAO7
u7gDv7+8A8PDwAPHx8QDy8vIA8/PzAPT09AD19fUA9vb2APf39wD4+PgA+fn5APr6+gD7+/sA/Pz8AP
39/QD+/v4A////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/Pz804aDDwAAAAAAAAAAAAAA
AAAAAAAAAAAANqvh/Pz8/POECgAAAAAAAAAAAAAAAAAAAAAAAAAAEara/Pz8/MJPCAAAAAAAAAAAAAA
AAAAAAAAAAAAAFkHU/Pz8/MVQAQAAAAAAAAAAAAAAAAAAAAAAAAAAF3Hc/Pz8/MhNAAAAAAAAAAAAAA
AAAAAAAAAAAAAAJpPk/Pz8+bUAAAAAAAAAAAAAAAAAAAAAAAAAAAAALYG2/PzOAQAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAPj8+D8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAD1z7/LoAAAAAAAAAAAAAAAAAAAAA
AAAAAAAALLn8/JUaAAAAAAAAAAAAAAAAAAAAAAAAAAAAUO/8/HYYAAAAAAAAAAAAAAAAAAAAAAAAAAA
AIvDgn2sAAAAAAAAAAAAAAAAAAAAAAAAAAAAACr38RQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIr8vQ
EAAAAAAAAAAAAAAAAAAAAAAAAAAAAADQCZ/FkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT5tq/PzMCgAqm
QAAAAAAAAAAAAAAAAAAAAAAEdr8/Pz8/MW19vAAAAAAAAAAAAAAAAAAAAAAADDt/Pz8/Pz8/Pz6XFFR
NyYAAAAAAAAAAAAAAAAAHSNdman8/Pz8/OCr/PHCPwAAAAAAAAAAAAAAAAAAAAACERERfYeuGaX+9n4
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=
```

## HAL 9001
Fortunately, while the bitmap format is not particularly human readable, it's
very machine-readable. Except... being machine-readable doesn't really help
if the machine isn't set up to display what it reads in a human readable format.
This here is one of ChatGPT's biggest strengths - it's a *general purpose* AI.

<img alt="ChatGPT Icon"
    src="/assets/img/ai-assisted-coding/chatgpt-icon.png">
<span class="d-flex justify-content-center">
    <i>I'm not sorry Dave, because I <b>can</b> do that.</i>
</span>

Importantly, OpenAI recently introduced a new mode for ChatGPT-4, called "Code
Interpreter". Here's how OpenAI describes the code interpreter plugin for
ChatGPT on their site:

> Code interpreter  
> An experimental ChatGPT model that can use Python, handle uploads and downloads
> 
> We provide our models with a working Python interpreter in a sandboxed,
> firewalled execution environment, along with some ephemeral disk space. Code
> run by our interpreter plugin is evaluated in a persistent session that is
> alive for the duration of a chat conversation (with an upper-bound timeout)
> and subsequent calls can build on top of each other. We support uploading
> files to the current conversation workspace and downloading the results of
> your work.

This plugin is absolutely incredible in terms of the possibilities it opens up.
It now means that ChatGPT is not simply capable of replying to you, it's capable
of adapting itself to a wide variety of scenarios. It's almost like a universal
translator, though obviously AI in its current form is not quite omniscient.
Still, for something like this where the domain of the problem is well known,
ChatGPT is invaluable.

I'll let the results speak for themselves. Below is a snippet from the thread I
used to debug the issue and eventually fix the bug. The thread has minimal
context about my code with the main point of information being that the bitmap
is being generated by C# code.

![Snippet #1](/assets/img/ai-assisted-coding/bmp-debugging-1.png)

In the span of around a minute, I've now gone from only having resources about
the format of `.bmp` files to having information about the exact issue I'm
dealing with. Not only that, but because ChatGPT retains context about the
conversation, I'm also able to query it for information specific to my current
predicament - something you don't get when searching Stack Overflow.
For example, since the repository I'm working in is open source, I simply
uploaded the `.cs` file as part of the conversation.

> Do **NOT** do this if you are working on software for which the source code
> should not be provided to external users. If you would not upload the code to
> some random person on Stack Overflow, you should not be uploading the code or
> otherwise providing it to ChatGPT in any way.
{: .prompt-danger }

Over the next few messages, ChatGPT worked its way through the code and
pinpointed an issue. Here's the relevant part of the conversation:

![Snippet #2](/assets/img/ai-assisted-coding/bmp-debugging-2.png)

## Mistake 2.0
Armed with ChatGPT's advice, I took a look at the Wikipedia page for the
[BMP File Format](https://en.wikipedia.org/wiki/BMP_file_format). This is an
important step that any developer using ChatGPT should never skip - **always**
confirm whether the information ChatGPT provided you with is accurate. This
doesn't diminish ChatGPT's usefulness in any way; even if ChatGPT returns
incorrect information, the terms and other context it gives you will often be
enough to point you in the right direction and help you solve your issue.

In my case, I checked the Wikipedia page's section on the DIB header segment
of the `.bmp` file format. This is the section where the code that ChatGPT
identified as a possible root cause of the bug is. The Wikipedia page confirmed
that the size of the "bits per pixel" field should indeed be 2 bytes, not 4.

![Snippet #3](/assets/img/ai-assisted-coding/bmp-debugging-3.png)

I also noticed that the table lists several other fields as being 2-byte fields.
I found it odd that ChatGPT didn't identify those sections of my code as being
problematic, but at least it's an easy fix. Or rather, it would be an easy fix
had I read more of the Wikipedia article and found out why ChatGPT didn't
identify the other fields as problematic:

> For compatibility reasons, most applications use the older DIB headers for
> saving files. With OS/2 no longer supported after Windows 2000, for now the
> common Windows format is the BITMAPINFOHEADER header. See next table for its
> description. All values are stored as unsigned integers, unless explicitly
> noted.

Having not read the rest of the article, I charged ahead with my changes. And
of course, the resulting code didn't work. *And* I was still stuck with an
unintelligible wall of text that I can't read. But I still have ChatGPT:

![Snippet #4](/assets/img/ai-assisted-coding/bmp-debugging-4.png)

Once again, ChatGPT correctly picked up on the relevant information and laid
it out nicely for me. The first thing I noticed was I had very obviously borked
the code beyond what I had started with, as my image was now supposedly for an
image nearly 2 million pixels wide by half a million pixels tall.

I uploaded the updated code to ChatGPT and took a closer look at the Wikipedia
page while ChatGPT was generating its response. This time, I noticed the block
of text I quoted earlier and realized that I was using the wrong format for the
header section.

Interestingly, the reply from ChatGPT didn't call out the wrong header format
and instead mentioned potential alignment issues. This was a non-issue for me
as I had already identified what was the likely cause, but it's a good reminder
that ChatGPT won't always solve your problems for you.

Prior to testing my revised code, I had one last question for ChatGPT. I'm a
stickler for details when it comes to documentation because it's extremely
easy to misinterpret some documentation, then spend ages debugging your code
because of the mistake. Which I of course have never done and am certainly not
speaking from experience on.

This is one of ChatGPT's core strengths in my opinion, as I often have small
questions for which no Stack Overflow answer perfectly matches. With ChatGPT
though, it becomes easy to check on specific details. Just be careful if you're
using ChatGPT-3.5 as it's significantly more prone to hallucinations and/or
incorrect information when compared to ChatGPT-4.

![Snippet #5](/assets/img/ai-assisted-coding/bmp-debugging-5.png)

Asking ChatGPT clarification questions like this one also shows off another
strength of ChatGPT in that it tailors its responses to your specific use case.
In the past, I'd usually find a Stack Overflow question that was only partially
aligned with my use case, then have to adapt its answer to my code and make sure
I didn't further mess things up. With ChatGPT, questions I have now get answered
with the information I'm looking for *and* further information specific to the
code I'm working with. This is something that will never be matched by Stack
Overflow as there's simply no way for every possible scenario to be covered.
Also, with Stack Overflow, you hav- QUESTION MARKED AS DUPLICATE; SEE
[UNRELATED/OUTDATED POST].

## Wrapping Up
After fixing the original issue that ChatGPT identified and undoing the damage
I did, my code was now working. Upon reflecting on the process I went through
to fix this issue, I was reminded of a remark that Jensen Huang, the CEO of
Nvidia, made at a recent company meeting:

> You are not going to lose your job to AI. You're going to lose your job to
> someone using AI.

By using ChatGPT to solve this issue, I was able to skip a lot of the tedious
aspects of debugging code that produces binary data not meant to be readable
by humans. Leveraging AI tools like ChatGPT and GitHub Copilot lets me focus
a lot more on the big picture when working on projects, rather than work on
the tedious low level and sometimes repetitive aspects. This is a huge
improvement that can't be understated, as it results in greater developer
productivity and reduces the rate of burnout.

There are certainly times where using AI is not appropriate or helpful, but
the number of scenarios for which that applies is shrinking daily. Companies
are investing in internal tools that eliminate the concern over sharing
confidential code or information with the public version of ChatGPT. OpenAI
and other companies are also hard at work on new and improved versions of
conversational assistants, which will further reduce the number of scenarios
that can't be handled by AI assistants. These tools are not going away and
they're only going to get better. Developers can either get with the times
and learn to use these tools in their daily workflows, or they ~~can~~ will get
left in the dust by developers willing to embrace new tools like AI.
