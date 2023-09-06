---
layout: post
title: "The 10 Day Wait: Part 2"
tags: bugs openssl
category: debugging
---
In part 1, we saw how a violation of the x64 calling convention resulted in
strange behavior in methods entirely unrelated to the faulty code. This next
part looks at the steps that were necessary to isolate the bug using a test app
and how the bug was fixed.

## Meet the MCVE
By the time I started working on a minimum complete verifiable example (MCVE)
app for the bug, I had a pretty good grasp of the bug. I knew that all of the
following conditions needed to be met in order to trigger the bug:

* The host CPU must support AVX-512F instructions
* The host CPU must not use a Skylake-derived architecture
* The host OS must be Windows
* Internal OpenSSL code flow must go through poly1305 code
* poly1305 code must be called with a buffer that is at least 512 bits long

Armed with this knowledge, I began considering how to reproduce this bug. The
MCVE app would need to demonstrate that the registers were being cleared, which
meant I would need to read the XMM registers' values and display them via
stdout. Also, since the registers may not have been set to anything, I would
need to have code that allows me to set the registers' values myself. And to
be safe, I figured that I would need to have some code that tracked what the
original values of the XMM registers were and restored them, just in case my
changes to the registers caused issues with compiler-generated code.

I would also need to call into OpenSSL's poly1305 code. In the original app
where this issue was detected, the poly1305 code was executed as part of a call
to `SSL_write()`. But since that method requires setting up a connection between
a client and a server, I didn't want to go down that route. My hope was that I
could trigger the bug by encrypting a buffer in memory, which would simplify the
MCVE code compared to creating a client and server binary.

