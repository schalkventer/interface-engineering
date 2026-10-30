---
title: Model/Schemas
---

# Data Modelling

Probably the most prominent, and notable feature of my personal way of
structuring and scaling interaction-heavy interfaces is a strict adherence to
having clear and documented schemas as the primary source of truth and meaning
across the entire codebase. My primary inspiration for this approach is a
methodology known as "Data-Oriented Programming", which I first encountered in
Yehonathan Sharvit's, 2022 book title of the same name.

In summary, the approach can be described as a departure from traditional Object
Oriented and Functional Programming paradigms as follows:

- In traditional Object Oriented Programming, data and behaviour are
  encapsulated and co-located into self-contained units of meaning (objects).
- In Functional Programming, behaviour is split from data into small atomic
  units of meaning meant to be composed to create larger meaning (functions).

Data-Oriented Programming, broadly adheres to the latter functional programming
paradigm by separating data from behaviour. However, unlike traditional
Functional Programming, it does not treat functions as the primary unit of
meaning in a codebase. Instead it treats data itself as the primary way in which
meaning is expressed and reasoned about throughout the application. The four
principles of DOP can be described as follows:

1. Separate behaviour from data.
2. Represent data with generic structures.
3. Treating data as immutable.
4. Split data schemas from representation.

## Schema and Helper Files

This means that most modules and component in my codebase have the actual
implementation logic separated from `.schema.ts`/`.helper.ts` files or `schema`
and `helper` folders (#1).

In fact, I usually start creating these schemas directly in Figma using a
code-block snippet as a TypeScript `type` with extensive `JSDoc` comments,
before I start doing any design or wireframing.

The schema files should always express data in a manner that can be serialized
into strings and passed around between API boundaries. This means no usage of
`Map`, `Set` or memory pointers that will be broken by serialization (#2).
Furthermore, helper files should always return new data, and never mutate
provided data directly in place (#3). 

Lastly, recurring data structures should be documented as straight-forward
object-based schemas, regardless whether it represents a reactive data store,
configuration constants, domain modelling, dispatched events, component
properties, or mapped relationships. For example:
