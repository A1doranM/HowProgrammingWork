/**
 * CORE ARCHITECTURAL PATTERNS
 * ============================
 * 
 * This file defines the foundational design patterns used throughout the application:
 * - Repository Pattern: Abstract data access layer
 * - Service Pattern: Business logic layer
 * 
 * These are GENERIC base classes that can be extended for any domain entity.
 * 
 * DESIGN PATTERNS:
 * - Repository Pattern: Mediates between domain and data access layers
 * - Service Layer Pattern: Encapsulates business logic
 * - Template Method Pattern (implicit): Base classes define structure, subclasses add specifics
 * 
 * GRASP PRINCIPLES:
 * - High Cohesion: Each class has focused, related responsibilities
 * - Low Coupling: Repository doesn't know about Services; Service doesn't know about UI
 * - Pure Fabrication: These aren't domain concepts but necessary infrastructure
 * - Polymorphism: Can substitute specific repositories/services for base classes
 * - Protected Variations: Changes to data access don't affect business logic
 * 
 * SOLID PRINCIPLES:
 * - Single Responsibility: Repository = data access, Service = business logic
 * - Open/Closed: Extend via inheritance without modifying base classes
 * - Liskov Substitution: Subclasses can be used wherever base class is expected
 * - Dependency Inversion: Both depend on Database abstraction
 * 
 * WHY THESE PATTERNS:
 * - Testability: Can mock repositories in service tests
 * - Reusability: Same patterns work for any entity (User, Product, Order, etc.)
 * - Maintainability: Clear separation makes code easy to understand and modify
 * - Scalability: Easy to add new entities without changing existing code
 */

/**
 * REPOSITORY PATTERN
 * ==================
 * 
 * The Repository acts as an in-memory collection of domain objects,
 * hiding the details of data persistence (in this case, IndexedDB).
 * 
 * INTENT:
 * - Mediate between domain and data mapping layers
 * - Provide collection-like interface for domain objects
 * - Centralize data access logic
 * 
 * RESPONSIBILITIES:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Query operations (could add findBy methods)
 * - Data persistence abstraction
 * 
 * WHAT IT DOES NOT DO:
 * - Business logic (that belongs in Service layer)
 * - Validation (that belongs in Model/Entity)
 * - UI concerns (that belongs in Application layer)
 * 
 * BENEFITS:
 * - Testability: Easy to create mock repositories for testing
 * - Centralization: All data access in one place per entity
 * - Flexibility: Can change storage mechanism without affecting business logic
 * - Consistency: Same interface for all entities
 * 
 * GRASP PRINCIPLES:
 * - Information Expert: Knows how to persist/retrieve data
 * - Pure Fabrication: Technical concept, not business domain
 * - Low Coupling: Services don't depend on IndexedDB details
 * - High Cohesion: All data access methods grouped together
 * 
 * USAGE PATTERN:
 *   class UserRepository extends Repository {
 *     constructor(database) {
 *       super(database, 'user'); // Specify object store name
 *     }
 *     
 *     // Can add entity-specific queries
 *     async findByEmail(email) {
 *       const users = await this.getAll();
 *       return users.find(u => u.email === email);
 *     }
 *   }
 */
export class Repository {
  /**
   * CONSTRUCTOR: Initialize Repository
   * 
   * @param {Database} database - Database abstraction instance
   * @param {string} storeName - IndexedDB object store name
   * 
   * DEPENDENCY INJECTION:
   * - Database is injected, not created internally
   * - This enables testing (can inject mock database)
   * - Follows Dependency Inversion Principle
   * 
   * GRASP - Creator Principle:
   * - Repository doesn't create Database (high-level concern)
   * - Application layer creates both and wires them together
   */
  constructor(database, storeName) {
    this.db = database;
    this.storeName = storeName;
  }

