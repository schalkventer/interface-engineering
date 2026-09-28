# Interface Engineering

**A mostly reasonable approach to scaling front-end applications**

## Introduction

This document is maintained by myself, [Schalk Venter](https://schalkventer.me/). A software engineer and interaction designer based in Cape Town, South Africa. I've been designing, maintaining and leading teams that work on extremely interactive and highly stateful user-facing interfaces over the past decade. 

This document aims to be a living, evolving document, in which I attempt to codify and share some personal approaches and heuristics I've developed over this period. The following effectively outlines how I approach any user-facing project that has significant state and interaction complexity, regardless of tooling and tech-stack that might be used.

To that end it is important to note that this approach generally does not work that well in applications that have little interface complexity. In the case of the latter I would consider a completely different set of tools and approaches.

# Schema-Driven Architecture

Probably the most prominent, and notable feature of my personal way of structuring and scaling interaction-heavy codebases is a strict adherence to having clear and documented schemas serve as primary source of truth and meaning across the entire codebase. My primary inspiration for this approach is a methodology known as "Data-Oriented Programming", which I first encountered in Yehonathan Sharvit's, 2022 book title of the same name.

In summary, the approach can be described as a departure from traditional Object Oriented and Functional Programming paradigms as follows:

- In traditional Object Oriented Programming, data and behaviour are encapsulated and co-located into self-contained units of meaning (objects).
- In Functional Programming, behaviour is split from data into small atomic units of meaning meant to be composed to create larger meaning (functions).

Data-Oriented Programming, broadly adheres to the latter functional programming paradigm by separating data from behaviour. However, unlike traditional Functional Programming, it does not treat functions as the primary unit of meaning in a codebase. Instead it treats data itself as the primary way in which meaning is expressed and reasoned about throughout the application. The four principles of DOP can be described as follows:

1. Separate behaviour from data.
2. Represent data with generic structures.
3. Treating data as immutable.
4. Split data schemas from representation.

## Schema and Helper Files

This means that most modules and component in my codebase have the actual implementation logic separated from `.schema.ts`/`.helper.ts` files or `schema` and `helper` folders (#1).

The schema files should always express data in a manner that can be serialized into strings and passed around between API boundaries. This means no usage of `Map`, `Set` or memory pointers that will be broken by serialization (#2). Furthermore, helper files should always return new data, and never mutate provided data directly in place (#3). 

Lastly, recurring data structures should be documented as straight-forward object-based schemas, regardless whether it represents a reactive data store, configuration constants, domain modelling, dispatched events, component properties, or mapped relationships. For example:

```

```
