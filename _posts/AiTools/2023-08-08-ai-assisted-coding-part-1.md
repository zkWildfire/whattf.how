---
layout: post
title: "Leveraging AI-Assisted Coding: Part 1"
tags: software-engineering best-practices ai opinion
category: software-engineering
---
In November 2022, OpenAI released their newest large language model to the
world. Known as ChatGPT, it quickly exploded in popularity and reached over
100 million users by January 2023. This series of posts explores my thoughts on
best practices for making use of these tools and why I consider knowledge of how
to apply these tools to be a mandatory skill for all developers.

## In the Beginning
When ChatGPT first showed up, I remember being extremely skeptical of it. After
all, AI tools like Tabnine or GitHub Copilot had been around for a while but
didn't seem to have gained much traction. Given how infrequently mentions of
those tools appeared in the various programming related sources I follow, I
figured neither tool was all that useful and never gave them much thought. So
when ChatGPT screenshots started popping up, I dismissed ChatGPT as just another
new AI tool whose novelty would wear off and disappear. Oh how wrong I was.

It wasn't until a friend of mine messaged me with a couple of screenshots of
ChatGPT that it piqued my attention. The part that stood out to me was the fact
that the code that ChatGPT was spitting out wasn't like the snippets of Copilot
generated code I'd seen. ChatGPT wasn't just generating code - it was also
generating *comments* explaining the code it was generating.

As a test, I sent my friend a code block from one of the first programs I ever
wrote. The code was from a text based game that was written with C++, and I
still remember it to this day because it had a bug that stumped me for close to
a week. In fact, to give you an idea of how new I was at the time, I didn't even
know how to use the debugger in Visual Studio yet! So, as a test, I had my
friend ask ChatGPT if it knew why this code would always take the first branch
of the `if` statement:

```cpp
if (menuchoice = 1)
{
    store();
}
else if (menuchoice == 2)
{
    fight();
}

else
{
    cout << "Please enter a number that corresponds to a menu item. \n";
    system("PAUSE");
}
```

Here was ChatGPT's response:
![C++ bug](/assets/img/ai-assisted-coding/cpp-bug.png)

For me, I think this was my "oh sh*t" moment when it came to ChatGPT. When I
first started coding, I was the only person I knew who was interested in coding.
I didn't have anyone to turn to when I had something I didn't understand. I just
had to tough it out and figure it out, which usually meant a lot of googling,
scratching my head, banging my head against a wall, and questioning if I could
even figure it out. Had ChatGPT existed back then, "invaluable" wouldn't even
begin to describe it.

## What Else Can It Do?
Over the next few weeks, I tried asking ChatGPT various coding questions. Many
of these were relatively simple questions like "How would you write a method
that does X?", where X was some task I had implemented a method for recently.
While ChatGPT was definitely not perfect, it was able to do a reasonably good
job and successfully answered most questions. Importantly, it explained what the
code it was generating did, making it easy to notice when the code it generated
*didn't* do what it said it was doing.

