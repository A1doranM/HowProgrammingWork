# IndexedDB Examples

## Quick start

1. Install dependencies `npm i`; optionaly run tests: `npm t`
2. Start server `node server <folder>` for example: `node server Pragmatic`
3. Open in browser: [`http://127.0.0.1:8000/`](http://127.0.0.1:8000/)

## Compare 3 implementations

- Native: pure indexedDB API
  - Goal: fast, minimal, no intermediate abstractions layer, everything just hardcoded in imperative code without abstractions
  - No schemas, just raw `indexedDB.open`, `transaction`, `objectStore`, logic written inline per action
  - Structure: single file
  - Pros: fully transparent usage of IndexedDB
  - Cons: unable to write unittests, no reusability, poor maintainability
- Enterprise: wrapper for indexedDB API with ceremonies overhead
  - Goal: maximum DDD and Cleal/Layered architecture compliance and code maintainability
  - Abstractions for every responsibility: Database, Repository, Service, UserModel, UserRepository, UserService, Logger
  - Utilities like `exec()` to improve domain code readability and semantics
  - Actions with autobinding to UI: `action(id, callback)`
  - Structure: splitted in 4 modules, multiple classes
  - Pros: testable, proper Separation of Concerns, validation, UI actions, extendable logic
  - Cons: verbose, ceremonies, boilerplate, cognitive heavy, slower to write, overhead for simple apps
- Pragmatic: wrapped indexedDB API with DSL without ceremonies
  - Goal: minimal yet structured and reusable IndexedDB access
  - Wrapped indexedDB API with DSL for queries and scemas, but without ceremonies, minimal pragmatic solution: just Database and Logger
  - Actions actions with autobinding to UI still via `action(id, handler)`, Logger class reused from `Enterprise` implementation
  - Structure: 2 modules (for db wrapper and for domain code)
  - Declatative DSLs (Domain Specific Language), like:
    - Queries: `db.select({ store: 'user', where: { age: 18 }, order: { name: 'asc' } });`
    - Schemas: `{ user: { id: { type: 'int', primary: true }, name: { type: 'str'...`
  - Pros: low ceremony, readable and maintainable, declaratice queries and schemas
  - Cons: DSL adds learning curve, SRP (Single Responsibility Principle) and SoC (Separation of Concerns) partially compliance

## License & Contributors

Copyright (c) 2025 How.Programming.Works contributors
