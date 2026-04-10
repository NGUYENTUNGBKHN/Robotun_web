POSTS_DATA.push({
  id: "explore_mm_pool_c_c_plus",
  title: "Explore memory pool in C and C++",
  excerpt: "Explore memory pool in C and C++",
  date: "2026-04-10",
  author: "Gentantun",
  tags: ["algorithm"],
  content: `## Introduction


1. What is a memory pool?


A memory pool (also called an arena allocator or slab allocator) is a pre-allocated block of memory from which smaller allocations are carved out, bypassing the general-purpose heap (malloc/new) for specific allocation patterns. The key idea: pay the OS allocation cost once, then distribute memory internally at near-zero cost


> Arena allocator : a memory management strategy where a large block of memeory is pre-allocated upfront, and individual object are "carved out" of it sequentially



2. Why use one?


The problem with *malloc/new* :


- Framentation : repeated alloc/free cycles fragment the heap, wasting memory.


- Overhead - each call has metadata, locking (thread-safe heap), and system call overhead.


- Unpredictable latency : heap growth can trigger sbrk/mmap at arbitrary times


- Cache misses : heap-allocated objects are scattered across memory.


=> Memory pool can sovle all of these for constrained, repetitive allocation patterns.


## Core type of memory pool


let me illustrate each type:


1. Linear allocator (arena)
Bump a pointer forward on each alloc, free everything at once.`
});