Out of curiosity, I decided to ask ChatGPT about a particularly challenging
bit of code I had written about a year prior. At the time, I was messing around
with using [Mono](https://www.mono-project.com/) as a way to allow a single
program to use both C++ and C# code. The challenge that I had run into is that
this is an *extremely* niche use case, so I found almost no Stack Overflow posts
when I was trying to figure out what I was doing wrong. While I eventually
figured it out, it took me several days of poking around with the code after
work.

Seeing as this is an area for which ChatGPT would likely have less material
in its training set, I was particularly interested in how it would handle my
questions. And I was floored when it replied with the exact same steps that I
had come up with after wrestling with my code for a few days:

![How can C++ code call a C# method using Mono?](/assets/img/ai-assisted-coding/call-csharp-from-cpp-1.png)
![How can C++ code call a C# method that takes arguments and returns a value?](/assets/img/ai-assisted-coding/call-csharp-from-cpp-2.png)
![How can C++ code call a C# method using `mono_method_get_unmanaged_thunk()`?](/assets/img/ai-assisted-coding/call-csharp-from-cpp-3.png)

While ChatGPT hit its token limit for the later two responses, its code more or
less matched the code that I had come up with on my own. And while that's
already impressive given the lack of Stack Overflow posts I had found, there was
one other extremely critical element that ChatGPT nailed.

You see, one of the reasons getting my little test app working was so difficult
is that Mono provides a C API that uses `void*` pointers. So when I got a
function pointer back from its `mono_method_get_unmanaged_thunk()` method,
I didn't know for sure what its type was. But fortunately, I had Mono's
documentation to go off of:

![Incorrect Mono documentation](/assets/img/ai-assisted-coding/mono-documentation-wrong.png)

Except, there was one little problem... the Mono documentation was **wrong**.
Here's a screenshot of that same code snippet, which has since been (partially)
fixed on Mono's site:

![Fixed Mono documentation](/assets/img/ai-assisted-coding/mono-documentation-fixed.png)

Yeah, it's no wonder I had such a difficult time trying to call the `void*`
pointer I was receiving. And yet... looking at ChatGPT's code, ChatGPT
defined the type of the method pointer *correctly* despite the Mono
documentation being wrong at the time I asked ChatGPT to generate that code. Not
only that, but it correctly explained what the third parameter is for!

Granted, according to some other documentation I found, the ChatGPT code isn't
quite right since the last parameter is supposed to be a non-null pointer. But
if I'm being honest, that small mistake doesn't devalue ChatGPT's response much
in my eyes. The fact that ChatGPT spat out the correct method signature *and*
explained what the parameter was would have been enough for me to have fixed its
mistake with minimal difficulty.

## Here And Now
Fast forward to present day and I now have significantly more experience with
both ChatGPT-3.5, ChatGPT-4, and GitHub Copilot. With all that experience, I
can say two things with absolute certainty. First, the current iterations of
these tools will never replace developers. Future versions, quite possibly. But
not the current iterations.

Second, if I were a hiring manager, I would not hire a candidate who does not
utilize these AI tools or considers them to be not worth using.

That second statement may sound extremely odd given my first assertion. Let
me explain my rationale a bit more.

In these tools' current iterations, they're prone to making various mistakes.
For example, one of the most common type of mistake is referred to as
"hallucinations", which is when an LLM (large language model) makes up
information that does not exist. This is a trap that people who don't have much
experience with LLMs get caught off guard by extremely frequently. Current LLMs
are designed to produce *realistic* output. That isn't the same as producing
*correct* output. An LLM will gladly tell you to call the method `FooBar()` if
it sounds like it's the appropriate method to use to answer your query.

Other times, LLMs will flat out fail to produce code that's even remotely
correct. A coworker of mine ran into a scenario where ChatGPT spat out some
Python code that was fundamentally wrong, and no matter how my coworker tried to
coax ChatGPT into fixing its mistakes, it kept replying with similarly
fundamentally wrong code.

LLMs are a fantastic tool, but they are by no means a flawless tool. Without
the knowledge to correct the LLM when it makes a mistake, the LLM is potentially
as bad as worthless. You can sometimes get an LLM to fix its mistake by telling
it what its code is doing versus what it should be doing, but that doesn't
always work - as evidenced by my coworker's struggle. This is why I do not
believe there's any risk of *current* iterations of these AI tools completely
replacing developers.

What is much more likely, and something that is likely already happening, is
that LLMs will increase developer productivity so significantly that fewer
overall developers will be hired. Rather than fully replace developers, LLMs
will displace developers. This is similar to the increase in developer
productivity brought about by semantic autocompletion tools like Microsoft's
Intellisense, but on a much larger scale. To get an idea of what I mean,
consider a class that saves several constructor parameters as member variables:

```cs
public class Foobar
{
    private readonly int _foo;
    private readonly string _bar;
    private readonly bool _baz;

    public Foobar(int foo, string bar, bool baz)
    {
        _foo = foo;
        _bar = bar;
        _baz = baz;
    }
}
```

Before semantic autocompletion, a developer would have to type out the entire
set of text themselves. After semantic autocompletion, a developer can more
quickly type out the constructor body since the autocompletion suggestions will
be scoped to only what's available. This is a significant improvement,
especially when calling an object's methods. I mean come on, is it
`xs.length()` or `xs.size()`? I can never remember.

<img alt="How language designers choose the function for retrieving the size of an array"
    src="/assets/img/ai-assisted-coding/language-designers.png">
<span class="d-flex justify-content-center">
    <i>How language designers choose the function for retrieving the size of an array</i>
</span>

GitHub Copilot on the other hand is on a whole new level. That sample code
above? I typed out the class name and the first member variable declaration.
Every other line was generated by GitHub Copilot. And Copilot isn't restricted
to being useful for boilerplate code. I've had it generate entire functions for
me with nothing more than the function signature and documentation. Now, in
fairness, Copilot is not perfect and is more likely to make mistakes when
generating larger amounts of code. But even if it could only generate
boilerplate code like `Foobar`'s constructor, it would still be a massive
improvement to developer productivity.

This massive increase in developer productivity is exactly why I think it's
critical for developers to take the time to try these AI tools. They're not
perfect, which means it's important for developers to understand their strengths
and weaknesses. When used correctly, they're an invaluable boost to productivity.
Even if these AI tools never improve past their current state, I think we'd
reach a point where a developer who does not use AI tools would be looked at
the same way that present day developers would look at someone who says they
only code in Notepad. And I'm not talking about Notepad++.

## When And Where?
While AI tools are invaluable in my experience, it's still important to know
when and where they're most useful. Not only that, but knowing when they're
*not* likely to be useful is also helpful, though this of course is always
changing. Unfortunately, seeing as the capabilities of AI is a huge topic on its
own, you'll just have to wait for the next post in this series! In the meantime,
to those of you who want present day AI to write you the next World of
Warcraft...
![That's not how AI works](/assets/img/ai-assisted-coding/thats-not-how-ai-works.png)

> [Part 2 is now live!]({% post_url AiTools/2023-08-26-ai-assisted-coding-part-2 %})
