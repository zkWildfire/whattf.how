---
layout: post
title: "The Curious Case of the 10 Day Wait"
tags: bugs openssl
category: debugging
---
As programmers, we normally expect that standard library methods will do what
they say they do. But what happens when code somewhere else violates a critical
invariant expected to never be broken? This is the story of how a bug in OpenSSL
resulted in threads hanging for 10 days instead of a handful of milliseconds.

## Initial Discovery
A couple weeks ago, I was messaged by a coworker over slack about a bug he was
seeing in our C++ code. He was looking into an issue where a thread in our app
was hanging in a call to the `wait_for()` method on a standard library
`std::condition_variable` object. Normally, the thread was expected to block for
up to 50 milliseconds as it's uncommon for that particular thread to be
signaled. However, the behavior observed by my coworker was that the thread
would enter `wait_for()` and then never return. The thread would hang seemingly
indefinitely. But, only on *some* machines! In our case, we were seeing the
hangs on a machine with an Intel Tiger Lake CPU, but not on any other machines.

As it turns out, the implementation of `wait_for()` in Microsoft's standard
library clamps the time passed to `wait_for()` to 10 days. Normally, this isn't
a problem since spurious wakeups should be handled by callers and not many
applications would need to suspend a thread for more 10 days. The code used
to implement this was nothing special, amounting to roughly this:
```py
def wait_for(max_time):
    if max_time > TEN_DAYS:
        max_time = TEN_DAYS

    wait_until(now() + max_time)
```

Looking at the code alone, it doesn't seem possible for the code to wait for
up to 10 days unless the caller passed in a value of at least 10 days. But when
we dove into the assembly code, the problem became more clear.

When compiling our app with optimizations enabled, MSVC was opting to load
several constants into XMM registers when the thread that ended up running
the `wait_for()` method was created. Then, when `wait_for()` ran, the generated
assembly instructions amounted to this:

```py
def wait_for(max_time):
    if max_time > xmm9:
        max_time = TEN_DAYS
    wait_until(now() + max_time)
```

When running the app and walking through the disassembly, we saw that the
instructions for the `max_time > TEN_DAYS` branch was being taken... despite
the input parameter being less than 10 days!

While debugging this prior to reaching out to me, my coworker had found that
the `>TEN_DAYS` branch was being taken because the XMM register being compared
to was all zeroes. It was also discovered that the instruction that was
resulting in the relevant XMM register getting zeroed out was in OpenSSL's
handcrafted assembly code.

## Identifying the Culprit
At the point where I joined the debugging effort, it was not known at the time
what we were looking at. We knew that a `vzeroall` instruction in OpenSSL code
was causing the XMM registers to be cleared. And we knew that the zeroed out
register was causing `wait_for()` to behave incorrectly. But was the issue with
the `vzeroall` instruction, or was MSVC generating incorrect code that
erroneously used a register that it wasn't setting in the `wait_for()` method?

Fortunately, pinpointing the origin of the problem was not that difficult. While
a lot of the debugging up to this point had been focused on why `wait_for()`
was behaving the way it was, I focused on determining the point of fault. I
started under the assumption that since `wait_for()` is standard library code -
and not particularly obscure standard library code at that - it's extremely
unlikely that there would be a bug in its implementation. While I couldn't
outright rule out the issue being an MSVC bug at this point, I also made the
assumption that it was unlikely to be an MSVC bug since encountering compiler
bugs is extremely uncommon. Similarly, I ruled out the issue being a CPU bug
despite only seeing it on Tiger Lake since CPU bugs are equally uncommon.

Like many programmers, I don't routinely work with assembly code. But I do have
some exposure to it, as it was covered in one of university classes I had taken
at UW Seattle. As a result, the first step I took to debug this issue was to
look up the calling convention for x64 to see how the XMM registers should be
handled. A quick google search later and I began looking through the
[x64 calling convention](https://learn.microsoft.com/en-us/cpp/build/x64-calling-convention)
page on Microsoft's site.

Under the [Caller/callee saved registers](https://learn.microsoft.com/en-us/cpp/build/x64-calling-convention#callercallee-saved-registers)
section, I found exactly what I was looking for:

> The x64 ABI considers registers RBX, RBP, RDI, RSI, RSP, R12, R13, R14, R15,
> and XMM6-XMM15 nonvolatile. They must be saved and restored by a function that
> uses them.

If a register is "caller-saved", it means that when a function is called, the
caller cannot expect that the register's state will be the same after the
method returns as it was before the method was called. If a caller needs the
value in the register, it must save the value itself since the called function
may or may not overwrite the register. If a register is "callee-saved" however,
it means that if the called function wants to use the register, it **must**
ensure that it restores the register to its original state before returning.

Armed with this knowledge, the next step was to confirm that the registers were
set prior to a call to an OpenSSL method and not set afterwards. We were able
to confirm that prior to a call to `SSL_write()`, we observed non-zero values
in the XMM registers. After the call to `SSL_write()`, we observed all XMM
registers containing zeroes. This was the exact result I had been aiming for, as
it meant that we could now eliminate all non-OpenSSL suspects and not waste any
time debugging unrelated code. Importantly, it also meant that we could
eliminate any doubts about whether we were doing something wrong with OpenSSL,
since it should not be possible to violate the x64 calling convention regardless
of how OpenSSL is configured - including if it had been misconfigured.
