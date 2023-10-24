---
layout: post
title: "I Reject Your Registry and Substitute My Own"
tags: software-engineering
category: software-engineering
---
Microsoft engineers seem to love using the Windows registry for all sorts of
things, resulting in tools such as `vswhere.exe` for locating Visual Studio
installations using the registry. This is a major PITA when it comes to using
MSVC files that aren't placed on the system using the Visual Studio Installer.
Fortunately, ~~filthy hacks~~ reasonable workarounds can be created.

## Background
The repository I was working in for this story makes use of the MSVC build tools
that can be installed via the Visual Studio Installer. The tools are installed
once along with the Windows SDK, and then the files are copied onto CI/CD
machine and dev machines without using the Visual Studio Installer or Windows
SDK installer. This results in all machines other than the original machine
having the files, but not the registry keys for Visual Studio or the Windows
SDK.

Normally, this shouldn't be much of a problem. For plenty of other tools, this
*isn't* a problem. But for reasons I do not comprehend, Microsoft really,
really, *really* loves ~~global variables~~ the Windows registry. Maybe they
have a good reason for it, or maybe it's just legacy code left over from when
someone actually thought the Windows registry was a good idea. In any case,
Visual Studio as of VS 2019 continues to use the registry, and I doubt that's
going to change anytime soon.

## The Problem
To use MSVC with tools such as CMake, it's necessary to invoke the
`VsDevCmd.bat` script that gets installed with the MSVC build tools. During its
execution, the script reads a Windows registry key to determine the location of
the Windows SDK. This registry key, of course, does not exist on any of the
machines for this project that need to run `VsDevCmd.bat` because the MSVC and
Windows SDK files were made available on those machines without using the MSVC
or Windows SDK installers.

When my coworker and I ran into this issue originally, we decided to solve it by
simply checking for the registry key and setting it ourselves if it didn't
exist or was set to the default system location. My coworker checked that on our
CI/CD system, this wouldn't be an issue, and then gave me the green light to
implement the fix. This resulted in a mild annoyance as it meant the new setup
script I was creating would need to be invoked as an administrator by all
developers on our team. Fortunately, this would only need to be done as a
one-off, first time setup step for the new build system we were implementing.
Not ideal, but we didn't see a way to get around it that at the time.

Turns out, whatever my coworker did to check if our CI/CD system provides a
clean registry for each build did not in fact correctly verify that. As a
result, we broke a bunch of unrelated builds because those other builds picked
up our registry key value and proceeded to implode. Oops. Also, this is why
your CI/CD system should actually use a clean slate for each build, but I
digress.

We also got a report from a different coworker that setting the Windows SDK
registry key to our non-installed Windows SDK version was breaking his instance
of Visual Studio. As a result, we ended up having to implement a workaround
for our CI/CD and a workaround for developer machines. To make it easier for
developers to revert our change, we updated the setup script to write the
original value of the registry key to a file on disk, allowing developers to
revert the registry key change if they needed to. For our CI/CD system, we made
it so that it would automatically restore the original registry key after
running `VsDevCmd.bat`.

Now we had a working system, albeit one arguably held together with duct tape
and prayers. I'd love for us to simply not have to deal with the registry at
all, but that wasn't an option... right?

## A Rock and a Hard Place
During a conversation with the coworker I was working with, I remarked how nice
it would be if there was a way to mock out the registry so we didn't need to
screw with it in the first place. After all, any competent engineer can tell you
how stubbing out external dependencies like the registry can greatly improve
the testability of a system.

