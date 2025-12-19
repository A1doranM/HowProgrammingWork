/**
 * USER DOMAIN LAYER
 * ==================
 * 
 * This file demonstrates domain-specific implementations for the User entity.
 * It shows how to apply the generic Repository and Service patterns to a
 * concrete business domain.
 * 
 * COMPONENTS:
 * - UserModel: Domain model with validation (Value Object pattern)
 * - UserRepository: Data access for User entities (Repository pattern)
 * - UserService: Business logic for User operations (Service pattern)
 * 
 * DESIGN PATTERNS:
 * - Domain Model Pattern: Business objects with behavior and validation
 * - Repository Pattern: Specialized for User entity
 * - Service Layer Pattern: User-specific business operations
 * - Inheritance: Extends generic base classes
 * 
 * GRASP PRINCIPLES:
 * - Information Expert: UserModel knows its validation rules
 * - Creator: UserService creates UserModel instances
 * - High Cohesion: All User concerns in one module
 * - Low Coupling: Depends only on core abstractions
 * - Polymorphism: UserRepository can substitute base Repository
 * 
 * SOLID PRINCIPLES:
 * - Single Responsibility: Each class has one clear purpose
 * - Open/Closed: Can extend without modifying base classes
 * - Liskov Substitution: UserRepository/UserService work where base types expected
 * - Dependency Inversion: Depends on Repository abstraction
 * 
 * KEY CONCEPTS:
 * - Domain validation at model level
 * - Business operations at service level
 * - Data access at repository level
 * - Clear separation of concerns
 */

import { Repository, Service } from './core.js';

/**
 * USER MODEL (Domain Object / Value Object)
 * ==========================================
 * 
 * Represents a User in the business domain with validation rules and invariants.
 * This prevents invalid data from entering the system.
 * 
 * PATTERN: Domain Model / Value Object
 * 
 * INTENT:
 * - Encapsulate user data with business rules
 * - Ensure data integrity through validation
 * - Self-documenting business constraints
 * - Prevent invalid state
 * 
 * RESPONSIBILITIES:
 * - Validate input data
 * - Maintain data integrity
 * - Represent valid user state
 * 
 * BENEFITS:
 * - Fail fast: Invalid data caught at creation time
 * - Centralized validation: Rules in one place
 * - Type safety: Runtime validation (TypeScript would add compile-time)
 * - Self-documenting: Code shows what valid user means
 * 
 * GRASP PRINCIPLES:
 * - Information Expert: User knows its own validation rules
 * - High Cohesion: All user data and rules together
 * 
 * WHY NOT JUST PLAIN OBJECTS:
 * - Plain objects: { name: '', age: -5 } // Invalid but accepted
 * - UserModel: new UserModel('', -5)     // Throws error immediately
 * 
 * VALIDATION STRATEGY:
 * - Constructor validation (fail-fast approach)
 * - Throws errors for invalid data
 * - Ensures object is always in valid state
 * 
 * USAGE:
 *   const user = new UserModel('Alice', 30); // ✓ Valid
 *   const bad = new UserModel('', -1);       // ✗ Throws Error
 */
export class UserModel {
  /**
   * CONSTRUCTOR: Create and Validate User
   * 
   * @param {string} name - User's name (non-empty string)
   * @param {number} age - User's age (non-negative integer)
   * @throws {Error} If validation fails
   * 
   * VALIDATION RULES:
   * 1. Name must be a string
   * 2. Name cannot be empty or only whitespace
   * 3. Age must be an integer
   * 4. Age cannot be negative
   * 
   * WHY VALIDATE IN CONSTRUCTOR:
   * - Fail-fast: Catch errors early
   * - Invariant: Object always in valid state
   * - Defensive programming: Don't trust input
   * 
   * PATTERN: Guard Clauses
   * - Check preconditions and throw if violated
   * - Makes code self-documenting
   * 
   * ALTERNATIVE APPROACHES:
   * 1. Separate validate() method:
   *    - Pro: Can validate before creating
   *    - Con: User could skip validation
   * 
   * 2. Factory method with validation:
   *    - Pro: Can return errors instead of throwing
   *    - Con: More complex API
   * 
   * 3. Constructor validation (chosen):
   *    - Pro: Impossible to create invalid object
   *    - Pro: Simple API
   *    - Con: Must use try/catch
   */
  constructor(name, age) {
    // VALIDATION RULE 1: Name must be string
    // VALIDATION RULE 2: Name cannot be empty/whitespace
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Invalid name');
    }
    
