
<!---->

This document describes a reasonable architectural approach for building and maintaining **state-heavy user interfaces**.

It is intended for applications where significant behaviour, state transitions, external data, user interaction, and UI composition need to remain understandable over time.

The approach is not presented as the only valid way to structure a front end, nor is every part necessary for small or largely static interfaces. It becomes more useful as application state, domain behaviour, testing requirements, and team size increase.

The architecture is framework-agnostic and can be applied across technologies such as React, Vue, Angular, and React Native.

Its main goals are to provide:

- explicit contracts;
- predictable dependency direction;
- clear separation between UI, application state, and external systems;
- isolated component and view development;
- deterministic mocking;
- testable composition;
- architectural constraints that can be enforced automatically.

The approach is strongly oriented around documented schemas and is therefore particularly well suited to TypeScript.

---

## 1. TypeScript and Schema Integrity

The use of **TypeScript is strongly recommended**.

A significant part of this architecture depends on clearly established, documented, and reusable schemas.

Component props, actions, helper types, application models, service contracts, and other data structures should have explicit definitions that can be inspected and validated during development.

TypeScript provides a natural foundation for this because these contracts can exist directly alongside the implementation and be checked statically throughout the codebase.

### When TypeScript Is Not Available

The architecture can still be applied without TypeScript, but equivalent safeguards become essential.

If TypeScript or another suitable static type system cannot be used, the project should have a strong combination of:

- structural testing;
- runtime schema validation;
- automated tests that verify expected data shapes;
- validation at relevant system boundaries.

The purpose of these safeguards is to prevent documented schemas from drifting away from implementation reality.

A schema should not merely describe what the application is *supposed* to accept. There must be a reliable mechanism for establishing that the data actually flowing through the system conforms to that schema.

The underlying principle is:

**Defined schemas and implementation reality must remain aligned.**

TypeScript is the preferred mechanism for maintaining that alignment, but it is not the only possible mechanism.

---

## 2. Source Structure

Application code will usually live inside a `src` directory.

The codebase should generally be divided into the following architectural areas:

```text
src/
  components/
  views/
  models/
  schemas/
  services/
  utilities/
```

These directories represent distinct architectural responsibilities.

### `components`

Contains reusable user-interface components.

Components focus on:

- rendering;
- interaction;
- local UI behaviour.

A component may contain its own:

- implementation;
- schema;
- helpers;
- nested components;
- demo;
- testing configuration;
- scoped styles.

Components do not directly interact with models or services.

### `views`

Contains page-level or screen-level composition.

Views combine components with models to produce larger pieces of application functionality.

They commonly correspond to:

- routes;
- screens;
- substantial application states;
- major UI compositions.

Views are also where application models become available to the UI through the dependency-injection mechanism appropriate to the framework.

### `models`

Contains application and domain models.

Models represent application-level state and behaviour independently of the presentation layer.

For a state-heavy interface, models provide an important boundary between:

- external systems;
- application state and behaviour;
- the UI that displays and manipulates that state.

Models may use services, but the concrete services they use are supplied to them when the models are created.

### `schemas`

Contains shared schemas and type definitions that are not owned by an individual component.

Schemas are foundational dependencies and may be used throughout the application.

Shared schemas should also provide a standard means of generating or retrieving mocked variations for development and testing.

Component-specific schemas remain colocated with their component rather than being moved into the global `schemas` directory solely because they contain TypeScript definitions.

### `services`

Contains integrations with systems and capabilities outside the immediate presentation layer.

Depending on the application, this may include:

- HTTP APIs;
- persistence;
- browser or platform APIs;
- authentication;
- storage;
- external SDKs;
- device capabilities;
- other external data sources.

Services should remain low in the dependency hierarchy and should not know about models, components, or views.

Each service should be created through a factory function, with a corresponding factory for creating mocked implementations.

### `utilities`

Contains general-purpose functionality that does not belong specifically to a component, view, model, or service.

Utilities are foundational and may be used throughout the application.

---

## 3. Dependency Architecture

The dependency graph is deliberately constrained.

These restrictions should normally be **automatically enforced** rather than relying on developers to remember architectural conventions.

A tool such as **dependency-cruiser** can be used to validate the dependency graph and detect violations during development or CI.

At a high level:

```text
                         views
                       /       \
              components       models
                                  |
                               services


              schemas         utilities

             available throughout
```

