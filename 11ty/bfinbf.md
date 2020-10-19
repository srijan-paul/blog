---
layout: post.njk
tags: ['brainfuck', 'programming-languages', 'post']
title: 'Compiling to Brainf#ck - Meep.'
---

## Alternate Title: Writing a brainfuck interpreter in brainfuck, the stupid way. 

Brainfuck is one of the very first esoteric programming languages that gained popularity.
Esoteric languages are "for fun only" and not for serious use (but that didn't stop a lot of people).
Most esoteric programming languages are simple, have a very limited instruction-set/syntax and most
importantly, they all are very, very different from your conventional programming language.

In this post, I attempt to write a programming language that compiles to brainfuck, and then write an 
interepreter for brainfuck in our new language, compile it and have a brainfuck interpreter in brainfuck! 
(Not the brightest means to the end, I know. But it's a good way of testing our implementation).

## The What - Brainfuck

The Brainfuck programming language's syntax contains a total of 8 characters (yes, 8).
Brainfuck models an imaginary machine, with an infinitely long memory tape.

<img src="..\assets\img\brainfuck\1.png"></img>

Each cell in this tape is a byte long and initially set to zero.
We also have a data pointer, which I drew as an arrow below the tape. It points to the current data cell under inspection.
The programmer moves this data pointer around in the tape, incrementing and decrementing the values in the cells.

The 8 instructions we talked about earlier are the following:

`+` - increment the value at the current data pointer by one.

`-` - decrement the value at the current data pointer by one.

`>` - move the data pointer one cell to the right.

`<` - move the data pointer one cell to the left.

`.` - print the value at the current data pointer as an ascii character.

`,` - take one byte of input from the user and put it in the current cell.

`[` - if the value at the current data pointer is 0, skip the corresponding `]`, else continue from the next instruction.

`]` - if the value at the current data pointer is non-zero, jump back to the correspondong `[`, else continue on to the next instruction

And that's all. This might seem like a very limited instruction set, and it is, but brainfuck is a turing-complete programming language.
Meaning, if a solution exists to a computational problem, It is theoretically possible find it with brainfuck. To know more about brainfuck,
I'd advise you to skim over [this](https://esolangs.org/wiki/Brainfuck) page.

Creating an interpreter for brainfuck is trivial, and you can finish one in a couple of hours. Brainfuck is easy to compile, but hard to *compile to*. And so I spend a weekend challenging myself to attempt the latter. 

## The Why

Because we can, really. Brainfuck **is** turing complete, so it *could* serve as a good compilation target. 
One weekend I found myself going through some brainfuck-derived languages, all of which added some spice to the language,
like having a 2D grid serve as a memory instead of the tape, and what not. Now programming in brainfuck is not my thing at all, I don't find 
the idea of solving problems with a tape of unsigned bytes fun, nor would I be good at it. However, it could work as an interesting thought experiment to see if one can compile a programming language down to such a limited instruction set, and to top it all off,
We could write a brainfuck interpreter in the language we invent, because why not ?

Now I had exams coming up, and a couple of other things to work on. So I wanted this to be done *fast*, no big promises, no kanban boards,
no to-dos and wishlists, just a simple, single pass compiler cobbled up in a weekend as a little prototype.


## The How - Meep

Here is the weekend-long implementation plan I came up with:

<ol>
<li>Write the language in Javascript, performance not a goal.</li> 
<li>Single pass, no AST involved, compile tokens to IR and IR to Brainfuck.</li> 
<li>Emulate a stack on brainfuck's memory tape, helps model a stack based VM-like architechture.</li> 
<li>Write a brainfuck interpreter in our language to test the implementation. </li> 
<li>Profit</li> 
</ol>

Now this is something I wanted to be done with in about 2-3 days at the longest, so I also put down some design goals for the language
that we're about to build.

- **As normal looking as possible** - It should look familiar to existing languages.
- **Minimal feature set** - It should support arrays, numbers, strings, if-else, looping. Just about what we need to
  write a brainfuck interpreter, it's a prototype after all.
- **Single pass** - The compiler _must_ be single pass. That poses some difficulties, and some restrictions. But we'll get over those.


## A Tour of meep

Like I mentioned earlier, it has byte sized numbers, arrays, strings, if-elses and while loops.
To an experienced brainfuck programmer, all this is probably very easy to get by.

```js
var message = "Hello!";
print(message); // Hello!
set message[2] = 'y'; 
print(message); // Heylo!

print('0' + len(message)) // 6

var char = 'a';
print(char);
set char = 'b';
print(char);

var bool = input == 'a';

if bool
    print "you entered the letter 'a'";
else 
    print "idk what you entered";

var i = 0;
while i < 10 {
    print 'a' + i;
    set i = i + 1;
}

```

No, it doesn't have functions, `print` is actually a statement, and `len` is a language feature. 
Though I might write another version of this with an additional pass, *with* functions and a simulated heap some day. 
This particular language still remains rushed and largely prototypical.


## How does it work ?

The path that a user written program takes in meep goes, 

source code -> **Tokenizer** -> tokens -> **IRCompiler** -> IR -> **Generator** -> Brainfuck

The IR stands for intermediate representation, it's kind of like assembly but instead of targeting a 
processor, it targets a compiler back end. It's dumbed down in complexity in comparison to an AST, is more 
lightweight. Usually, real programming language implementations first construct a syntax tree and then break it 
down into IR code (Exceptions exist, like Lua). For a small language though, we should be fine.

Now here are all the IR instructions at a glance: 

```c
  POP PUSH
  ADD SUB EQUALS
  SET_VAR GET_VAR
  FALSE_ TRUE_
  LOAD_BYTE PRINT START_IF CLOSE_IF_BODY
  END_IF START_ELSE END_ELSE START_LOOP END_LOOP
  POPN CMP_LESS CMP_GREATER LOAD_STRING MAKE_BUS
  INDEX_VAR NOT MAKE_SIZED_BUS SET_AT_INDEX INPUT
  LEN
```

Let's walk through a little program here and see the transformations it goes through :

```js
var bool = false;
if bool print 'a' else print 'b';
```

first it tokenizes to: 

```js
[
  'var',   'bool',  '=',
  'false', ';',     'if',
  'bool',  'print', "'a'",
  'else',  'print', "'b'",
  ';'
]
```

The tokens are then picked up by the IRCompiler which does the parsing and spits out
the following IR:

```js
// First, we push a `false` onto the stack, 
// this is the local variable `'bool'`.
// stack state: [0]
FALSE_
// Then we read from the variable, meaning we take the value at index 0 
// in the stack and push it again to the top [0, 0]
GET_VAR 0
// marks the beginning of an if-block,
// the part after this is executed if 
// the value on top of the stack is 
// true (non-zero)
START_IF
// push an 'a' onto the stack
LOAD_BYTE 97
// print the value at the top of the
// stack and pop it.
PRINT
CLOSE_IF_BODY
// the else block
// excutes of the if block didn't 
// I'll get to how I did this down later.
START_ELSE
// push 'b'
LOAD_BYTE 98
// print value at
// stack top
PRINT
END_ELSE
END_IF
```

And that finally turns into a bloated brainfuck file:

```js
>><[>+>+<<-]>>[<<+>>-]<>+<[>>+++++++++++++++++++++++++++++++++++++++++++++++++++
++++++++++++++++++++++++++++++++++++++++++++++.[-]<-<[-]]>[>++++++++++++++++++++
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.[
-]<[-]][-]<[-]<
```

The idea is to get the braifuck memory tape to  act as a stack that we can push to and pop from, 
then it's possible to get it to  act like a stack based VM. Variables are simply looked up 
by their index. 

I'll explain some of the challenges I came across and ones that you may have to fight 
if you ever choose to try something similar for whatever reason.


## Under the hood.

Lets get a few things established before moving on to the implementation.

1. The data pointer is used to point to the top of the stack, it is what you would call a "stack pointer".
It points to the top most value in the stack.

2. All the cells are initially zeroed out, so we have an empty stack which is about 30k bytes long in most 
implementations.

3. All statemnents must have a stack-effect of 0, meaning they shouldn't leave any unpopped values on the 
stack after they finish execution.

4. All expressions must have a stack effect of + 1, meaning they must leave the stack one value (not 1 byte or cell)
larger than it was before the expression was evaluated.

### Variables.

This is fairly easy, just push a value onto the stack (write `">" * n` where n is the value of the variable).
All statements *must* always leave the stack as big as it was before the statement was evaluated. 
This allows us to just use the `<` and `>` instructions to look up variable values. The number of variables
is always known at compile time, as is the order they appear in, so we can substitute every variable look-up
as just copying byte from a certain depth in the stack to the top. 

```js
var c = 'a';      // 1
print(c + 1);     // 2
set c = 'b';      // 3
print(c + 1 - 2); // 4
```
Line 1 - First, `'a'` is pushed to the stack (`[97]`). Since this value is never popped, it's a byte sized variable.


Line 2 - Then, we get the variable at index `0` and push it to the top (`[97, 97]`).
Push a `1` to the top of the stack (`[97, 97, 1]`), then pop the top two values, add them and push the result back (`[97, 98]`). 
Now we print the value at the top of the stack, and pop it right after (`[97]`)

See how we executed an entire statement, and yet the stack is exactly as long as it was on line 1 ?
Try going through the next 2 statements and you'll see the effect is exactly the same. This is true for 
all statements except variable declarations, which have a stack effect of +1, as they push one value onto it that just
stays there until the program terminates.

So how exactly do we push values on top of the stack, when the stack is really the brainfuck memory tape ? 
Simple, we use `>`, to move one step forward and then `+` to increment from 0 to the value of the variable.
So pushing a `5` is as simple as `">+++++"`.

Popping a byte however, can't just be done with `"<"` because when a new stack slot is occupied, it's assumed to be 0.
So we zero out all values before popping off. Henceforth, our instruction for popping a byte becomes `"[-]<"`.
Basically, decrement the value at stack pointer until it is 0, then move the stack pointer on step back.

