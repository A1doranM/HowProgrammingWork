/**
 * APPLICATION LAYER (Composition Root)
 * =====================================
 * 
 * This is the main entry point of the application. It demonstrates the
 * COMPOSITION ROOT pattern where all dependencies are created and wired together.
 * 
 * RESPONSIBILITIES:
 * - Initialize database connection
 * - Create and wire all dependencies (Database, Repository, Service)
 * - Set up UI event handlers
 * - Bridge between user interactions and business logic
 * 
 * DESIGN PATTERNS:
 * - Composition Root: Single place where object graph is constructed
 * - Dependency Injection: Components receive dependencies, don't create them
 * - Facade Pattern (Logger): Simplifies output operations
 * - Event Handler Pattern: UI events trigger business operations
 * 
 * GRASP PRINCIPLES:
 * - Creator: Application creates all top-level objects
 * - Controller: Logger and event handlers control UI interactions
 * - Low Coupling: Components don't know about each other; app wires them
 * - Indirection: Logger provides indirection for output
 * 
 * ARCHITECTURE:
 * This file sits at the TOP of the dependency hierarchy:
 * 
 *   Application (this file)
 *        ↓
 *   Service Layer (UserService)
 *        ↓
 *   Repository Layer (UserRepository)
 *        ↓
 *   Database Layer (Database)
 *        ↓
 *   IndexedDB (Browser API)
 * 
 * Dependencies flow DOWNWARD (higher layers depend on lower layers).
 * No layer depends on layers above it (Dependency Inversion Principle).
 * 
 * WHY THIS STRUCTURE:
 * - Clear separation of concerns
 * - Easy to test (can mock at any layer)
 * - Easy to replace implementations
 * - Changes in one layer don't cascade
 */

import { Database } from './database.js';
import { UserRepository, UserService } from './user.js';

/**
 * LOGGER CLASS
 * ============
 * 
 * Simple utility for displaying output to the user.
 * 
 * PATTERN: Facade Pattern
 * - Simplifies interaction with DOM
 * - Centralizes output formatting
 * - Could be swapped with console, file, or network logger
 * 
 * RESPONSIBILITIES:
 * - Format output (serialize objects to JSON)
 * - Display output in UI
 * - Auto-scroll to latest output
 * 
 * BENEFITS:
 * - Centralized: All output goes through one place
 * - Consistent: Same formatting everywhere
 * - Flexible: Easy to change output destination
 * 
 * GRASP - Indirection:
 * - Logger provides indirection between business code and DOM
 * - Business code doesn't directly manipulate DOM
 */
class Logger {
  /**
   * PRIVATE FIELD: Output Element
   * 
   * Reference to the DOM element where output is displayed.
   * Using private field to encapsulate implementation detail.
   */
  #output;

  /**
   * CONSTRUCTOR: Initialize Logger
   * 
   * @param {string} outputId - ID of DOM element for output
   * 
   * NOTE: Looks up element once in constructor, not on every log()
   * - Performance optimization
   * - Fails fast if element doesn't exist
   */
  constructor(outputId) {
    this.#output = document.getElementById(outputId);
  }

  /**
   * LOG: Display Output
   * 
   * Formats and displays output to the user.
   * 
   * @param {...any} args - Values to log (can be strings, objects, etc.)
   * 
   * BEHAVIOR:
   * - Objects are serialized to JSON (pretty-printed)
   * - Strings are displayed as-is
   * - Auto-scrolls to show latest output
   * 
   * USAGE:
   *   logger.log('Hello');                    // "Hello"
   *   logger.log('User:', { name: 'Alice' }); // "User: { name: 'Alice' }"
   */
  log(...args) {
    // Serialize each argument (objects → JSON, strings → as-is)
    const lines = args.map(Logger.#serialize);
    
    // Append to output with newline
    this.#output.textContent += lines.join(' ') + '\n';
    
    // Auto-scroll to bottom to show latest output
    this.#output.scrollTop = this.#output.scrollHeight;
  }

  /**
   * SERIALIZE: Format Value for Display
   * 
   * Private static method to format values.
   * 
   * @param {any} x - Value to serialize
   * @returns {string} String representation
   * 
   * LOGIC:
   * - Objects → JSON.stringify with 2-space indentation
   * - Primitives → toString
   * 
   * WHY STATIC:
   * - Doesn't need instance state
   * - Can't be called from outside (private)
   */
  static #serialize(x) {
    return typeof x === 'object' ? JSON.stringify(x, null, 2) : x;
  }
}

