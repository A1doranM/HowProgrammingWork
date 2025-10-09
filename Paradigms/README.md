# Programming Paradigms Comparison

* Imperative Programming
  + Characteristics: statements mutate program state directly (let, loops, assignments)
  + Architecture Influence: stateful services, command-driven architecture
* Procedural Programming
  + Characteristics: step-by-step, linear control flow, mutable state
  + Architecture Influence: transaction script, single responsibility units, shallow call graphs
* Object-Oriented Programming
  + Characteristics: classes/objects, encapsulation, inheritance, polymorphism
  + Architecture Influence: DDD, layered architecture, clean architecture, hexagonal
* Prototype-based Programming
  + Characteristics: objects inherit from other objects, delegation over inheritance
  + Architecture Influence: flexible object composition, dynamic plugin systems
* Functional Programming
  + Characteristics: pure functions, immutability, no shared state, higher-order functions, pattern matching, curry, single argument functions, composition
  + Architecture Influence: functional pipelines, stateless services, async stream processing
* Closure-based Programming
  + Characteristics: functions hold private state via closures, encapsulated behavior
  + Architecture Influence: lightweight encapsulation, reactive units, factory patterns
* Actor Model
  + Characteristics: message passing, no shared memory, isolated context, transparent concurrency units
  + Architecture Influence: distributed systems, concurrency-safe services, microservices
* Structural Programming
  + Blocks, No goto
* Declarative Programming
  + Characteristics: emphasizes what over how, side-effect free, high-level code, DSLs, self-descriptive
  + Architecture Influence: configuration-over-code, rule engines
* Contract programming
  + Characteristics: difine contracts
  + Architecture Influence: stable and clear, self-descriptive
* Reactive Programming
  + Characteristics: observable streams, event-driven, push-based, backpressure-aware
  + Architecture Influence: UIs, data stream processing, feedback loops, real-time pipelines
* Finite-State Machines / Automata
  + Characteristics: explicit states, transitions, events, deterministic flow
  + Architecture Influence: workflow engines
* Metaprogramming
  + Characteristics: code generation, reflection, macros, introspection
  + Architecture Influence: high flexibility, scaffolding