The main application dependency flow is:

```text
views → models → services
   |
   └────→ components
```

Schemas and utilities form foundational dependencies that can be consumed throughout the architecture.

### Allowed Dependencies

| Source       | May use                                        |
| ------------ | ---------------------------------------------- |
| `services`   | `schemas`, `utilities`                         |
| `components` | `schemas`, `utilities`                         |
| `models`     | `services`, `schemas`, `utilities`             |
| `views`      | `components`, `models`, `schemas`, `utilities` |

### Services

Services may use:

- schemas;
- utilities.

They must not depend on:

- models;
- components;
- views.

```text
services → schemas       ✓
services → utilities     ✓

services → models        ✗
services → components    ✗
services → views         ✗
```

### Components

Components may use:

- schemas;
- utilities.

They must not directly depend on:

- services;
- models;
- views.

```text
components → schemas     ✓
components → utilities   ✓

components → services    ✗
components → models      ✗
components → views       ✗
```

This keeps components independently renderable.

A component receives the information and actions it requires through its defined interface rather than reaching directly into application infrastructure or state management.

### Models

Models may use:

- services;
- schemas;
- utilities.

They must not depend on:

- components;
- views.

```text
models → services        ✓
models → schemas         ✓
models → utilities       ✓

models → components      ✗
models → views           ✗
```

Models therefore become the natural location for stateful application behaviour without coupling that behaviour to a particular rendering framework.

### Views

Views may use:

- components;
- models;
- schemas;
- utilities.

```text
views → components       ✓
views → models           ✓
views → schemas          ✓
views → utilities        ✓
```

Views form the primary UI composition layer.

### Enforcing the Dependency Tree

These rules should be represented as machine-readable architectural constraints.

For example, dependency-cruiser should reject:

```text
components → services
```

while accepting:

```text
models → services
views → models
views → components
```

The architecture should therefore not exist solely as documentation.

**The dependency graph itself should be executable documentation.**

---

## 4. Schemas and Mock Variations

Schemas are not only type definitions.

They should also provide the basis for creating representative data variations.

Each shared schema should provide a consistent mechanism for creating mocked instances that conform to that schema.

These variations should represent meaningful states rather than arbitrary data.

For example:

```ts
type User = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

const createMockUser = (
  variation: 'default' | 'without-avatar' | 'long-name'
): User => {
  // ...
};
```

Possible variations might include:

- default;
- empty;
- minimal;
- complete;
- long content;
- edge cases;
- state-specific examples where relevant.

The exact API is less important than the principle:

**Mock data should originate from the same schema contract as production data.**

This allows mock variations to be reused across:

- component demos;
- Storybook;
- service mocks;
- model tests;
- view-level tests;
- automated interaction tests.

In a state-heavy application, this is particularly valuable because complex application states can be represented intentionally rather than reconstructed repeatedly in individual tests.

---

## 5. Service Factories

Services should not be instantiated ad hoc throughout the application.

Each service should expose a **factory function** responsible for creating the real service implementation.

Conceptually:

```ts
const createProjectService = (
  config: ProjectServiceConfig
): ProjectService => {
  // ...
};
```

The factory provides a central composition point for any configuration or infrastructure the service requires.

### Mock Service Factories

Each service should also provide a corresponding factory for creating mocked service implementations.

```ts
const createMockProjectService = (
  options?: MockProjectServiceOptions
): ProjectService => {
  // ...
};
```

Both factories return implementations conforming to the same contract:

```text
createProjectService()
        │
        ├──→ ProjectService
        │
createMockProjectService()
        │
        └──→ ProjectService
```

Consumers therefore depend on the service contract rather than whether the implementation uses:

- a real HTTP API;
- local storage;
- an external SDK;
- in-memory data;
- deterministic fixtures;
- another test implementation.

Mock service factories should normally use the mock facilities provided by the project's schemas when creating data.

```text
schema mock variations
        ↓
mock service factory
        ↓
mock service
```

---

## 6. Models and Application State

Models are the primary architectural layer for representing application-level state and behaviour.

This is particularly important in **state-heavy user interfaces**, where substantial behaviour can otherwise become distributed across UI components, framework hooks, event handlers, API calls, and route-level logic.

A model provides a place to represent:

- state;
- derived state;
- state transitions;
- asynchronous operations;
- interactions with services;
- domain behaviour;
- application-level actions.

