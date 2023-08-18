---
layout: post
title: "The 10 Day Wait: Part 1"
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
hang on a machine with an Intel Tiger Lake CPU, but not on any other machines.

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
handcrafted assembly code. As a result of that instruction, the `wait_for()`
code was effectively running this instead of the intended code:

```py
def wait_for(max_time):
    if max_time > 0:
        max_time = TEN_DAYS
    wait_until(now() + max_time)
```

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

## Inconsistencies
Now that we knew that the issue was definitely in OpenSSL code, there were still
two issues nagging at me. It was believed that the issue was in an OpenSSL
AVX-512 code path since we observed the issue on a machine running an Intel
Tiger Lake CPU. But on a different machine running an Intel Cascade Lake CPU, we
did not see the issue! Both Cascade Lake and Tiger Lake support AVX-512
instructions, so why did we see this discrepancy? Also, we observed that only
*some* calls to `SSL_write()` resulted in the XMM registers being zeroed out.
Why was this the case?

To answer the first question, I dove into the assembly files generated as part
of the OpenSSL build process. These assembly files are generated by perl scripts,
which allows for conditional inclusion of certain code. For my investigation
though, I examined the generated assembly files directly to ensure that I was
looking at the exact code getting executed during our tests.

## Wen AVX-512?
My first step in understanding this question was to figure out what condition
determined whether the AVX-512 code path was taken. I knew from the debugging
sessions that the OpenSSL code path taken by our app ended up in poly1305 code,
so I started searching the `poly1305-x86_64.asm` file for references to AVX-512.
One of the labels I found was `$L$blocks_avx512`.

Seeing as it would only be valid to run AVX-512 assembly instructions on a
processor that supported AVX-512, I figured there had to be some sort of branch
that would jump to the `$L$blocks_avx512` label. Whatever condition was being
checked to determine whether to take the AVX-512 code path would be what I
needed to find the source of.

Fortunately, there was only a single hit for `$L$blocks_avx512`:
```nasm
$L$do_avx2:
    cmp	rdx,512
    jb	NEAR $L$skip_avx512
    and	r10d,r11d
    test	r10d,65536
    jnz	NEAR $L$blocks_avx512
```

That assembly code translates to this C code:
```c
if (rdx < 512) {
    goto skip_avx512;
}

r10d &= r11d;

if (r10d & 65536) {
    goto blocks_avx512;
}
```

While I didn't know for sure what was being stored in `rdx` at this point, I
assumed that conditional was why we were seeing the bug only appear on some
calls to `SSL_write()`. Presumably, if the buffer being encrypted is less than
512 bits, then the AVX-512 code path is skipped. However, this discovery doesn't
explain why the issue doesn't repro on a Cascade Lake machine. I made a note of
my theory and continued my investigation.

The second `if` conditional is more interesting. It's checking whether a
specific bit is set in `r10d`. More specifically, it's checking whether the 17th
bit is set (or the 16th bit, if you want to use 0 indexing instead). If the bit
is set, then the AVX-512 code path is taken. So, if I can figure out what sets
the 17th bit in `r10d`, then I can figure out why the AVX-512 code path is
taken.

Before I could investigate what the significance of bit 17 was, I needed to
check on one thing first. What was `r11d` being set to and would it be relevant
to determining if the AVX-512 code path was taken?

My best guess as to where the value of `r11d` was coming from was this code
block:
```nasm
$L$proceed_avx2:
    mov	rdx,r15
    mov	r10d,DWORD[((OPENSSL_ia32cap_P+8))]
    mov	r11d,3221291008
```

Finding this code block answered two very important questions for me. First,
the constant `3221291008` in hex is `0xC001 0000`. The constant that `r10d`
is compared to is `65536`, or `0x0001 0000` in hex. Since the 17th bit is set
in the value stored in `r11d`, the `r10d &= r11d` operation won't touch the 17th
bit. That means I can safely ignore that operation as a possible factor in
whether the AVX-512 code path is taken.

The other significant discovery from this block of code is where the value of
`r10d` is coming from. It's loaded from a memory address that was given the name
`OPENSSL_ia32cap_P`. That address is declared at the top of the .asm file:
```nasm
EXTERN	OPENSSL_ia32cap_P
```

Since it's declared `extern`, my next stop was to figure out where this variable
is defined. I found its source in `x86_64cpuid.asm`:
```nasm
common	OPENSSL_ia32cap_P 16
```

The variable is also referenced in `cpuid.c`, where it's defined this way:
```c
extern unsigned int OPENSSL_ia32cap_P[4];
```

So, the line `mov r10d,DWORD[((OPENSSL_ia32cap_P+8))]` is moving whatever the
value of the third `unsigned int` in `OPENSSL_ia32cap_P` is into `r10d`.