    // VALIDATION RULE 3: Age must be integer
    // VALIDATION RULE 4: Age must be non-negative
    if (!Number.isInteger(age) || age < 0) {
      throw new Error('Invalid age');
    }
    
    // Store validated data (trim whitespace from name)
    this.name = name.trim();
    this.age = age;
    
    // NOTE: 'id' field will be added by IndexedDB after insertion
    // We don't set it here because it's auto-generated
  }
  
  /**
   * EXTENSION POINT: Business Methods
   * 
   * Could add domain logic here:
   * 
   * isAdult() {
   *   return this.age >= 18;
   * }
   * 
   * canVote() {
   *   return this.age >= 18; // or different age based on locale
   * }
   * 
   * getDisplayName() {
   *   return this.name.toUpperCase();
   * }
   * 
   * But for this example, we keep it simple and put
   * business operations in the Service layer instead.
   */
}

/**
 * USER REPOSITORY
 * ===============
 * 
 * Specialized Repository for User entities. Extends the generic Repository
 * to provide User-specific data access operations.
 * 
 * PATTERN: Repository Pattern + Inheritance
 * 
 * INTENT:
 * - Provide User-specific data access methods
 * - Can add custom queries beyond generic CRUD
 * - Type-safe operations for User entities
 * 
 * CURRENT STATE:
 * - Currently just inherits base Repository methods
 * - Exists to provide extension point for future User-specific queries
 * 
 * WHY CREATE THIS CLASS:
 * Even without custom methods, it provides:
 * 1. Type clarity: UserRepository is semantically meaningful
 * 2. Extension point: Easy to add findByEmail(), findByAgeRange(), etc.
 * 3. Dependency injection: Can mock UserRepository in tests
 * 4. Encapsulation: User store name hidden from clients
 * 
 * INHERITED METHODS:
 * - insert(user)      → Add new user
 * - getAll()          → Get all users
 * - get(id)           → Get user by ID
 * - update(user)      → Update existing user
 * - delete(id)        → Delete user by ID
 * 
 * EXTENSION EXAMPLES:
 * 
 * // Find users by name pattern
 * async findByName(pattern) {
 *   const users = await this.getAll();
 *   const regex = new RegExp(pattern, 'i');
 *   return users.filter(u => regex.test(u.name));
 * }
 * 
 * // Find users in age range
 * async findByAgeRange(min, max) {
 *   const users = await this.getAll();
 *   return users.filter(u => u.age >= min && u.age <= max);
 * }
 * 
 * // Count total users
 * async count() {
 *   const users = await this.getAll();
 *   return users.length;
 * }
 * 
 * NOTE ON QUERIES:
 * - These queries load all data then filter in JavaScript
 * - For large datasets, use IndexedDB indexes and cursors
 * - For this example, simplicity over performance
 * 
 * GRASP PRINCIPLES:
 * - Information Expert: Knows how to query User data
 * - Low Coupling: Clients don't know about 'user' store name
 * - High Cohesion: All User data access in one place
 */
export class UserRepository extends Repository {
  /**
   * CONSTRUCTOR: Initialize User Repository
   * 
   * @param {Database} database - Database abstraction instance
   * 
   * INHERITANCE:
   * - Calls super() to initialize base Repository
   * - Hardcodes store name to 'user' (encapsulation)
   * - Clients don't need to know store name
   * 
   * USAGE:
   *   const userRepo = new UserRepository(db);
   *   // Not: new UserRepository(db, 'user') - store name is hidden
   * 
   * BENEFITS:
   * - Store name change only affects this line
   * - Reduces coupling (clients don't know store name)
   * - Prevents typos ('uesr', 'users', etc.)
   */
  constructor(database) {
    super(database, 'user'); // 'user' is the IndexedDB object store name
  }
  