## Assembling the MCVE
I began by investigating whether I could use inline assembly with the MSVC
compiler. Unfortunately, while cppreference.com does mention an
[`asm` declaration](https://en.cppreference.com/w/cpp/language/asm), attempting
to compile the example from that cppreference page results in compiler errors:
```
example.cpp
<source>(14): error C2290: C++ 'asm' syntax ignored. Use __asm.
<source>(21): error C2059: syntax error: ':'
<source>(28): error C2290: C++ 'asm' syntax ignored. Use __asm.
Compiler returned: 2
```
(Source: [Godbolt w/MSVC 19.35](https://godbolt.org/z/qhEjY9T3q))

Switching to using `__asm` didn't help either, as it resulted in this error
message:
```
<source>(6): error C4235: nonstandard extension used: '__asm' keyword not
supported on this architecture
```

As it turns out, inline assembly was supported for x86 but is
[not supported](https://github.com/MicrosoftDocs/cpp-docs/blob/main/docs/assembler/inline/inline-assembler.md#:~:text=Inline%20assembly%20is%20not%20supported%20on%20the%20ARM%20and%20x64%20processors.)
for x64.

Since inline assembly was out of the question, I looked to see what other
alternatives I had. I've never written assembly myself before, let alone
integrated custom assembly into a C++ program, so I wanted to check if there
were any other options before going down that route.

I found that MSVC does support a data structure that maps to XMM registers
called [`__m128`](https://learn.microsoft.com/en-us/cpp/cpp/m128), but I quickly
realized it wouldn't be possible to utilize this type in my MCVE. For the MCVE
to properly report its results, it would need to access the values in specific
XMM registers. Using `__m128` would allow me to coax MSVC into generating code
using XMM registers, but it wouldn't allow me to specify exactly which register
to use for a given operation.

With that failure, the only option I had left was to write my own assembly code.
Fortunately, writing assembly code as a complete novice in 2023 is significantly
easier thanks to tools like ChatGPT. After a brief conversation with ChatGPT and
some small manual tweaks, I had a basic `.asm` file that would let me read and
write to an XMM register:
```nasm
section .text

global getXmmRegister0
global setXmmRegister0

getXmmRegister0:
    movups [rcx], xmm0
    ret

setXmmRegister0:
    movups xmm0, [rcx]
    ret
```

> Interested in learning more about how ChatGPT can be leveraged in different
> software engineering work? I've written about AI tools as part of my
> [Leveraging AI-Assisted Coding]({% post_url AiTools/2023-08-08-ai-assisted-coding-part-1 %})
> series of posts.

The problem is, since it isn't possible to specify the register to target via
a parameter, I would need to duplicate the method for each XMM register. So,
rather than copy-paste the assembly code and manually adjust it for registers
0-15, I embedded the code in a
[Python script](https://github.com/zkWildfire/OpenSslMcve/blob/3d42bc1a133ad02764d1ebb7170af653080697d2/generate_asm.py#L10).
Since I was already using CMake to compile my MCVE code, it was easy to add
a custom command to run the Python script as part of the compilation process
and add the generated .asm files to the compilation. I also had the Python
script generate a header file that declared each generated method, allowing me
to call into the methods from C++.

With this hurdle overcome, I was now able to read and write to specific XMM
registers from C++:
```
XMM0: 0 0 0 0
XMM1: 0 0 0 0
XMM2: 0 0 0 0
XMM3: 0 0 0 0
XMM4: 0 0 0 0
XMM5: 0 0 0 0
XMM6: 24 25 26 27
XMM7: 28 29 30 31
XMM8: 32 33 34 35
XMM9: 36 37 38 39
XMM10: 40 41 42 43
XMM11: 44 45 46 47
XMM12: 48 49 50 51
XMM13: 52 53 54 55
XMM14: 56 57 58 59
XMM15: 60 61 62 63
```

## Shall We Dance?
Now that the XMM register code was working, I needed a way to trigger the buggy
code path to be executed. Seeing as I knew the methods that needed to be
invoked, I first wondered if I could simply call the poly1305 methods directly.
That turned out to be a dead end though as those methods are not part of
OpenSSL's API.

I knew that it would be possible to hit the buggy code path if I set up a
server and client using the same code from work, but it was a path I didn't
want to go down. Adding in a server and a client would significantly increase
the complexity of the test app. Plus, I've never used OpenSSL directly before,
so I wouldn't know which OpenSSL methods were necessary and which were ones
I could omit in the MCVE. Rather than wrestle with that approach, I figured
that there had to be a way to simply encrypt a buffer in memory. After all,
OpenSSL would need to do that as part of encrypting and sending data to a remote
machine. That train of thought lead me to
[a post](https://wiki.openssl.org/index.php/EVP_Symmetric_Encryption_and_Decryption)
on the OpenSSL wiki that provided example code for exactly what I had in mind.

After verifying that I could compile the code from the OpenSSL wiki page, I
set about modifying it to fit my requirements. It was easy to identify where
the example code specified the encryption algorithm to use, but I didn't know
what other encryption algorithms were available. Not only that, but I also
didn't know which algorithm would cause OpenSSL to enter poly1305 code. Or
rather, I didn't, until I did a quick search and came across the conveniently
named `chacha20_poly1305` algorithm.

I modified the example code I'd taken from the OpenSSL wiki to use the
`chacha20_poly1305` algorithm, then updated the code to make use of my XMM
register code. But now I had a different problem. Neither my desktop nor my
laptop's CPU was capable of running AVX-512 instructions. How was I going to
check if I could replicate the bug?

## I've Got 512 Problems But a CPU Ain't One
Conveniently, Intel provides a tool called the
[Software Development Emulator](https://www.intel.com/content/www/us/en/developer/articles/tool/software-development-emulator.html).
This tool allows any process to be executed under the emulator, which can be
configured to emulate released Intel CPUs among other things. However, CPU
emulation is an extremely complex process and any process run under the emulator
runs significantly slower (unsurprisingly). As a result, it wasn't usable with
a modified unit test from work that could trigger the bug.

With my MCVE, this significant slowdown was a non-issue. The point of an MCVE
is to minimize the amount of code required to reproduce a bug. As a result,
my MCVE could run to completion in a handful of seconds despite running under
the emulator. And importantly, it confirmed that my MCVE reproduced the bug:

```
Pre-Encrypt long string register state:
XMM0: 0 0 0 0
XMM1: 0 0 0 0
XMM2: 0 0 0 0
XMM3: 0 0 0 0
XMM4: 0 0 0 0
XMM5: 0 0 0 0
XMM6: 24 25 26 27
XMM7: 28 29 30 31
XMM8: 32 33 34 35
XMM9: 36 37 38 39
XMM10: 40 41 42 43
XMM11: 44 45 46 47
XMM12: 48 49 50 51
XMM13: 52 53 54 55
XMM14: 56 57 58 59
XMM15: 60 61 62 63

Post-Encrypt long string register state:
XMM0: 0 0 0 0
XMM1: 0 0 0 0
XMM2: 0 0 0 0
XMM3: 0 0 0 0
XMM4: 0 0 0 0
XMM5: 0 0 0 0
XMM6: 0 0 0 0
XMM7: 0 0 0 0
XMM8: 0 0 0 0
XMM9: 0 0 0 0
XMM10: 0 0 0 0
XMM11: 0 0 0 0
XMM12: 0 0 0 0
XMM13: 0 0 0 0
XMM14: 0 0 0 0
XMM15: 0 0 0 0
```

## Stacking It Up
After I succeeded in replicating the bug, I began wondering... how viable would
it be for me to patch the bug? I'd already looked at a bunch of the OpenSSL
assembly code and had a basic understanding of the issue. And with the MCVE
working correctly, I had a way to verify any fix I came up with.

My first attempt at fixing the bug was to insert the same register save and
restore code used elsewhere in OpenSSL code. For example, the .asm file with
the poly1305 assembly code had blocks like these:
```nasm
$L$do_avx:
    lea r11,[((-248))+rsp]
    sub rsp,0x218
    vmovdqa XMMWORD[80+r11],xmm6
    vmovdqa XMMWORD[96+r11],xmm7
    vmovdqa XMMWORD[112+r11],xmm8
    vmovdqa XMMWORD[128+r11],xmm9
    vmovdqa XMMWORD[144+r11],xmm10
    vmovdqa XMMWORD[160+r11],xmm11
    vmovdqa XMMWORD[176+r11],xmm12
    vmovdqa XMMWORD[192+r11],xmm13
    vmovdqa XMMWORD[208+r11],xmm14
    vmovdqa XMMWORD[224+r11],xmm15
```
```nasm
    vzeroall
    movdqa xmm6,XMMWORD[80+r11]
    movdqa xmm7,XMMWORD[96+r11]
    movdqa xmm8,XMMWORD[112+r11]
    movdqa xmm9,XMMWORD[128+r11]
    movdqa xmm10,XMMWORD[144+r11]
    movdqa xmm11,XMMWORD[160+r11]
    movdqa xmm12,XMMWORD[176+r11]
    movdqa xmm13,XMMWORD[192+r11]
    movdqa xmm14,XMMWORD[208+r11]
    movdqa xmm15,XMMWORD[224+r11]
    lea rsp,[248+r11]
```

As the simplest possible solution, I tested a patch that added the exact same
code blocks but in the path that I knew was taken when using the AVX-512 code
path. Unfortunately but not unexpectedly, that simple fix didn't work.

In order to refine my fix, I walked through the full set of instructions that
were executed when taking the AVX-512 code path. My goal was to improve my
patch by tightening the region of code affected by my change, and to change the
way I was saving/restoring the XMM registers. I suspected that the issue was
that some other code was also using the `r11` register in this code path, so
I wanted to see if there was a different register I could use.

After mapping out the entire code path, I copied each section that was executed
into a separate file. This allowed me to search only the executed code for the
registers that were being used. By doing this, I realized that the code being
executed wasn't modifying the `rsp` register at all. Rather than use the `r11`
register to track whether the saved bits were being written to, I could simply
manipulate `rsp` and use it for both saving and restoring the registers' values.

Next, I looked through the assembly code and searched for where the first
instruction that overwrote a non-volatile register was. If you recall, the
crux of the issue is that the OpenSSL assembly code modifies the
non-volatile/callee-saved XMM registers without properly restoring them after
the OpenSSL method(s) return. So if I was going to save and restore the
registers properly, I would need to insert the save block before any
callee-saved register was overwritten.

After updating the patch to use `rsp` directly and after identifying the best
places to insert the new code, I tested my fix again. And this time... it worked!

```
Pre-Encrypt long string register state:
XMM0: 0 0 0 0
XMM1: 0 0 0 0
XMM2: 0 0 0 0
XMM3: 0 0 0 0
XMM4: 0 0 0 0
XMM5: 0 0 0 0
XMM6: 24 25 26 27
XMM7: 28 29 30 31
XMM8: 32 33 34 35
XMM9: 36 37 38 39
XMM10: 40 41 42 43
XMM11: 44 45 46 47
XMM12: 48 49 50 51
XMM13: 52 53 54 55
XMM14: 56 57 58 59
XMM15: 60 61 62 63

Post-Encrypt long string register state:
XMM0: 0 0 0 0
XMM1: 0 0 0 0
XMM2: 0 0 0 0
XMM3: 0 0 0 0
XMM4: 0 0 0 0
XMM5: 0 0 0 0
XMM6: 24 25 26 27
XMM7: 28 29 30 31
XMM8: 32 33 34 35
XMM9: 36 37 38 39
XMM10: 40 41 42 43
XMM11: 44 45 46 47
XMM12: 48 49 50 51
XMM13: 52 53 54 55
XMM14: 56 57 58 59
XMM15: 60 61 62 63
```

> You can see the entire set of changes my patch applies
> [here](https://github.com/zkWildfire/OpenSslMcve/blob/3d42bc1a133ad02764d1ebb7170af653080697d2/ports/fixed/openssl/windows/avx512.patch),
> on the MCVE's GitHub repository.

As part of making the fix, I also learned why I had seen other OpenSSL code
subtract a hex value that ended in `0x8` despite each XMM register having `0x10`
bytes. At the point where my patch's code executes, the stack pointer is set
to an address that ends in `8`. Without subtracting an extra 8 bytes, the
addresses that the registers' values would be moved to wouldn't be aligned,
and would therefore require using the `vmovdqu` instruction (move unaligned
packed integer values) instead of the `vmovdqa` instruction (move aligned
packed integer values) used elsewhere.

Also, since registers XMM0-XMM5 don't need to be saved, the patch I made could
save a bit of memory by using an offset of `0x00` for the first register instead
of `0x50`. However, since the existing save/restore blocks allocated the extra
space and started with an offset of `0x50`, I figured it'd be better to remain
consistent with the existing code than worry about wasting a handful of bytes
for a brief period of time.

## JMP 0xPARTTRES
This bug is a particularly tricky bug to test for as it requires a very specific
set of conditions to be true for it to trigger. Stay tuned for the next post,
which will dive into merging the fix into OpenSSL and the new tests that were
added that will prevent this issue from arising in the future!