The intention is not necessarily that every piece of local UI state belongs in a model.

Small, ephemeral presentation concerns can remain local to components.

Models become more valuable when state is:

- shared between multiple components;
- persistent across substantial UI interactions;
- dependent on external data;
- subject to meaningful transitions;
- associated with domain behaviour;
- difficult to reason about when embedded directly in the view layer.

This makes the architecture a reasonable approach to maintaining interfaces where application state is one of the main sources of complexity.

---

## 7. Dependency Injection

The static dependency tree defines which architectural layers may know about one another.

At runtime, those dependencies are supplied through **dependency injection**.

There are two important injection boundaries.

### Services Are Injected Into Models

A model may depend on one or more services, but it should not create those services internally.

Services are passed into the model when the model is created.

Conceptually:

```ts
const model = new ProjectModel({
  projectService,
  userService,
});
```

The exact syntax may vary.

The principle is:

**Models declare the services they require, while application composition decides which concrete implementations they receive.**

Production code might use:

```text
createProjectService()
        ↓
ProjectModel
```

while a test or Storybook scenario can use:

```text
createMockProjectService()
        ↓
ProjectModel
```

The model does not need to know which implementation it received.

### Models Are Injected Into Views

Views receive models through the dependency-injection mechanism appropriate to the framework.

Examples include:

- React Context;
- Vue `provide` / `inject`;
- Angular dependency injection;
- equivalent mechanisms in other frameworks.

Conceptually:

```text
services
   ↓
model creation
   ↓
dependency injection
   ↓
views
   ↓
components
```

A view therefore consumes application state without being responsible for constructing the infrastructure behind it.

---

## 8. Testable Composition

Dependency injection, schema mocks, service factories, and models combine to form a predictable testing architecture.

A typical isolated view scenario can be assembled as:

```text
schema mock variations
        ↓
mock service factories
        ↓
mock services
        ↓
models
        ↓
dependency injection
        ↓
view
        ↓
components
```

Because services are supplied to models, production infrastructure can be replaced without changing application behaviour code.

Because models are injected into views, the same views used by the application can be rendered in isolation.

This means that **views can be developed and tested in Storybook**, not only individual components.

A Storybook scenario can:

1. select relevant schema variations;
2. create mocked services;
3. create the required models using those services;
4. inject the models;
5. render the view;
6. run interaction tests against the resulting UI.

### Component Testing

```text
schema mocks / demo fixtures
        ↓
component props
        ↓
component
```

### View Testing

```text
schema mocks
      ↓
mock services
      ↓
models
      ↓
view
      ↓
components
```

This makes increasingly stateful parts of the application testable without requiring production infrastructure.

---

## 9. Component Development Environment

Every component must be independently viewable and testable outside of the application in which it is ultimately used.

A component development environment is therefore **non-negotiable**.

For web applications, Storybook is the default choice where the framework supports it well.

This applies particularly to:

- React;
- Angular;
- Vue;
- similar component-based frameworks.

The specific tool is less important than the architectural principle:

**A developer must be able to render and interact with a component without navigating through the application that consumes it.**

Because components do not depend on services or models, they can be rendered entirely from their defined props and actions.

### Views in Storybook

The isolated development environment is not limited to components.

Views should also be renderable in Storybook where practical.

The required models are provided using the normal dependency-injection mechanism, with those models backed by mocked services.

This allows state-heavy application scenarios to be reproduced without real infrastructure.

### React Native

React Native does not necessarily require Storybook.

A lightweight development environment is sufficient.

This can simply be a development-only view containing a switch statement that renders specific demos.

Component demonstration files use a `demo` suffix and are selected from this development environment.

The requirement is not Storybook itself.

The requirement is that **components and relevant application states can be developed and inspected in isolation**.

---

## 10. Component Structure

Each component owns the files and supporting code required to describe its interface, implement its behaviour, demonstrate its possible states, test those states, and define its presentation.

A component can contain:

- the primary component implementation;
- a schema file;
- a helpers file;
- nested components;
- a demo file;
- a testing file;
- component-scoped styling.

Nested components belong to the parent component when they exist specifically to support that component rather than representing independently reusable application components.

Component-specific concerns should remain colocated wherever practical.

A type, helper, style, or nested UI element should not be moved into a global location merely because it could technically be shared.

---

## 11. Component Schemas

Every component has an explicit schema.

