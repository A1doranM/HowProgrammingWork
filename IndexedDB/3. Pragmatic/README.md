# Pragmatic IndexedDB Implementation

## Overview

The Pragmatic implementation demonstrates a **balanced approach** to IndexedDB usage that sits between raw Native API usage and complex Enterprise architectures. It provides practical abstractions that make IndexedDB easier to work with while maintaining simplicity and avoiding over-engineering.

## Philosophy: The Pragmatic Middle Ground

This implementation embodies the "pragmatic" philosophy:
- **More abstracted than Native**: Clean class-based API, declarative query DSL, automatic schema management
- **Simpler than Enterprise**: Single-file database layer, no dependency injection containers, minimal architectural complexity
- **Production-ready**: Schema validation, proper error handling, transaction management, comprehensive testing
- **Developer-friendly**: Intuitive API, promise-based operations, flexible query options

## What This Example Demonstrates

### 1. **Clean Database Abstraction**
A single [`Database`](static/storage.js) class that wraps IndexedDB complexity:
- Automatic database initialization and version management
- Schema-based object store creation
- Promise-based operations (no callback hell)
- Transaction management abstracted away

### 2. **Schema Validation**
Declarative schema definitions with runtime validation:
```javascript
const schemas = {
  user: {
    id: { type: 'int', primary: true },
    name: { type: 'str', index: true },
    age: { type: 'int' },
  },
};
```

### 3. **Intuitive CRUD API**
Simple, consistent methods for all operations:
```javascript
await db.insert({ store: 'user', record: { name: 'Marcus', age: 20 } });
await db.get({ store: 'user', id: 1 });
await db.update({ store: 'user', record: user });
await db.delete({ store: 'user', id: 2 });
```

### 4. **Powerful Query DSL**
SQL-like query capabilities without the complexity:
```javascript
await db.select({
  store: 'user',
  where: { age: 20 },                    // Exact match filtering
  filter: (user) => user.age >= 18,      // Custom filter function
  order: { name: 'asc' },                // Sorting by field
  limit: 10,                             // Result pagination
  offset: 5,                             // Skip records
  sort: (a, b) => a.age - b.age,        // Custom sort function
});
```

### 5. **Modern JavaScript Patterns**
- ES6 classes with private fields (`#field`)
- Async/await for asynchronous operations
- ES modules for clean imports/exports
- Object destructuring for named parameters

## File Structure

```
IndexedDB/3. Pragmatic/
├── static/
│   ├── storage.js        # Core Database abstraction layer
│   ├── application.js    # Demo application using the Database
│   ├── index.html        # UI for the demo
│   └── styles.css        # Styling
├── test/
│   └── database.js       # Comprehensive test suite
└── package.json          # ES module configuration
```

## How the Files Work Together

### [`storage.js`](static/storage.js:1) - The Database Layer
The heart of the implementation. Provides:

**Core Class:**
- [`Database`](static/storage.js:1) - Main abstraction over IndexedDB

**Private Methods:**
- [`#open()`](static/storage.js:15) - Opens IndexedDB connection with version management
- [`#upgrade()`](static/storage.js:33) - Creates object stores and indexes from schemas
- [`#exec()`](static/storage.js:47) - Generic transaction executor
- [`#sort()`](static/storage.js:137) - Static sorting helper

**Public Methods:**
- [`validate()`](static/storage.js:64) - Schema validation for records
- [`insert()`](static/storage.js:81) - Add new records
- [`update()`](static/storage.js:86) - Update existing records
- [`delete()`](static/storage.js:91) - Remove records by ID
- [`get()`](static/storage.js:95) - Retrieve single record by ID
- [`select()`](static/storage.js:106) - Query records with DSL options

### [`application.js`](static/application.js:1) - Demo Application
Shows practical usage patterns:

**Components:**
- [`Logger`](static/application.js:3) - Utility class for displaying output
- Demo actions: `add`, `get`, `update`, `delete`, `adults` (filtered query)
- Event binding to UI buttons

**Demonstrates:**
- Database initialization with schemas
- CRUD operations in real application context
- Error handling with try/catch
- User interaction patterns

### [`test/database.js`](test/database.js:1) - Test Suite
Validates all functionality:

**Test Coverage:**
- Full CRUD operations (Create, Read, Update, Delete)
- DSL features: `where`, `filter`, `order`, `offset`, `limit`, `sort`
- Complex multi-option queries
- Edge cases and error conditions

**Testing Environment:**
- Uses Node.js built-in test runner
- `fake-indexeddb` for testing without browser
- Assertion-based validation

## Key Concepts Demonstrated

### 1. **Pragmatic Abstraction**
Hides IndexedDB complexity without creating architectural overhead:
- Single class handles all database operations
- No need for multiple service layers
- Direct, intuitive API

### 2. **Schema-Driven Development**
Schemas define structure and enable validation:
- Declarative type definitions
- Automatic index creation
- Runtime validation prevents data corruption

### 3. **Promise-Based Architecture**
All operations return promises:
- Clean async/await usage
- No callback nesting
- Easy error handling with try/catch