  /**
   * INSERT: Add New Record
   * 
   * Adds a new record to the object store. IndexedDB will auto-generate
   * an ID if keyPath has autoIncrement: true.
   * 
   * @param {Object} record - Domain object to insert
   * @returns {Promise} Resolves when insert completes
   * 
   * PATTERN: Delegation
   * - Delegates to Database.exec() for transaction management
   * - Repository focuses on WHAT operation, Database handles HOW
   * 
   * USAGE:
   *   await userRepo.insert({ name: 'Alice', age: 30 });
   * 
   * NOTE: Record is modified in-place by IndexedDB (adds 'id' field)
   */
  insert(record) {
    // Use Database.exec() to handle transaction lifecycle
    // 'readwrite' mode required for modifications
    return this.db.exec(this.storeName, 'readwrite', (store) =>
      store.add(record), // IndexedDB add() method
    );
  }

  /**
   * GETALL: Retrieve All Records
   * 
   * Fetches all records from the object store.
   * 
   * @returns {Promise<Array>} Resolves with array of all records
   * 
   * WHY WRAP IN PROMISE:
   * - store.getAll() returns IDBRequest, not Promise
   * - We convert to Promise for consistent async/await API
   * - Enables proper error handling with try/catch
   * 
   * PATTERN: Adapter
   * - Adapts IDBRequest callback API to Promise API
   * 
   * USAGE:
   *   const users = await userRepo.getAll();
   *   console.log(users); // [{ id: 1, name: 'Alice', age: 30 }, ...]
   * 
   * PERFORMANCE CONSIDERATION:
   * - For large datasets, consider cursor-based pagination
   * - getAll() loads entire dataset into memory
   */
  getAll() {
    return this.db.exec(this.storeName, 'readonly', (store) => {
      // Call IndexedDB getAll() method
      const req = store.getAll();
      
      // Wrap IDBRequest in Promise
      return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result); // req.result = array of records
        req.onerror = () => reject(req.error);
      });
    });
  }

  /**
   * GET: Retrieve Single Record by ID
   * 
   * Fetches a specific record using its primary key (id).
   * 
   * @param {number|string} id - Primary key value
   * @returns {Promise<Object|undefined>} Record if found, undefined otherwise
   * 
   * WHY WRAP IN PROMISE:
   * - Same reason as getAll() - convert IDBRequest to Promise
   * 
   * USAGE:
   *   const user = await userRepo.get(1);
   *   if (user) {
   *     console.log(user.name);
   *   } else {
   *     console.log('User not found');
   *   }
   * 
   * NOTE: Returns undefined (not null) if record doesn't exist
   * - This is IndexedDB's behavior, which we preserve
   */
  get(id) {
    return this.db.exec(this.storeName, 'readonly', (store) => {
      // Call IndexedDB get() method with primary key
      const req = store.get(id);
      
      // Wrap IDBRequest in Promise
      return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result); // undefined if not found
        req.onerror = () => reject(req.error);
      });
    });
  }

  /**
   * UPDATE: Modify Existing Record
   * 
   * Updates a record in the object store. The record MUST have its primary key set.
   * If record doesn't exist, it will be inserted (put semantics).
   * 
   * @param {Object} record - Record with updated values (must include id)
   * @returns {Promise} Resolves when update completes
   * 
   * INDEXEDDB PUT SEMANTICS:
   * - If record with this id exists → update it
   * - If record with this id doesn't exist → insert it
   * - This is "upsert" behavior
   * 
   * TYPICAL USAGE PATTERN:
   *   const user = await userRepo.get(1);  // 1. Fetch existing
   *   user.age += 1;                        // 2. Modify
   *   await userRepo.update(user);          // 3. Save changes
   * 
   * WHY NOT PASS ID SEPARATELY:
   * - Record already contains its ID (from IndexedDB keyPath)
   * - Avoids parameter duplication and potential mismatch
   * - Follows Information Expert (record knows its own ID)
   */
  update(record) {
    return this.db.exec(this.storeName, 'readwrite', (store) =>
      store.put(record), // IndexedDB put() method (update or insert)
    );
  }

  /**
   * DELETE: Remove Record by ID
   * 
   * Removes a record from the object store.
   * 
   * @param {number|string} id - Primary key of record to delete
   * @returns {Promise} Resolves when deletion completes
   * 
   * BEHAVIOR:
   * - If record exists → deletes it
   * - If record doesn't exist → succeeds anyway (idempotent)
   * 
   * USAGE:
   *   await userRepo.delete(1); // Removes user with id=1
   * 
   * NOTE: No error if record doesn't exist
   * - This is idempotent operation (same result if called multiple times)
   * - Simplifies client code (no need to check existence first)
   */
  delete(id) {
    return this.db.exec(this.storeName, 'readwrite', (store) =>
      store.delete(id), // IndexedDB delete() method
    );
  }
}