/**
 * CREATE LOGGER INSTANCE
 * =======================
 * 
 * Single logger instance for the application.
 * 
 * PATTERN: Singleton (via module)
 * - JavaScript modules execute once
 * - This creates one logger shared by all event handlers
 */
const logger = new Logger('output');

/**
 * ACTION HELPER: Wire UI Event to Business Logic
 * ===============================================
 * 
 * Helper function to connect UI buttons to async business operations.
 * 
 * @param {string} id - Button element ID
 * @param {Function} handler - Async function to execute on click
 * 
 * RESPONSIBILITIES:
 * - Look up DOM element
 * - Attach click handler
 * - Handle errors consistently
 * 
 * ERROR HANDLING:
 * - Catches errors from async operations
 * - Logs errors to user
 * - Prevents unhandled promise rejections
 * 
 * WHY THIS HELPER:
 * - DRY: Avoid repeating error handling code
 * - Consistency: All buttons handle errors the same way
 * - Simplicity: Business code just throws; helper catches
 * 
 * PATTERN: Template Method
 * - Structure (error handling) defined here
 * - Content (business logic) provided by handler parameter
 * 
 * USAGE:
 *   action('myButton', async () => {
 *     // Business logic here
 *     // Errors automatically caught and logged
 *   });
 */
const action = (id, handler) => {
  // Look up button element
  const element = document.getElementById(id);
  if (!element) return; // Fail silently if button doesn't exist
  
  // Attach click handler
  element.onclick = () => {
    // Execute handler and catch any errors
    handler().catch((error) => {
      // Log error message to user
      logger.log(error.message);
    });
  };
};

/**
 * DATABASE INITIALIZATION
 * =======================
 * 
 * Create and connect to IndexedDB database.
 * 
 * CONFIGURATION:
 * - Name: 'EnterpriseApplication'
 * - Version: 1
 * - Schema: Single 'user' object store with auto-increment ID
 * 
 * UPGRADE CALLBACK:
 * - Called when database is created or version changes
 * - This is the ONLY place where schema can be modified
 * - Creates 'user' object store if it doesn't exist
 * 
 * SCHEMA DESIGN:
 * - Object store: 'user'
 * - Key path: 'id' (primary key)
 * - Auto-increment: true (IndexedDB generates IDs automatically)
 * 
 * WHY CHECK objectStoreNames.contains:
 * - Upgrade callback runs on version change
 * - If we increment version but store exists, don't recreate it
 * - Prevents errors when adding new stores
 */
const db = new Database('EnterpriseApplication', 1, (db) => {
  // Check if 'user' store already exists
  if (!db.objectStoreNames.contains('user')) {
    // Create 'user' object store with auto-incrementing ID
    db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });
  }
});

/**
 * CONNECT TO DATABASE
 * ===================
 * 
 * Establish database connection before setting up UI.
 * 
 * WHY AWAIT AT TOP LEVEL:
 * - ES Modules support top-level await
 * - Ensures database is ready before UI interactions
 * - Simplifies code (no need for init function)
 * 
 * IF CONNECTION FAILS:
 * - Promise rejects
 * - Error appears in browser console
 * - Page won't work (but won't crash)
 */
await db.connect();