For TypeScript projects, this schema is defined in a dedicated TypeScript schema file.

The schema acts as the documented contract for the component and contains three primary categories:

- Props;
- Helpers;
- Actions.

### Props

Props describe the values supplied to the component by its consumer.

They define the external data and configuration required or accepted by the component.

### Helpers

Helper schemas describe supporting structures associated with the component.

These may represent internal data structures or other types needed to express the component's behaviour.

### Actions

Action schemas describe interactions exposed by the component to its consumer.

They represent meaningful things that can happen through interaction with the component and form part of its public contract.

Keeping these definitions together makes the component interface discoverable without requiring a developer to reverse-engineer it from the implementation.

---

## 12. Component Styling

Styling should be **scoped to the component** by whatever mechanism is appropriate for the framework or platform being used.

The goal is to ensure that a component's styles deliberately affect that component rather than leaking unpredictably into unrelated parts of the application.

Suitable mechanisms may include:

- CSS Modules;
- framework-provided style encapsulation;
- scoped styles;
- CSS-in-JS systems with component-level scoping;
- Shadow DOM;
- other reliable scoping mechanisms.

The specific technology is less important than the principle:

**A component should own its styles, and those styles should have a predictable scope.**

### When Style Scoping Is Not Available

If the framework or styling system cannot provide reliable component-level scoping, naming conventions must be used to prevent collisions.

A methodology such as **BEM** can be used to namespace selectors and make ownership explicit.

```css
.profile-card {}
.profile-card__title {}
.profile-card__avatar {}
.profile-card--compact {}
```

The component's root name effectively becomes a namespace for its styles.

The fallback principle is:

**If styles cannot be technically scoped, they must be conventionally namespaced.**

---

## 13. Component Demos

Each component has a dedicated `demo` file describing how the component should be presented in the component development environment.

For Storybook-based projects, this file acts as the configuration for the component's stories and interactive controls.

The demo should represent intentional, meaningful states rather than exposing every prop as an unrestricted playground.

### Fixture-Driven Props

Props should not generally be exposed as arbitrary free-form values in the component demo.

Instead, demos provide predefined representative values.

Where a prop can take several meaningful data structures, Storybook controls should expose those through selectable options such as dropdowns.

Where possible, these predefined values should use the mock variations provided by the application's schemas.

For example:

```text
User schema
   ↓
default
without-avatar
long-name
   ↓
Storybook dropdown
```

This makes demos deterministic and ensures that the states exposed in Storybook correspond to scenarios the component is intentionally designed to support.

The demo serves two related purposes:

1. **Documentation** — it communicates the states and inputs the component supports.
2. **Fixtures** — it provides stable example data for development and testing.

---

## 14. Component Testing

Alongside its demo, each component has a dedicated testing file.

Automated component interaction tests are written using **Playwright**.

The component development environment and automated tests should reflect the same component contract.

For components, this creates a progression from:

**Typed schema → schema mock variations → demo configuration → rendered component → automated interaction tests**

For stateful views, it extends to:

**Schema mocks → mock service factories → models → dependency injection → view → components → automated interaction tests**

This means both individual UI elements and substantial application states can be exercised in controlled environments.

---

## 15. Why This Approach Is Useful for State-Heavy Interfaces

The primary problem this architecture attempts to address is not component rendering.

It is **maintaining understandable boundaries as application state becomes increasingly complex**.

Without explicit boundaries, state-heavy applications can gradually accumulate:

- API access inside components;
- application state distributed across unrelated hooks or framework constructs;
- tightly coupled views and infrastructure;
- difficult-to-reproduce UI states;
- test fixtures that differ from production contracts;
- components that can only be rendered inside the complete application;
- dependencies that flow in both directions;
- application behaviour that becomes inseparable from the rendering framework.

This architecture attempts to provide a reasonable alternative by establishing a clear flow:

```text
schemas
   ↓
services
   ↓
models
   ↓
views
   ↓
components
```

with utilities available as foundational support and dependency injection connecting the runtime pieces.

Mocks follow the same architecture:

```text
schema variations
       ↓
mock services
       ↓
models
       ↓
views
       ↓
components
```

As a result, production behaviour and test behaviour share the same contracts and composition model.

The approach is therefore particularly appropriate when maintaining a state-heavy user interface where **predictability, isolation, reproducibility, and explicit boundaries are more valuable than minimizing architectural structure**.

-->