  /**
   * EXTENSION POINT: Add User-Specific Queries
   * 
   * This is where you would add methods like:
   * - findByEmail(email)
   * - findByAgeRange(min, max)
   * - findByNamePattern(pattern)
   * - getStatistics()
   * - etc.
   */
}

/**
 * USER SERVICE
 * ============
 * 
 * Business logic layer for User operations. Encapsulates use cases and
 * workflows that involve User entities.
 * 
 * PATTERN: Service Layer
 * 
 * INTENT:
 * - Implement business operations (use cases)
 * - Orchestrate Repository operations
 * - Apply business rules and validation
 * - Provide reusable business operations
 * 
 * RESPONSIBILITIES:
 * - Business logic (rules, calculations, workflows)
 * - Use case implementation
 * - Data validation at business level
 * - Coordinating multiple operations
 * 
 * WHAT IT DOESN'T DO:
 * - Direct database access (uses Repository)
 * - UI concerns (that's Application layer)
 * - Low-level validation (that's Model)
 * 
 * BUSINESS OPERATIONS vs CRUD:
 * - Repository: Low-level CRUD (insert, get, update, delete)
 * - Service: Business operations (createUser, incrementAge, findAdults)
 * 
 * BENEFITS:
 * - Reusability: Same operation usable from web, mobile, CLI, tests
 * - Testability: Business logic separated from UI and DB
 * - Maintainability: Business rules in one place
 * - Clarity: Operations have business-meaningful names
 * 
 * GRASP PRINCIPLES:
 * - Controller: Handles system operations
 * - High Cohesion: Related User operations grouped
 * - Low Coupling: Only depends on Repository interface
 * - Creator: Creates UserModel instances
 */
export class UserService extends Service {
  /**
   * CREATE USER: Business Operation
   * 
   * Creates a new validated user and persists it to the database.
   * 
   * @param {string} name - User's name
   * @param {number} age - User's age
   * @returns {Promise<UserModel>} Created user with generated ID
   * @throws {Error} If validation fails
   * 
   * WORKFLOW:
   * 1. Create UserModel (triggers validation)
   * 2. If validation fails → throw error
   * 3. If validation passes → persist to database
   * 4. Return created user (now has ID from database)
   * 
   * WHY THIS IS A SERVICE METHOD:
   * - Combines validation (Model) + persistence (Repository)
   * - Provides single operation for "create valid user"
   * - Can add additional logic (e.g., send welcome email)
   * 
   * ALTERNATIVE APPROACHES:
   * 
   * 1. Direct Repository use (not recommended):
   *    await userRepo.insert({ name, age }); // No validation!
   * 
   * 2. Manual validation + repository:
   *    const user = new UserModel(name, age); // Validates
   *    await userRepo.insert(user);           // Persists
   *    // Works, but service provides cleaner API
   * 
   * 3. Service method (chosen):
   *    await userService.createUser(name, age);
   *    // One call, validated automatically
   * 
   * USAGE:
   *   try {
   *     const user = await userService.createUser('Alice', 30);
   *     console.log('Created user:', user.id);
   *   } catch (err) {
   *     console.error('Validation failed:', err.message);
   *   }
   * 
   * GRASP - Creator:
   * - UserService creates UserModel instances
   * - Makes sense because service coordinates user creation workflow
   */
  async createUser(name, age) {
    // Create domain model (validates automatically in constructor)
    // If validation fails, Error is thrown and caught by caller
    const user = new UserModel(name, age);
    
    // Persist validated user to database via repository
    await this.repository.insert(user);
    
    // Return user (now has 'id' field added by IndexedDB)
    return user;
  }