It'd be great if we could simply stub out the registry, but I didn't see any
way of doing that without modifying `VsDevCmd.bat`. That wasn't something I
really wanted to do, as we'd have to roll those changes forward each time we
updated the MSVC version we use. However, that didn't stop a Microsoft engineer
from [recommending just that](https://developercommunity.visualstudio.com/t/resource-compiler-rcexe-is-not-recognized-as-an-in/1676970#T-N1692506):

> As a developer not having access to the registry is an uncommon scenario, it
> is suggested that the effected developers modify [VisualStudio Install
> Directory]\Common7\Tools\vsdevcmd\core\winsdk.bat. By manually changing “set
> WindowsSdkDir=” to "set WindowsSdkDir=[path to windows sdk] IE: “C:\Program
> Files (x86)\Windows Kits\10” you should restore functionality for the command
> line. Note that depending on your project you may have to manually set
> additional variables in this file.

In fairness, he's correct in that it's uncommon for a developer to not have
access to the registry. On the other hand, this wouldn't be an issue if
Microsoft wasn't so insistent on using the registry in the first place.

As I saw it, we had three options:

1. Continue using the current set of workarounds.
2. Modify `VsDevCmd.bat` ourselves and commit to having to roll the changes
   forward to new versions.
3. Create our own implementation of `VsDevCmd.bat` that doesn't require the
   registry.

Option 1 worked, but definitely wasn't ideal. Also, I wasn't particularly keen
on keeping it around as it had a low but non-zero chance of breaking our CI/CD
system again since it still relied on temporarily modifying the registry.
Option 2 is possible, but I also wasn't a huge fan of that since it really isn't
something that should need to be done.

And option 3? Fun fact, option 3 is what we were doing before I pushed for
switching to `VsDevCmd.bat` due to the absurdity of replicating `VsDevCmd.bat`'s
functionality ourselves and having to maintain that for each new version of
MSVC. This was causing all sorts of issues since whoever originally came up with
the hacked together faux `VsDevCmd.bat` split the functionality of
`VsDevCmd.bat` across a `vsvars.bat` script (not to be confused with a real
`vsvars.bat` script despite having the same name, of course) and a CMake
toolchain file.

For what it's worth, apparently the `vsvars.bat` + CMake toolchain combo
predated when Microsoft first made it possible to install only the MSVC build
tools via the Visual Studio Installer. And given the difficulties in making
use of `VsDevCmd.bat`, perhaps making `FrankenVsDevCmd.bat` wasn't the worst
idea.

## Thinking Outside the Box
Let's go back to my wish of being able to mock out the registry. Now obviously,
Microsoft doesn't provide a way to do so because that would be... well,
extremely helpful and extraordinarily useful. Thanks Microsoft.

However, upon looking at `VsDevCmd.bat` again, I realized something. The script
runs something like this:
```bat
reg query HKLM\Some\Microsoft\Path\WindowsSDK
```

Critically, we were already running `VsDevCmd.bat` from a script that I had
written, so I already controlled the code that runs before and after
`VsDevCmd.bat`. This meant that I could muck with system state before calling
`VsDevCmd.bat` and revert any changes afterwards so the only code that sees the
modified state is `VsDevCmd.bat`.

After this realization, my first move was to write a Python script. This sounds
odd given the context, but I'll get to this in a moment. The script would read
an environment variable to find the path to a YAML configuration file, read the
configuration file, then process the command line arguments it was called with.

In my script that invokes `VsDevCmd.bat`, I then added a bunch of echo
statements to write a YAML file. This file would specify the registry key that
`VsDevCmd.bat` reads from for the Windows SDK and the path to our non-installed
Windows SDK. I also set the config variable my python script looks for to the
path that my script generates the config file at.

Lastly, I added one specific path to the system `PATH` before calling
`VsDevCmd.bat`. And with that, I had MSVC working without needing the Windows
registry.

<img alt="Dear Microsoft"
    src="/assets/img/software-engineering/registry.png">
<span class="d-flex justify-content-center">
    <i>
        <a href="https://youtu.be/AqSDQ5mR1gU?t=24">
            https://youtu.be/AqSDQ5mR1gU?t=24
        </a>
    </i>
</span>

## Registry Interception
Now, I *may* have glossed over a few key details in my explanation. Okay, more
than a few. The first key to this puzzle is how the registry query operation
is run.

If this was Linux and bash, `reg` would be an executable like `/usr/bin/reg`.
But with the Windows command prompt, many commands like `type` are actually
commands built into the shell itself rather than an executable. For example, if
you enter `where type` into the command prompt, you'll get this:
```
C:\Windows\system32>where type
INFO: Could not find files for the given pattern(s).
```

What I realized is, `reg` is **not** a built in command. It's an executable:
```
C:\Windows\system32>where reg
C:\Windows\System32\reg.exe
```

Having realized that `reg` is not an intrinsic part of the command prompt, I
realized that it would in fact be possible to stub out the Windows registry.
See, because `reg` is an executable and not a command, the command prompt has to
figure out where the executable is before it can run it. So the command prompt
looks through the system `PATH` sequentially and goes, does `reg` exist at
`C:\foo\reg.exe`? No? Okay, how about at `C:\bar\reg.exe`?

What I did was to take my Python script and compile it using
[PyInstaller](https://pyinstaller.org/en/stable/) to create a .exe file from it.
I then renamed the .exe to `reg.exe`.

Then, by adding the path to the folder containing my Python script's executable
*before* `C:\Windows\System32` in the system `PATH`, I ensured that when the
command prompt was looking for where `reg.exe` was, it would find my `reg.exe`
instead of the real `reg.exe`.

My fake `reg.exe` had to support being called exactly the same way as the real
`reg.exe` since it gets called by `VsDevCmd.bat` rather than my code. That meant
I couldn't pass it any information directly. This is why I made the script read
from an environment variable to find its configuration file, and then use the
data in the configuration file to determine how it behaves.

When the script gets called to query a registry key that it recognizes from the
configuration file, it simply returns the value from the configuration file
without ever touching the registry. If it gets called with a key it doesn't
recognize or a non-query command, it invokes the real `reg.exe` and returns
whatever the real `reg.exe` outputs. As a result, there's no way for
`VsDevCmd.bat` to know that it's not actually hitting the registry when it asks
for the Windows SDK registry key's value. It also means it's a low impact change
since it only affects the calls I specifically tell my tool to look for, rather
than all calls to `reg.exe`.

Technically, I could've simply hardcoded the Python script to look for the
exact query that `VsDevCmd.bat` uses. I suspect that's an approach that plenty
of people would have taken. But the extra work required to support a
configuration file is minimal since Python already provides all the tools for
that, and it's far more flexible since you don't have to recompile the
executable if you need to update the configuration.

Oh yeah and in case you're wondering, this hypothetical scenario is exactly what
happened a few weeks later as I realized there was a second registry key that
needed to be intercepted. Since I had already engineered the script to use a
configuration file, adding support for the new registry key was a trivial change
to make.

## The Problem^2
After a few weeks of this registry interception technique working successfully,
I got a weird report from another developer. Based on the logs they shared with
me, my setup script was being called with the MSVC version set to 16.9, but
the actual MSVC version being set up by `VsDevCmd.bat` was MSVC 16.0.

Originally, I thought this may have been due to using a single shell for an
MSVC 16.0 project followed by an MSVC 16.9 project. But I quickly realized
that wasn't possible, as I was seeing my setup script invoke `VsDevCmd.bat`
just before the build fails. `VsDevCmd.bat` takes a long time to run (anywhere
from ~5 seconds to ~20 seconds), so I had implemented a check in my setup script
that skipped the entire setup process if it had already run in the shell. Given
that I was seeing the call to `VsDevCmd.bat`, the shell couldn't have been used
for an earlier build.

So what was going on here? Why was the setup script working fine for MSVC 16.0
but not for MSVC 16.9?

Well, it turns out that Microsoft engineers had updated `VsDevCmd.bat` between
MSVC 16.0 and 16.9. As part of their changes, they decided to make the 16.9
script assume that the current MSVC version is **16.0**. I have absolutely no
clue why they did that considering the script ships with MSVC 16.9 **and**
wasn't there in 16.0, but again I digress. The script then uses `vswhere.exe`
which, wait for it... uses the @#$%ing registry again.

In the new 16.9 `VsDevCmd.bat`, it has something along the lines of:
```bat
REM Check for `vswhere.exe`
set VSC_VER=16.0
if not exist "%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe" (
    exit /b 1
)

REM If `vswhere.exe` is found, run it to get the actual MSVC version
REM In the real `VsDevCmd.bat` script, this uses a for loop to split the output
REM   from `vswhere.exe`
cd "%ProgramFiles(x86)%\[...]"
vswhere.exe -Property someVsWhereProp -Path "C:\path\to\VsDevCmd.bat"

REM This line is only executed if the output from `vswhere.exe` returns tokens
set VSC_VER=[...]
```

The way `vswhere.exe` handles this call, as far as I can tell, is to find which
MSVC installation corresponds to the `VsDevCmd.bat` at the given path. In our
case, because the `VsDevCmd.bat` being executed wasn't created by the Visual
Studio Installer, `vswhere.exe` doesn't find a registry entry for it and outputs
nothing. As a result, even though `vswhere.exe` is found, `VSC_VER` remains set
to `16.0`. This then causes some chain of events that results in an MSVC 16.0
compiler binary getting used.

## Once More Unto the Breach
My first thought, upon discovering this... interesting... set of code was to
consider whether the existing registry interception setup could be used. Since
the script doesn't explicitly state the registry key it queries, I'd have to
dig through the source code for `vswhere.exe` to find it. I'd also need to
figure out what the expected value of the key was, and potentially also deal
with different registry keys for different MSVC versions. While possible, I
decided to consider alternate solutions before investing time in figuring out
this approach.

My next thought was, maybe I can simply use the same trick I used to allow for
registry interception but for `vswhere.exe` instead. The only problem is that
because `VsDevCmd.bat` changes its working directory to the location that
`vswhere.exe` is located, it will always find the real `vswhere.exe` without
needing to hit the system `PATH`. Even if I added the path to a fake
`vswhere.exe` at the start of the `PATH`, it would never be executed.

At this point, I was stumped. It looked like the only option I had was to
dig through the `vswhere.exe` source code. But just when all hope appeared to
be lost, a ~~filthy hack~~ elegant solution formed before my eyes.

## Interception 2.0
Although `VsDevCmd.bat`'s code thwarted the `PATH`-based solution I devised
for registry interception, it was still vulnerable to being redirected. As
before, I created a fake `vswhere.exe` that was driven by a YAML configuration
file. Then, I updated my script. But unlike last time, I didn't change the
`PATH` to make `VsDevCmd.bat` use my fake `vswhere.exe`. No, this time, my
code looked like this:

```bat
set REAL_PF_VAL=%ProgramFiles(x86)%
set "ProgramFiles(x86)=C:\path\to\my\vswhere"
VsDevCmd.bat
set "ProgramFiles(x86)=%REAL_PF_VAL%"
```

Yes, it turns out that while `%ProgramFiles(x86)%` looks like a built in
variable and is one that's supplied by the command prompt automatically, it's
actually just a variable like any other. Which means I can override it to point
to anywhere I choose, rather than the path that `VsDevCmd.bat` expects it to
point. After that, my solution for this problem operates nearly identically to
the registry interception solution, except with a fallback to the real
`vswhere.exe` instead of `reg.exe`.

## But Wait, There's More?
As of the time of writing, this is (fortunately) the end of this saga. That
said, given Microsoft's odd affinity for constantly using the registry to
~~be a pain in my arse~~ remain backwards compatible with legacy code, I
wouldn't be surprised if another issue pops up in the future. Until then, this
post will hopefully stand as a beacon of hope for any other beleaguered
developer dealing with Microsoft's registry obsession.