/**
 * DEPENDENCY INJECTION / COMPOSITION ROOT
 * ========================================
 * 
 * This is where the application's object graph is constructed.
 * Each component receives its dependencies rather than creating them.
 * 
 * DEPENDENCY GRAPH:
 * 
 *   db (Database)
 *     ↓ (injected into)
 *   userRepository (UserRepository)
 *     ↓ (injected into)
 *   userService (UserService)
 * 
 * WHY THIS MATTERS:
 * - Each component is loosely coupled
 * - Easy to test (inject mocks)
 * - Easy to change implementations
 * - Clear dependencies (visible in one place)
 * 
 * ALTERNATIVE (BAD):
 *   // Components create their own dependencies
 *   class UserService {
 *     constructor() {
 *       this.repo = new UserRepository(new Database(...));
 *     }
 *   }
 *   // Problems: Hard to test, tightly coupled, unclear dependencies
 */
const userRepository = new UserRepository(db, 'user');
const userService = new UserService(userRepository);

/**
 * UI EVENT HANDLERS
 * =================
 * 
 * Wire up buttons to business operations.
 * Each handler is a thin layer that:
 * 1. Gets input from user (if needed)
 * 2. Calls business logic (Service or Repository)
 * 3. Displays result (via Logger)
 * 
 * PATTERN: Thin Controller
 * - Minimal logic in handlers
 * - Delegate to Service/Repository
 * - Focus on UI concerns (prompts, display)
 * 
 * WHY SO LITTLE CODE:
 * - Business logic is in Service layer (reusable, testable)
 * - Data access is in Repository layer (consistent, mockable)
 * - UI code just coordinates (thin layer)
 * 
 * BENEFITS:
 * - Business logic can be called from tests, CLI, API, etc.
 * - UI changes don't affect business logic
 * - Easy to add new UI without duplicating logic
 */

/**
 * ADD USER HANDLER
 * ================
 * 
 * Creates a new user with validation.
 * 
 * FLOW:
 * 1. Prompt user for name
 * 2. Prompt user for age
 * 3. Call userService.createUser() (validates + persists)
 * 4. Display created user (now has ID)
 * 
 * ERROR HANDLING:
 * - If validation fails → UserModel throws → caught by action() → logged
 * - If database fails → Repository throws → caught by action() → logged
 * 
 * WHY USE SERVICE:
 * - Service handles validation automatically
 * - Service provides clean API
 * - Could add more logic (e.g., check duplicate email) in one place
 * 
 * USAGE: Click "Add User" button → prompts appear → user created
 */
action('add', async () => {
  // Get input from user (UI concern)
  const name = prompt('Enter user name:');
  const age = parseInt(prompt('Enter age:'), 10);
  
  // Call business logic (Service handles validation + persistence)
  const user = await userService.createUser(name, age);
  
  // Display result (UI concern)
  logger.log('Added:', user);
});

/**
 * GET ALL USERS HANDLER
 * ======================
 * 
 * Retrieves and displays all users from database.
 * 
 * FLOW:
 * 1. Call repository.getAll()
 * 2. Display array of users
 * 
 * WHY USE REPOSITORY DIRECTLY:
 * - Simple query, no business logic needed
 * - Service would just delegate to repository anyway
 * 
 * ALTERNATIVE:
 * - Could add userService.getAllUsers() that calls repository
 * - Useful if you want to add filtering, sorting, transformation
 * 
 * USAGE: Click "Get All Users" button → shows all users
 */
action('get', async () => {
  // Call repository for data access (no business logic needed)
  const users = await userRepository.getAll();
  
  // Display results
  logger.log('Users:', users);
});

/**
 * UPDATE USER HANDLER
 * ===================
 * 
 * Increments age of user with ID=1 (demonstrates business operation).
 * 
 * FLOW:
 * 1. Call userService.incrementAge(1)
 * 2. Service fetches user, increments age, saves
 * 3. Display updated user
 * 
 * WHY USE SERVICE:
 * - incrementAge() is a BUSINESS OPERATION
 * - Could be called from multiple places (button, API, scheduled job)
 * - Encapsulates the workflow (fetch → modify → save)
 * 
 * WHY NOT REPOSITORY:
 * - Repository is low-level (get, update)
 * - Service is high-level (incrementAge)
 * - Service provides semantic meaning
 * 
 * HARD-CODED ID:
 * - This is just a demo
 * - Real app would let user select which user to update
 * 
 * ERROR HANDLING:
 * - If user 1 doesn't exist → Service throws → caught → logged
 * 
 * USAGE: Click "Update User 1" button → user 1's age increases by 1
 */
