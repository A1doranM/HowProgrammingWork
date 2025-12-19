# IndexedDB Enterprise Implementation

## Overview

This is an **enterprise-grade implementation** of IndexedDB that demonstrates production-ready architectural patterns and best practices. Unlike the Native implementation which uses raw IndexedDB APIs directly, this version abstracts complexity into well-defined layers following SOLID principles and established design patterns.

## What This Example Demonstrates

This implementation showcases a **layered architecture** for IndexedDB that you would use in real-world production applications:

1. **Repository Pattern** - Abstract data access layer
2. **Service Layer Pattern** - Business logic separation
3. **Domain Model Pattern** - Data validation and encapsulation
4. **Dependency Injection** - Loose coupling between components
5. **Private Fields** - Encapsulation using JavaScript private fields (`#`)
6. **Promise-based API** - Modern async/await patterns
7. **Error Handling** - Comprehensive error management
8. **Testability** - Fully tested with unit tests

## Architecture & Project Structure

```
IndexedDB/2. Enterprise/
├── package.json              # ES Module configuration
├── static/
│   ├── index.html           # UI with user interaction buttons
│   ├── styles.css           # Application styling
│   ├── database.js          # Database abstraction layer
│   ├── core.js              # Generic Repository & Service base classes
│   ├── user.js              # User domain: Model, Repository, Service
│   └── application.js       # Main application entry point
└── test/
    ├── core.js              # Tests for Repository & Service
    ├── database.js          # Tests for Database class
    └── user.js              # Tests for User domain classes
```

## Layered Architecture

### Layer 1: Database Abstraction ([`database.js`](static/database.js))

**Purpose**: Encapsulates all raw IndexedDB operations into a clean, Promise-based API.

**Key Features**:
- Private field (`#db`) to protect database instance
- Connection management with upgrade callbacks
- Transaction abstraction
- Centralized error handling

**GRASP Principles Applied**:
- **Information Expert**: Database has knowledge of connection state
- **Pure Fabrication**: Not a domain concept, but necessary infrastructure
- **Low Coupling**: Provides simple interface hiding IndexedDB complexity
- **Protected Variations**: Shields rest of application from IndexedDB API changes

```javascript
// Clean API instead of raw IndexedDB
const db = new Database('MyApp', 1, (db) => {
  db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
});
await db.connect();
```

### Layer 2: Core Patterns ([`core.js`](static/core.js))

**Purpose**: Generic base classes that implement Repository and Service patterns.

#### Repository Pattern

**What**: Mediates between domain and data access layers using collection-like interface.

**Why**: 
- Centralizes data access logic
- Makes testing easier (can mock repositories)
- Provides consistent API across all entities
- Follows DRY principle

**SOLID Principles**:
- **Single Responsibility**: Only handles data persistence
- **Open/Closed**: Extensible through inheritance
- **Dependency Inversion**: Depends on Database abstraction, not concrete implementation

**Methods**:
- `insert(record)` - Add new records
- `getAll()` - Retrieve all records
- `get(id)` - Retrieve by ID
- `update(record)` - Update existing record
- `delete(id)` - Remove record

#### Service Pattern

**What**: Contains business logic and orchestrates operations across repositories.

**Why**:
- Separates business logic from data access
- Provides transactional boundaries
- Encapsulates complex workflows
- Makes business operations reusable

**GRASP Principles**:
- **High Cohesion**: Groups related business operations
- **Controller**: Coordinates system operations
- **Low Coupling**: Depends on Repository interface, not implementation

### Layer 3: Domain Layer ([`user.js`](static/user.js))

**Purpose**: Domain-specific implementations for the User entity.

#### UserModel

**What**: Domain object with validation rules and business invariants.

**Why**:
- Ensures data integrity at model level
- Prevents invalid state
- Centralizes validation logic
- Self-documenting business rules

**Validation Rules**:
- Name must be non-empty string
- Age must be non-negative integer

**Pattern**: **Value Object / Domain Model**

#### UserRepository

**What**: Specialized Repository for User entities.

**Why**: 
- Can add User-specific queries later (e.g., findByName)
- Type-safe operations for User entities
- Extensible without modifying base Repository

**Pattern**: **Inheritance** - Extends generic Repository

#### UserService

**What**: Business logic for User operations.

**Business Operations**:
- `createUser(name, age)` - Validates and creates new user
- `incrementAge(id)` - Business operation: birthday
- `findAdults()` - Query: filter users by age >= 18

**Why**:
- Business logic doesn't leak into UI or Repository
- Reusable operations across different UI contexts
- Testable business rules

**Pattern**: **Service Layer** - Encapsulates business logic

### Layer 4: Application Layer ([`application.js`](static/application.js))

**Purpose**: Application entry point that wires everything together.

**Responsibilities**:
- Initializes database
- Sets up dependency injection
- Wires UI to services
- Handles user interactions

**Pattern**: **Composition Root** - Single place where all dependencies are composed

**GRASP Principles**:
- **Creator**: Creates all instances in one place
- **Low Coupling**: Components don't know about each other, application wires them
- **Indirection**: Logger provides indirection for output operations