/**
 * SERVICE LAYER PATTERN
 * ======================
 * 
 * The Service layer encapsulates business logic and orchestrates
 * operations that may span multiple repositories or require
 * domain-specific processing.
 * 
 * INTENT:
 * - Define application's use cases and workflows
 * - Encapsulate business logic
 * - Coordinate operations across repositories
 * - Provide transaction boundaries
 * 
 * RESPONSIBILITIES:
 * - Business logic (rules, calculations, workflows)
 * - Use case implementation (e.g., "register user", "place order")
 * - Orchestration (coordinating multiple repository calls)
 * - Business-level validation
 * 
 * WHAT IT DOES NOT DO:
 * - Data persistence (delegates to Repository)
 * - UI concerns (delegates to Application layer)
 * - Low-level validation (delegates to Model/Entity)
 * 
 * BENEFITS:
 * - Reusability: Business logic not tied to UI
 * - Testability: Can test business logic in isolation
 * - Transaction boundaries: Natural place for multi-step operations
 * - Maintainability: Business rules in one place
 * 
 * GRASP PRINCIPLES:
 * - Controller: Handles system operations (use cases)
 * - High Cohesion: Groups related business operations
 * - Low Coupling: Depends only on Repository interface
 * - Pure Fabrication: Not a domain concept, but necessary layer
 * 
 * SERVICE vs REPOSITORY:
 * - Repository: "How to persist/retrieve data"
 * - Service: "What business operations are possible"
 * 
 * Example:
 *   Repository: get(id), getAll(), update()
 *   Service: incrementAge(id), findAdults(), promoteUser(id)
 * 
 * USAGE PATTERN:
 *   class UserService extends Service {
 *     async registerUser(name, email, password) {
 *       // 1. Business validation
 *       if (await this.repository.findByEmail(email)) {
 *         throw new Error('Email already exists');
 *       }
 *       
 *       // 2. Business logic (hash password, etc.)
 *       const hashedPassword = await hashPassword(password);
 *       
 *       // 3. Create domain object with validation
 *       const user = new User(name, email, hashedPassword);
 *       
 *       // 4. Persist via repository
 *       await this.repository.insert(user);
 *       
 *       // 5. Additional workflows (send welcome email, etc.)
 *       await this.emailService.sendWelcome(user.email);
 *       
 *       return user;
 *     }
 *   }
 */
export class Service {
  /**
   * CONSTRUCTOR: Initialize Service
   * 
   * @param {Repository} repository - Repository instance for data access
   * 
   * DEPENDENCY INJECTION:
   * - Repository is injected, not created internally
   * - Enables testing (can inject mock repository)
   * - Follows Dependency Inversion Principle
   * - Service depends on Repository abstraction, not concrete implementation
   * 
   * DESIGN:
   * - Base Service is minimal (just stores repository)
   * - Subclasses add business operations
   * - This follows Open/Closed Principle (extend without modifying)
   * 
   * NOTE: This is a BASE CLASS
   * - Not meant to be used directly
   * - Extend it to create entity-specific services (UserService, ProductService, etc.)
   * - Provides common structure and dependency injection pattern
   * 
   * WHY BASE CLASS:
   * - Consistency: All services have same structure
   * - DRY: Don't repeat repository injection pattern
   * - Type safety: Clear contract for what services need
   * 
   * GRASP - Creator:
   * - Service doesn't create Repository
   * - Application layer creates both and wires them together
   * - This is "Dependency Injection" pattern
   */
  constructor(repository) {
    this.repository = repository;
  }
  
  /**
   * EXTENSION POINT
   * 
   * Subclasses add business methods here:
   * 
   * async createEntity(data) {
   *   // Validation, business rules, persistence
   * }
   * 
   * async performBusinessOperation(id, params) {
   *   // Fetch, process, update
   * }
   * 
   * async queryWithBusinessLogic(criteria) {
   *   // Complex queries with business rules
   * }
   */
}