action('update', async () => {
  // Call business logic (Service encapsulates workflow)
  const user = await userService.incrementAge(1);
  
  // Display result
  logger.log('Updated:', user);
});

/**
 * DELETE USER HANDLER
 * ===================
 * 
 * Removes user with ID=2 (demonstrates delete operation).
 * 
 * FLOW:
 * 1. Call repository.delete(2)
 * 2. Display confirmation message
 * 
 * WHY USE REPOSITORY DIRECTLY:
 * - Simple operation, no business logic
 * - Service would just delegate anyway
 * 
 * WHEN TO USE SERVICE:
 * - If delete has business rules (e.g., can't delete admin)
 * - If delete triggers other actions (e.g., delete related records)
 * - If delete needs logging, notifications, etc.
 * 
 * For simple delete, repository is sufficient.
 * 
 * HARD-CODED ID:
 * - Just a demo
 * - Real app would let user select which user to delete
 * 
 * IDEMPOTENT:
 * - If user 2 doesn't exist, no error (IndexedDB behavior)
 * - Safe to call multiple times
 * 
 * USAGE: Click "Delete User 2" button → user 2 is removed
 */
action('delete', async () => {
  // Call repository for data access
  await userRepository.delete(2);
  
  // Display confirmation
  logger.log('Deleted user with id=2');
});

/**
 * FIND ADULTS HANDLER
 * ===================
 * 
 * Demonstrates business query - finds users age >= 18.
 * 
 * FLOW:
 * 1. Call userService.findAdults()
 * 2. Service fetches all users, filters by age >= 18
 * 3. Display filtered results
 * 
 * WHY USE SERVICE:
 * - "Adult" is a BUSINESS CONCEPT
 * - Age threshold (18) is a BUSINESS RULE
 * - May vary by country, context, etc.
 * - Should be centralized in Service layer
 * 
 * WHY NOT REPOSITORY:
 * - Repository could have findAdults() method
 * - But business rules belong in Service, not data access layer
 * - Keeps Repository focused on data access
 * 
 * WHY NOT INLINE FILTER:
 * - Business rule would be duplicated in UI
 * - Hard to change (scattered across codebase)
 * - Not reusable or testable
 * 
 * USAGE: Click "Find Adults" button → shows users with age >= 18
 */
action('adults', async () => {
  // Call business logic (Service applies business rule)
  const adults = await userService.findAdults();
  
  // Display results
  logger.log('Adults:', adults);
});

/**
 * APPLICATION COMPLETE
 * ====================
 * 
 * At this point:
 * - Database is connected
 * - All dependencies are wired
 * - All UI handlers are attached
 * - Application is ready for user interaction
 * 
 * ARCHITECTURE SUMMARY:
 * 
 * 1. USER clicks button
 *    ↓
 * 2. EVENT HANDLER (action callback)
 *    - Gets input if needed
 *    - Calls Service or Repository
 *    ↓
 * 3. SERVICE LAYER (UserService)
 *    - Applies business logic
 *    - Validates data
 *    - Calls Repository
 *    ↓
 * 4. REPOSITORY LAYER (UserRepository)
 *    - Executes CRUD operations
 *    - Calls Database
 *    ↓
 * 5. DATABASE LAYER (Database)
 *    - Manages transactions
 *    - Calls IndexedDB
 *    ↓
 * 6. IndexedDB (Browser)
 *    - Persists data
 * 
 * Then results flow back UP through the layers to be displayed.
 * 
 * KEY PRINCIPLES DEMONSTRATED:
 * - Separation of Concerns: Each layer has specific responsibility
 * - Dependency Injection: Dependencies passed in, not created
 * - Low Coupling: Layers depend on abstractions
 * - High Cohesion: Related code grouped together
 * - Testability: Each layer can be tested in isolation
 * - Maintainability: Changes localized to appropriate layer
 */