## Key Concepts Demonstrated

### 1. Dependency Injection

Instead of classes creating their dependencies internally:

```javascript
// ❌ Tight coupling (Native approach)
class UserService {
  constructor() {
    this.db = indexedDB.open('MyDB'); // Hard-coded dependency
  }
}

// ✅ Loose coupling (Enterprise approach)
class UserService {
  constructor(repository) { // Injected dependency
    this.repository = repository;
  }
}
```

**Benefits**:
- Easy to test (inject mock repositories)
- Easy to swap implementations
- Clear dependencies

### 2. Separation of Concerns

Each layer has a single, well-defined responsibility:

- **Database**: Connection and transaction management
- **Repository**: Data access operations
- **Service**: Business logic
- **Application**: Composition and wiring
- **Model**: Data validation and invariants

### 3. Promise Abstraction

Raw IndexedDB uses callbacks. This implementation wraps everything in Promises:

```javascript
// Raw IndexedDB
const request = store.get(id);
request.onsuccess = () => { /* ... */ };
request.onerror = () => { /* ... */ };

// Enterprise abstraction
const user = await repository.get(id); // Clean async/await
```

### 4. Encapsulation with Private Fields

JavaScript private fields (`#`) protect internal state:

```javascript
class Database {
  #db; // Cannot be accessed from outside

  transaction(storeName) {
    return this.#db.transaction(storeName); // Controlled access
  }
}
```

### 5. Transaction Management

The [`exec()`](static/database.js:33) method abstracts transaction lifecycle:

```javascript
exec(storeName, mode, operation) {
  return new Promise((resolve, reject) => {
    const tx = this.#db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const result = operation(store); // User code runs here
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
  });
}
```

**Benefits**:
- Automatic transaction handling
- Consistent error handling
- User code focuses on operation, not plumbing

## Differences from Native Implementation

| Aspect | Native | Enterprise |
|--------|--------|-----------|
| **Architecture** | Flat, procedural | Layered, object-oriented |
| **Coupling** | High (UI mixed with DB logic) | Low (clear separation) |
| **Reusability** | Low (tightly coupled code) | High (generic patterns) |
| **Testability** | Difficult (no abstractions) | Easy (dependency injection) |
| **Error Handling** | Per-operation | Centralized |
| **Business Logic** | Mixed with data access | Separate service layer |
| **Validation** | Ad-hoc | Domain model |
| **Maintainability** | Hard to change | Easy to extend |
| **Code Organization** | Single file | Multiple cohesive modules |
| **Patterns** | None | Repository, Service, Domain Model |

### Specific Comparisons

#### Adding a User

**Native**:
```javascript
// Everything mixed together
button.onclick = () => {
  const name = prompt('Name:');
  const tx = db.transaction('user', 'readwrite');
  const store = tx.objectStore('user');
  const request = store.add({ name, age: 25 });
  request.onsuccess = () => console.log('Added');
};
```

**Enterprise**:
```javascript
// Clean separation
action('add', async () => {
  const name = prompt('Name:');
  const user = await userService.createUser(name, 25); // Business logic
  logger.log('Added:', user);
});
```

#### Business Logic Location

**Native**: Business logic scattered in UI event handlers

**Enterprise**: Business logic centralized in Service layer:
```javascript
// Reusable, testable business operation
async findAdults() {
  const users = await this.repository.getAll();
  return users.filter(user => user.age >= 18);
}
```

## Design Patterns Used

### 1. Repository Pattern

**Intent**: Mediates between domain and data mapping layers.

**Implementation**: [`Repository`](static/core.js:1) base class, [`UserRepository`](static/user.js:16)

**Benefits**:
- Centralized query logic
- Testable (can mock)
- Consistent interface

### 2. Service Layer Pattern

**Intent**: Defines application's boundary and encapsulates business logic.

**Implementation**: [`Service`](static/core.js:46) base class, [`UserService`](static/user.js:22)

**Benefits**:
- Business logic separation
- Transaction boundaries
- Reusable operations

### 3. Domain Model Pattern

**Intent**: Object model incorporating behavior and data.

**Implementation**: [`UserModel`](static/user.js:3) with validation

**Benefits**:
- Prevents invalid state
- Self-documenting
- Business rules in one place

### 4. Template Method (Implicit)

**Intent**: Define skeleton of algorithm, let subclasses override steps.

**Implementation**: Base Repository/Service classes with inheritance

**Benefits**:
- Code reuse
- Consistent behavior
- Easy to extend

### 5. Facade Pattern

**Intent**: Provide unified interface to subsystem.

**Implementation**: [`Database`](static/database.js:1) class wrapping IndexedDB

**Benefits**:
- Simplified interface
- Hides complexity
- Protection from changes

## SOLID Principles in Action

### Single Responsibility Principle (SRP)

Each class has one reason to change:
- **Database**: Changes if IndexedDB API changes
- **Repository**: Changes if data access patterns change
- **Service**: Changes if business rules change
- **Model**: Changes if validation rules change