### 4. **Transaction Encapsulation**
Transactions are handled internally:
- [`#exec()`](static/storage.js:47) method manages transaction lifecycle
- Automatic mode selection (readonly/readwrite)
- Promise resolution tied to transaction completion

### 5. **Query DSL**
Declarative query options inspired by SQL:
- `where` - Exact value matching (similar to SQL WHERE)
- `filter` - Custom function filtering
- `order` - Field-based sorting
- `sort` - Custom comparison sorting
- `limit` - Maximum results
- `offset` - Skip results (pagination)

### 6. **Type Safety via Validation**
Runtime validation ensures data integrity:
```javascript
validate({ store, record }) {
  // Checks that all fields match schema types
  // Throws descriptive errors for mismatches
}
```

### 7. **Encapsulation with Private Fields**
Uses modern JavaScript private field syntax (`#field`):
- Prevents external access to internal state
- Enforces API boundaries
- Better maintainability

## Differences from Other Implementations

### vs. Native Implementation
**Native is more manual:**
- Direct IndexedDB API calls
- Manual transaction management
- Callback-based with event handlers
- No schema validation
- No query DSL

**Pragmatic improves with:**
- Clean class-based API
- Automatic transaction handling
- Promise-based operations
- Schema validation
- Powerful query DSL

### vs. Enterprise Implementation
**Enterprise is more complex:**
- Multiple layers (Repository, Service, DTO)
- Dependency injection containers
- Extensive abstraction layers
- Separate classes for each concern
- More configuration overhead

**Pragmatic simplifies with:**
- Single Database class
- Direct instantiation (no DI)
- Minimal abstraction layers
- Less boilerplate code
- Faster to understand and use

## Pragmatic Patterns Used

### 1. **Simple Factory Pattern**
Constructor returns a promise that resolves to the instance:
```javascript
const db = await new Database('Example', { version: 1, schemas });
```

### 2. **Fluent Configuration**
Constructor accepts configuration object with sensible defaults:
```javascript
{ version = 1, schemas = {} } = {}
```

### 3. **Template Method Pattern**
[`#exec()`](static/storage.js:47) provides a template for all database operations:
```javascript
#exec(store, operation, mode = 'readwrite') {
  // Set up transaction
  // Execute operation
  // Handle completion/errors
}
```

### 4. **Strategy Pattern (Lightweight)**
Operations passed as functions to [`#exec()`](static/storage.js:47):
```javascript
db.#exec(store, (objectStore) => objectStore.add(record));
```

### 5. **Builder Pattern (DSL)**
[`select()`](static/storage.js:106) method accepts a configuration object:
```javascript
db.select({ store, where, filter, sort, order, limit, offset });
```

### 6. **Facade Pattern**
[`Database`](static/storage.js:1) class provides a simplified interface to IndexedDB:
- Hides complexity of IndexedDB API
- Presents clean, intuitive methods
- Handles all transaction lifecycle internally

## When to Use This Approach

**Use Pragmatic when:**
- You need more than raw IndexedDB but don't want architectural complexity
- Team wants clean API without learning a complex framework
- Project is small-to-medium size
- Fast development is prioritized
- You want production-ready features without over-engineering

**Consider Native when:**
- Maximum performance is critical
- Very simple use case (few operations)
- Need full control over every detail
- Learning IndexedDB internals

**Consider Enterprise when:**
- Large team needs strict separation of concerns
- Multiple developers work on different layers
- Complex business logic requires extensive testing
- Long-term maintainability is top priority
- Application will grow significantly

## Running the Example

### Browser Demo
1. Open [`index.html`](static/index.html) in a web browser
2. Use the buttons to perform operations:
   - **Add**: Create new user records
   - **Get**: Retrieve all users
   - **Update**: Modify user with id=1
   - **Delete**: Remove user with id=2
   - **Adults**: Query users aged 18+

### Running Tests
```bash
npm test
```

Tests use `fake-indexeddb` to run in Node.js without a browser.

## Learning Path

1. **Start with [`storage.js`](static/storage.js:1)**: Understand the Database class
2. **Review [`application.js`](static/application.js:1)**: See practical usage
3. **Examine [`test/database.js`](test/database.js:1)**: Learn all capabilities
4. **Experiment**: Modify the demo to add new features

## Key Takeaways

1. **Pragmatic means balanced**: Not too simple, not too complex
2. **Abstraction helps**: Clean API makes development faster
3. **Validation matters**: Schema validation prevents bugs
4. **Promises simplify**: async/await is cleaner than callbacks
5. **DSL is powerful**: Declarative queries are intuitive
6. **Single responsibility**: Database class focuses on data operations only
7. **Testing is essential**: Comprehensive tests ensure reliability

## Conclusion

The Pragmatic approach demonstrates that you can have production-ready, well-structured code without architectural complexity. It's ideal for real-world applications that need reliability and maintainability without the overhead of enterprise patterns. The single [`Database`](static/storage.js:1) class provides everything needed for most IndexedDB use cases while remaining easy to understand and extend.