## What's Behind Bit 17?
At this point, I knew that bit 17 of the third `unsigned int` in
`OPENSSL_ia32cap_P` is what controls whether the AVX-512 code path is taken.
But what determines whether that bit gets set?

`x86_64cpuid.asm` is where `OPENSSL_ia32cap_P` is declared, but interestingly,
I found no other hits for the variable name in the file. If the code wasn't
moving a value into that array by name, how was the array getting set?

The answer to my question lay in `cpuid.c`. Having found no other results for
the array in the `.asm` file, I repeated my search in `cpuid.c` and found this
line:
```c
vec = OPENSSL_ia32_cpuid(OPENSSL_ia32cap_P);
```
(Source: [cpuid.c:147](https://github.com/openssl/openssl/blob/openssl-3.1/crypto/cpuid.c#L147))

That's logical enough. The reason I didn't find any hits for the array name in
the assembly file is because it's referenced via a register, which is set by
the C code calling the `OPENSSL_ia32_cpuid()` method with the address of the
array as its only parameter.

I'll spare you the lengthy story of walking through the `OPENSSL_ia32_cpuid()`
assembly method, which added over a hundred lines to my debugging notes
document, and cut to the chase. Register `ebx` is later moved into
`OPENSSL_ia32cap_P[2]`, so its value is what determines whether the AVX-512 code
path is taken. At the point where `ebx` gets saved, `ebx` contains the value
returned by a `cpuid` instruction that was executed with `eax` set to `0x7`. By
checking documentation on the [cpuid](https://www.felixcloutier.com/x86/cpuid)
instruction, I learned that the values returned by the instruction when `eax` is
set to `0x7` provide information about the instruction sets that the CPU
supports. Bit 17 (referred to as bit 16 on the linked site due to 0 indexing)
corresponds to AVX-512F support.

Great! I now know what causes the AVX-512 code path to be taken! Except... both
Cascade Lake and Tiger Lake [support AVX-512F](https://en.wikipedia.org/wiki/AVX-512#CPUs_with_AVX-512).
Why isn't the bug appearing on the Cascade Lake system then?

## Introducing Intel Lake Lake CPUs
After making the call to `cpuid` to check for supported instruction sets, the
`x86_64cpuid.asm` code also contains this little code block:
```nasm
$L$notknights:
    and	eax,0x0fff0ff0
    cmp	eax,0x00050650
    jne	NEAR $L$notskylakex
    and	ebx,0xfffeffff
```

See that final line there? What this code block does is check whether the CPU
is a Skylake-X processor or not using the data returned by `cpuid`. If it *is*
a Skylake-X processor, the 17th bit of `ebx` is cleared. That's the bit that's
used to check if the processor supports AVX-512F. If the OpenSSL code is running
on a Skylake-X processor, it pretends that the processor does not support
AVX-512F despite the processor actually having support for those instructions.

Looking at the Wikipedia pages for [Cascade Lake](https://en.wikipedia.org/wiki/Cascade_Lake_(microprocessor))
and [Tiger Lake](https://en.wikipedia.org/wiki/Tiger_Lake), it became
immediately obvious why this bug was only appearing on a Tiger Lake machine and
not a Cascade Lake machine. Tiger Lake's microarchitecture is listed as
"Willow Cove", whereas Cascade Lake's microarchitecture is listed as "Skylake".
Therefore, if the OpenSSL code runs on a Cascade Lake CPU with AVX-512F support,
OpenSSL will continue to use the non-AVX-512F code path because it ignores
AVX-512F support on Skylake-derived processors.

After making this discovery, I also came across a comment block that explains
the rationale behind why AVX-512 support is suppressed on Skylake:
```pl
# Convert AVX512F+VL+BW code path to pure AVX512F, so that it can be
# executed even on Knights Landing. Trigger for modification was
# observation that AVX512 code paths can negatively affect overall
# Skylake-X system performance. Since we are likely to suppress
# AVX512F capability flag [at least on Skylake-X], conversion serves
# as kind of "investment protection". Note that next *lake processor,
# Cannolake, has AVX512IFMA code path to execute...
```
(Source: [poly1305_x86-64.pl:29](https://github.com/openssl/openssl/blob/openssl-3.1/crypto/poly1305/asm/poly1305-x86_64.pl#L29))

It definitely would've been nice to run into that comment block *before* reading
enough assembly to add 100+ lines of debugging notes, but at least it confirms
my findings!

## JMP 0xPARTDEUX
Stay tuned for the next post in this tale! In part 2, I'll cover how I isolated
this bug in a test app and how I created a patch to fix the issue.

> [Part 2 is now live!]({% post_url OpenSslXmmRegistersBug/2023-08-09-openssl-xmm-part-2 %})