### Open/Closed Principle (OCP)

Classes are open for extension, closed for modification:
- Can create `AdminRepository extends Repository` without modifying base
- Can add new services without changing existing ones

### Liskov Substitution Principle (LSP)

Subtypes are substitutable:
- `UserRepository` can be used anywhere `Repository` is expected
- `UserService` can be used anywhere `Service` is expected

### Interface Segregation Principle (ISP)

Clients depend only on methods they use:
- Repository has focused interface (CRUD operations)
- Service interface is minimal (business operations only)

### Dependency Inversion Principle (DIP)

Depend on abstractions, not concretions:
- Service depends on Repository (abstraction), not specific implementation
- Repository depends on Database interface, not IndexedDB directly

## How to Use

### 1. Open the Application

Open [`static/index.html`](static/index.html) in a modern browser (Chrome, Firefox, Edge, Safari).

### 2. Interact with Buttons

- **Add User**: Creates validated user with name and age
- **Get All Users**: Displays all users in database
- **Update User 1**: Increments age of user with id=1 (business operation)
- **Delete User 2**: Removes user with id=2
- **Find Adults**: Queries users with age >= 18 (filtered query)

### 3. Check Browser Console

Open DevTools (F12) → Application → IndexedDB → EnterpriseApplication → user

You'll see the object store structure and data.

## Running Tests

Tests use Node.js with `fake-indexeddb` to simulate IndexedDB:

```bash
npm test
```

Tests verify:
- Repository CRUD operations
- Service business logic
- Model validation
- Database connection and transactions

## Extending the Application

### Adding a New Entity

1. **Create Model** with validation:
```javascript
export class ProductModel {
  constructor(name, price) {
    if (!name) throw new Error('Invalid name');
    if (price < 0) throw new Error('Invalid price');
    this.name = name;
    this.price = price;
  }
}
```

2. **Create Repository**:
```javascript
export class ProductRepository extends Repository {
  constructor(database) {
    super(database, 'product');
  }
  
  // Add custom queries
  async findByPriceRange(min, max) {
    const products = await this.getAll();
    return products.filter(p => p.price >= min && p.price <= max);
  }
}
```

3. **Create Service**:
```javascript
export class ProductService extends Service {
  async createProduct(name, price) {
    const product = new ProductModel(name, price);
    await this.repository.insert(product);
    return product;
  }
  
  async applyDiscount(id, percent) {
    const product = await this.repository.get(id);
    product.price *= (1 - percent / 100);
    await this.repository.update(product);
    return product;
  }
}
```

4. **Wire in Application**:
```javascript
const productRepo = new ProductRepository(db);
const productService = new ProductService(productRepo);
```

### Adding Complex Queries

Add methods to Repository subclass:

```javascript
class UserRepository extends Repository {
  async findByAgeRange(min, max) {
    const users = await this.getAll();
    return users.filter(u => u.age >= min && u.age <= max);
  }
  
  async findByNamePattern(pattern) {
    const users = await this.getAll();
    const regex = new RegExp(pattern, 'i');
    return users.filter(u => regex.test(u.name));
  }
}
```

### Adding Transaction Support

For operations spanning multiple entities:

```javascript
class OrderService extends Service {
  async placeOrder(userId, productId, quantity) {
    // Could use Database.exec for transaction
    const user = await this.userRepo.get(userId);
    const product = await this.productRepo.get(productId);
    
    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }
    
    product.stock -= quantity;
    await this.productRepo.update(product);
    
    const order = { userId, productId, quantity, date: new Date() };
    await this.orderRepo.insert(order);
    
    return order;
  }
}
```

## Best Practices Demonstrated

1. **Constructor Injection**: All dependencies injected, never created internally
2. **Promise-based APIs**: Consistent async/await throughout
3. **Error Handling**: Try-catch in transaction management, validation in models
4. **Encapsulation**: Private fields protect internal state
5. **Validation**: Early validation in domain models
6. **Separation of Concerns**: Clear boundaries between layers
7. **DRY Principle**: Generic patterns in base classes
8. **Testability**: All components mockable and testable
9. **Type Safety**: Runtime validation compensates for lack of TypeScript
10. **Documentation**: Clear comments explaining architecture decisions

## When to Use This Pattern

**Use Enterprise pattern when**:
- Building production applications
- Need testability
- Multiple developers working on codebase
- Business logic is complex
- Application will grow over time
- Need to maintain code long-term

**Use Native pattern when**:
- Learning IndexedDB basics
- Prototyping
- Very simple use cases
- Performance is absolute priority (no abstraction overhead)

## Conclusion

This Enterprise implementation demonstrates how to structure IndexedDB applications using industry-standard patterns. While more complex than the Native version, it provides:

- **Maintainability**: Easy to understand and modify
- **Testability**: All components can be unit tested
- **Scalability**: Easy to add new features
- **Reusability**: Patterns can be applied to any entity
- **Robustness**: Comprehensive error handling and validation

The extra complexity pays off in any non-trivial application where code quality, maintainability, and team collaboration matter.
