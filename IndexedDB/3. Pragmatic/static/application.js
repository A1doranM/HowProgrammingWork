/**
 * PRAGMATIC INDEXEDDB DEMO APPLICATION
 *
 * This file demonstrates practical usage of the Database abstraction layer.
 * It shows how to:
 * - Initialize a database with schemas
 * - Perform CRUD operations (Create, Read, Update, Delete)
 * - Use the query DSL for filtering and sorting
 * - Handle errors gracefully
 * - Build a simple interactive UI
 *
 * Key Patterns Demonstrated:
 * 1. Declarative schema definitions
 * 2. Named parameter objects for clarity
 * 3. Async/await for clean asynchronous code
 * 4. Action handlers organized in an object
 * 5. Separation of concerns (Logger, Database, UI)
 *
 * This is pragmatic because:
 * - Simple enough to understand quickly
 * - Structured enough to be maintainable
 * - No unnecessary architectural complexity
 * - Real-world patterns that scale
 */

import { Database } from './storage.js';

/**
 * Logger utility class for displaying output
 *
 * Provides a simple abstraction over DOM manipulation for logging.
 * This demonstrates the Single Responsibility Principle - Logger
 * only handles output formatting and display.
 */
class Logger {
  #output;  // Private reference to the output DOM element

  /**
   * Initialize the logger with a target output element
   * @param {string} outputId - DOM element ID for displaying logs
   */
  constructor(outputId) {
    this.#output = document.getElementById(outputId);
  }

  /**
   * Log one or more values to the output
   *
   * Automatically formats objects as JSON for readability.
   * Auto-scrolls to show the latest output.
   *
   * @param {...any} args - Values to log (strings, objects, etc.)
   */
  log(...args) {
    // Serialize each argument (objects to JSON, primitives to strings)
    const lines = args.map(Logger.#serialize);
    // Append to output with newline
    this.#output.textContent += lines.join(' ') + '\n';
    // Auto-scroll to bottom to show latest output
    this.#output.scrollTop = this.#output.scrollHeight;
  }

  /**
   * Convert a value to a string representation
   * Objects are formatted as pretty-printed JSON
   *
   * @param {any} x - Value to serialize
   * @returns {string} - String representation
   */
  static #serialize(x) {
    return typeof x === 'object' ? JSON.stringify(x, null, 2) : x;
  }
}

// Initialize logger for displaying output in the UI
const logger = new Logger('output');

/**
 * Schema definitions for the database
 *
 * Schemas define:
 * - Field names and types (for validation)
 * - Which field is the primary key
 * - Which fields should be indexed (for efficient querying)
 *
 * This declarative approach makes the database structure clear
 * and enables automatic validation and index creation.
 */
const schemas = {
  user: {
    id: { type: 'int', primary: true },     // Auto-incrementing primary key
    name: { type: 'str', index: true },     // String field with index
    age: { type: 'int' },                   // Integer field (no index)
  },
};

/**
 * Initialize the database
 *
 * The 'await' keyword here demonstrates async initialization.
 * The Database constructor returns a promise, ensuring the database
 * is fully open and ready before any operations are performed.
 *
 * This is one of the key pragmatic features - simple initialization
 * that just works, hiding all the IndexedDB complexity.
 */
const db = await new Database('Example', { version: 1, schemas });

/**
 * Action handlers for UI buttons
 *
 * Each action is an async function that demonstrates a different
 * database operation. They're organized in an object for easy
 * iteration and binding to UI elements.
 *
 * This pattern makes it trivial to add new actions - just add
 * a new property with a matching button ID in the HTML.
 */
const actions = {
  /**
   * Add a new user to the database
   *
   * Demonstrates:
   * - Using prompt() for simple user input
   * - Creating a record object
   * - Calling insert() with named parameters
   * - Automatic ID assignment
   */
  add: async () => {
    const name = prompt('Enter user name:');
    const age = parseInt(prompt('Enter age:'), 10);
    const user = { name, age };  // No need to specify 'id' - auto-increments
    await db.insert({ store: 'user', record: user });
    logger.log('Added:', user);
  },

  /**
   * Retrieve and display all users
   *
   * Demonstrates:
   * - Using select() without filters (gets all records)
   * - Simple, clean syntax
   */
  get: async () => {
    const users = await db.select({ store: 'user' });
    logger.log('Users:', users);
  },

  /**
   * Update an existing user
   *
   * Demonstrates:
   * - Retrieving a record by ID
   * - Modifying the record
   * - Updating it in the database
   * - Handling the case where record doesn't exist
   */
  update: async () => {
    const user = await db.get({ store: 'user', id: 1 });
    if (user) {
      user.age += 1;  // Increment age
      await db.update({ store: 'user', record: user });
      logger.log('Updated:', user);
    } else {
      logger.log('User with id=1 not found');
    }
  },

  /**
   * Delete a user by ID
   *
   * Demonstrates:
   * - Simple deletion by primary key
   * - Clean, declarative API
   */
  delete: async () => {
    await db.delete({ store: 'user', id: 2 });
    logger.log('Deleted user with id=2');
  },

  /**
   * Query for adult users (18+) with sorting and limit
   *
   * Demonstrates:
   * - Using the query DSL
   * - filter: custom function for complex conditions
   * - order: declarative sorting
   * - limit: pagination support
   *
   * This shows the power of the pragmatic approach - you get
   * SQL-like querying without the complexity of a full ORM.
   */
  adults: async () => {
    const users = await db.select({
      store: 'user',
      filter: (user) => user.age >= 18,  // Custom filter function
      order: { name: 'asc' },            // Sort by name ascending
      limit: 10,                         // Maximum 10 results
    });
    logger.log('Adults:', users);
  },
};

/**
 * Helper function to bind an action handler to a button
 *
 * This abstracts the process of:
 * 1. Finding the button element
 * 2. Attaching an onclick handler
 * 3. Handling errors gracefully
 *
 * The error handling is particularly important - if an action fails,
 * we catch the error and display it rather than letting it crash.
 *
 * @param {string} id - Button element ID (matches action name)
 * @param {Function} handler - Async function to execute on click
 */
const action = (id, handler) => {
  const element = document.getElementById(id);
  if (!element) return;  // Gracefully handle missing elements
  
  element.onclick = () => {
    // Call the async handler and catch any errors
    handler().catch((error) => {
      // Display errors in the output rather than in console
      logger.log(error.message);
    });
  };
};

/**
 * Bind all actions to their corresponding buttons
 *
 * This loop demonstrates a pragmatic pattern:
 * - Action names in the object match button IDs in HTML
 * - No need to manually wire up each button
 * - Adding new actions is as simple as adding to the actions object
 *
 * Convention over configuration - a pragmatic principle.
 */
for (const [id, handler] of Object.entries(actions)) {
  action(id, handler);
}