  /**
   * INCREMENT AGE: Business Operation
   * 
   * Increments a user's age by 1. This represents a business operation
   * like "celebrate birthday" rather than generic "update user".
   * 
   * @param {number} id - User ID
   * @returns {Promise<Object>} Updated user
   * @throws {Error} If user not found
   * 
   * WORKFLOW:
   * 1. Fetch user from database
   * 2. Check if user exists
   * 3. Increment age (business logic)
   * 4. Save updated user back to database
   * 5. Return updated user
   * 
   * WHY THIS IS A SERVICE METHOD:
   * - Encapsulates multi-step workflow
   * - Provides business-meaningful operation name
   * - Handles error case (user not found)
   * - Reusable across different UI contexts
   * 
   * BUSINESS LOGIC:
   * - Age increments by exactly 1 (birthday semantics)
   * - Could add: age limits, validation, event logging, etc.
   * 
   * ALTERNATIVE: Generic Update
   *   const user = await repo.get(id);
   *   user.age += 1;
   *   await repo.update(user);
   * 
   * But service method:
   *   - Gives meaningful name (incrementAge vs update)
   *   - Encapsulates the logic (reusable)
   *   - Can add business rules easily
   * 
   * USAGE:
   *   const user = await userService.incrementAge(1);
   *   console.log(`User is now ${user.age} years old`);
   * 
   * GRASP - Controller:
   * - Service coordinates multi-step operation
   * - Repository handles data access
   * - Clear separation of concerns
   */
  async incrementAge(id) {
    // 1. Fetch user from database
    const user = await this.repository.get(id);
    
    // 2. Validate user exists (business-level validation)
    if (!user) throw new Error('User with id=1 not found');
    
    // 3. Apply business logic (increment age)
    user.age += 1;
    
    // 4. Persist changes
    await this.repository.update(user);
    
    // 5. Return updated user
    return user;
  }

  /**
   * FIND ADULTS: Business Query
   * 
   * Finds all users who are adults (age >= 18).
   * This represents a business query with domain logic.
   * 
   * @returns {Promise<Array>} Array of adult users
   * 
   * WHY THIS IS A SERVICE METHOD:
   * - Encapsulates business rule (what defines "adult")
   * - Business rule may vary (different countries, different ages)
   * - Centralizes logic so it's consistent everywhere
   * 
   * BUSINESS RULE:
   * - Adult defined as age >= 18
   * - Could be configurable: findUsersByAgeThreshold(threshold)
   * - Could be localized: different ages for different countries
   * 
   * ALTERNATIVE APPROACHES:
   * 
   * 1. In UI code (not recommended):
   *    const users = await repo.getAll();
   *    const adults = users.filter(u => u.age >= 18);
   *    // Problem: Business rule scattered across UI
   * 
   * 2. In Repository (could work):
   *    userRepo.findAdults()
   *    // Problem: Repository should focus on data access, not business rules
   * 
   * 3. In Service (chosen):
   *    userService.findAdults()
   *    // Correct layer for business logic
   * 
   * IMPLEMENTATION:
   * - Fetches all users via repository
   * - Applies business filter (age >= 18)
   * - Returns filtered results
   * 
   * PERFORMANCE CONSIDERATION:
   * - Loads all users then filters in JavaScript
   * - For large datasets, use IndexedDB index with cursor
   * - For this example, simplicity over performance
   * 
   * USAGE:
   *   const adults = await userService.findAdults();
   *   console.log(`Found ${adults.length} adult users`);
   * 
   * GRASP - Information Expert:
   * - Service knows business rules
   * - Repository knows data access
   * - Each layer has appropriate knowledge
   */
  async findAdults() {
    // Fetch all users from repository
    const users = await this.repository.getAll();
    
    // Apply business rule: adult is age >= 18
    // Note: This rule could be:
    // - Configurable (passed as parameter)
    // - Localized (different per country)
    // - More complex (age + other criteria)
    return users.filter((user) => user.age >= 18);
  }
  
  /**
   * EXTENSION POINT: Add More Business Operations
   * 
   * Examples of operations you might add:
   * 
   * async updateUserProfile(id, updates) {
   *   const user = await this.repository.get(id);
   *   Object.assign(user, updates);
   *   await this.repository.update(user);
   *   return user;
   * }
   * 
   * async deactivateUser(id) {
   *   const user = await this.repository.get(id);
   *   user.active = false;
   *   user.deactivatedAt = new Date();
   *   await this.repository.update(user);
   * }
   * 
   * async getUserStatistics() {
   *   const users = await this.repository.getAll();
   *   return {
   *     total: users.length,
   *     averageAge: users.reduce((sum, u) => sum + u.age, 0) / users.length,
   *     adults: users.filter(u => u.age >= 18).length,
   *   };
   * }
   */
}
