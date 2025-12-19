/**/-/**
 * NATIVE INDEXEDDB IMPLEMENTATION - APPLICATION LOGIC
 * ====================================================
 *
 * This file demonstrates the native, low-level IndexedDB API usage without any
 * abstraction layers or libraries. It showcases fundamental concepts including:
 *
 * 1. Database opening and version management
 * 2. Object store (table) creation
 * 3. Transaction-based operations (readonly and readwrite)
 * 4. CRUD operations (Create, Read, Update, Delete)
 * 5. Cursor-based iteration for custom filtering
 * 6. Event-driven callback patterns
 *
 * This implementation uses ES6 modules and demonstrates best practices for
 * working with IndexedDB's asynchronous, event-based API.
 */

// ==============================================================================
// LOGGER UTILITY CLASS
// ==============================================================================

/**
 * Logger class for displaying operation results in the UI.
 *
 * Provides a console-like output mechanism that serializes JavaScript objects
 * to JSON and displays them in a readable format. This follows the Single
 * Responsibility Principle (SRP) by separating output logic from business logic.
 */
class Logger {
  // Private field to store reference to the output element
  // Using # prefix for true private fields (ES2022 feature)
  #output;

  /**
   * Initialize the logger with a reference to the output element.
   *
   * @param {string} outputId - The DOM element ID where logs will be displayed
   */
  constructor(outputId) {
    this.#output = document.getElementById(outputId);
  }

  /**
   * Log one or more values to the output display.
   *
   * This method:
   * 1. Serializes each argument (objects to JSON, primitives to string)
   * 2. Appends them to the output element
   * 3. Auto-scrolls to show the latest entry
   *
   * @param {...any} args - Variable number of arguments to log
   */
  log(...args) {
    const lines = args.map(Logger.#serialize);
    this.#output.textContent += lines.join(' ') + '\n';
    // Auto-scroll to bottom to show latest log entry
    this.#output.scrollTop = this.#output.scrollHeight;
  }

  /**
   * Private static method to serialize values for display.
   *
   * Objects are converted to pretty-printed JSON with 2-space indentation.
   * Primitives (strings, numbers, booleans) are converted to strings.
   *
   * @param {any} x - Value to serialize
   * @returns {string} String representation of the value
   */
  static #serialize(x) {
    return typeof x === 'object' ? JSON.stringify(x, null, 2) : x;
  }
}

// Create a global logger instance for use throughout the application
const logger = new Logger('output');

// ==============================================================================
// DATABASE INITIALIZATION
// ==============================================================================

/**
 * Open or create the IndexedDB database.
 *
 * This section demonstrates:
 * - Database opening with version number
 * - Schema creation via the 'upgradeneeded' event
 * - Promise wrapping of the event-based API for cleaner async code
 * - Object store creation with auto-incrementing primary key
 *
 * The 'await' at the top level is possible because this is an ES module.
 */
const db = await new Promise((resolve, reject) => {
  /**
   * Open database named 'Example' with version 1.
   *
   * Version management in IndexedDB:
   * - If the database doesn't exist, it will be created
   * - If the version is higher than existing, 'onupgradeneeded' fires
   * - Version must be a positive integer
   */
  const request = indexedDB.open('Example', 1);

  /**
   * Handle database upgrade (schema changes).
   *
   * This event fires when:
   * - The database is created for the first time (version 0 → 1)
   * - The version number increases (e.g., 1 → 2)
   *
   * This is the ONLY place where you can modify the database schema
   * (create/delete object stores, create/delete indexes).
   */
  request.onupgradeneeded = () => {
    const db = request.result;
    
    // Check if 'user' object store already exists to avoid errors
    if (!db.objectStoreNames.contains('user')) {
      /**
       * Create an object store named 'user'.
       *
       * Object stores are like tables in relational databases.
       * Configuration:
       * - keyPath: 'id' - The property that will serve as the primary key
       * - autoIncrement: true - Automatically generate sequential IDs
       *
       * This means each record must have an 'id' property, and if not
       * provided, it will be auto-generated starting from 1.
       */
      db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });
    }
  };

  /**
   * Handle successful database opening.
   *
   * Once the database is successfully opened (and upgraded if needed),
   * this event fires and we resolve the Promise with the database instance.
   */
  request.onsuccess = () => resolve(request.result);

  /**
   * Handle errors during database opening.
   *
   * Possible errors:
   * - Browser doesn't support IndexedDB
   * - User denied storage permission
   * - Quota exceeded
   * - Version downgrade attempted (not allowed)
   */
  request.onerror = () => reject(request.error);
});

// ==============================================================================
// CREATE OPERATION - Add New User
// ==============================================================================

/**
 * Handler for adding a new user to the database.
 *
 * This demonstrates:
 * - User input collection via prompts
 * - Input validation
 * - Creating a readwrite transaction
 * - Using the add() method for insertions
 * - Transaction completion events
 */
document.getElementById('add').onclick = () => {
  // Collect user input via browser prompts
  const name = prompt('Enter user name:');
  // Guard clause: exit early if user cancels or provides empty name
  if (!name) return;

  // Collect age and parse as integer (base 10)
  const age = parseInt(prompt('Enter age:'), 10);
  // Validate that the parsed value is a valid integer
  if (!Number.isInteger(age)) return;

  /**
   * Create a transaction for the 'user' object store.
   *
   * Transaction modes:
   * - 'readonly': For read operations (SELECT)
   * - 'readwrite': For write operations (INSERT, UPDATE, DELETE)
   *
   * Why transactions?
   * - Ensures data consistency (ACID properties)
   * - Allows multiple operations to be atomic
   * - Prevents race conditions
   */
  const tx = db.transaction('user', 'readwrite');

  /**
   * Add the new user record to the object store.
   *
   * The add() method:
   * - Inserts a new record
   * - Fails if a record with the same key already exists
   * - The 'id' field will be auto-generated due to autoIncrement
   * - Returns an IDBRequest object (event-driven, not a Promise)
   */
  tx.objectStore('user').add({ name, age });

  /**
   * Transaction completion handler.
   *
   * This fires when ALL operations in the transaction succeed and
   * the transaction commits. In this case, we only have one add()
   * operation, so it fires immediately after that succeeds.
   */
  tx.oncomplete = () => logger.log('Added:', { name, age });

  /**
   * Transaction error handler.
   *
   * Fires if ANY operation in the transaction fails.
   * The entire transaction is rolled back (atomic behavior).
   */
  tx.onerror = () => logger.log('Add failed');
};

// ==============================================================================
// READ OPERATION - Get All Users
// ==============================================================================

/**
 * Handler for retrieving all users from the database.
 *
 * This demonstrates:
 * - Creating a readonly transaction (since we're only reading)
 * - Using getAll() to retrieve all records
 * - Handling request success events
 */
document.getElementById('get').onclick = () => {
  /**
   * Create a readonly transaction.
   *
   * Using 'readonly' when possible is a best practice because:
   * - It's more efficient (no locking overhead)
   * - Multiple readonly transactions can run concurrently
   * - Prevents accidental modifications
   */
  const tx = db.transaction('user', 'readonly');

  // Get reference to the 'user' object store from the transaction
  const store = tx.objectStore('user');

  /**
   * Request all records from the object store.
   *
   * getAll() retrieves every record in the store.
   * For large datasets, consider using cursors with limits instead.
   */
  const req = store.getAll();

  /**
   * Handle successful retrieval.
   *
   * req.result contains an array of all user objects.
   * Each object includes the auto-generated 'id' field.
   */
  req.onsuccess = () => logger.log('Users:', req.result);

  /**
   * Handle retrieval errors.
   *
   * Errors are rare for simple getAll(), but could occur due to:
   * - Database corruption
   * - Browser storage issues
   */
  req.onerror = () => logger.log('Get failed');
};

// ==============================================================================
// UPDATE OPERATION - Modify Existing User
// ==============================================================================

/**
 * Handler for updating user with id=1.
 *
 * This demonstrates:
 * - Retrieving a specific record by key
 * - Modifying the retrieved object
 * - Using put() to save changes
 * - Handling cases where the record doesn't exist
 */
document.getElementById('update').onclick = () => {
  // Create readwrite transaction since we'll be modifying data
  const tx = db.transaction('user', 'readwrite');
  const store = tx.objectStore('user');

  /**
   * Retrieve user with id=1.
   *
   * get(key) retrieves a single record by its primary key.
   * Returns undefined if no record with that key exists.
   */
  const req = store.get(1);

  /**
   * Handle successful retrieval.
   *
   * The typical update pattern in IndexedDB:
   * 1. Get the record
   * 2. Modify the object
   * 3. Put it back using put()
   */
  req.onsuccess = () => {
    const user = req.result;

    // Check if the user exists before attempting to update
    if (!user) {
      logger.log('User with id=1 not found');
      return;
    }

    /**
     * Modify the user object.
     *
     * In this example, we increment the age by 1.
     * You can modify any properties except the keyPath ('id').
     */
    user.age += 1;

    /**
     * Save the modified object back to the store.
     *
     * put() method:
     * - Updates existing record if key exists
     * - Inserts new record if key doesn't exist
     * - This is an "upsert" operation
     *
     * Note: We don't need to capture the put() request because
     * we're using the transaction's oncomplete event instead.
     */
    store.put(user);

    /**
     * Log success when the entire transaction completes.
     *
     * Attached to transaction, not the put request, because:
     * - It fires after ALL operations succeed
     * - Ensures data is committed to disk
     * - More reliable indicator of actual persistence
     */
    tx.oncomplete = () => logger.log('Updated:', user);
  };

  /**
   * Handle retrieval errors.
   *
   * This handles errors from the get() operation.
   * If get() fails, put() never executes.
   */
  req.onerror = () => logger.log('Update failed');
};

// ==============================================================================
// DELETE OPERATION - Remove User
// ==============================================================================

/**
 * Handler for deleting user with id=2.
 *
 * This demonstrates:
 * - Simple deletion by key
 * - Transaction-based deletion
 * - The simplest CRUD operation in IndexedDB
 */
document.getElementById('delete').onclick = () => {
  // Create readwrite transaction for the deletion
  const tx = db.transaction('user', 'readwrite');

  /**
   * Delete the record with id=2.
   *
   * delete(key) removes the record with the specified key.
   * - Succeeds even if the key doesn't exist (no error)
   * - Returns an IDBRequest, but we don't need to handle it
   * - Transaction completion is sufficient confirmation
   */
  tx.objectStore('user').delete(2);

  /**
   * Log success when transaction completes.
   *
   * The deletion is guaranteed to be persisted when this fires.
   */
  tx.oncomplete = () => logger.log('Deleted user with id=2');

  /**
   * Handle deletion errors.
   *
   * Rare, but could occur due to:
   * - Database corruption
   * - Storage quota issues (during cleanup)
   */
  tx.onerror = () => logger.log('Delete failed');
};

// ==============================================================================
// CURSOR-BASED FILTERING - Find Adults (age >= 18)
// ==============================================================================

/**
 * Handler for finding all users aged 18 or above using a cursor.
 *
 * This demonstrates:
 * - Cursor-based iteration through records
 * - Custom filtering logic without indexes
 * - Manual accumulation of results
 * - The cursor pattern for processing records sequentially
 *
 * Why use cursors?
 * - When you need custom filtering that indexes don't support
 * - To process large datasets without loading everything into memory
 * - For complex queries that require examining each record
 */
document.getElementById('adults').onclick = () => {
  // Create readonly transaction since we're only reading
  const tx = db.transaction('user', 'readonly');
  const store = tx.objectStore('user');

  /**
   * Open a cursor to iterate through records.
   *
   * openCursor() variations:
   * - openCursor() - iterates all records in key order
   * - openCursor(range) - iterates records within a key range
   * - openCursor(range, direction) - controls iteration direction
   *
   * Without arguments, it iterates all records from first to last.
   */
  const req = store.openCursor();

  // Array to accumulate matching users
  const adults = [];

  /**
   * Cursor iteration handler.
   *
   * This event fires once per record, plus one final time with null cursor.
   *
   * Cursor iteration pattern:
   * 1. Check if cursor is null (iteration complete)
   * 2. If not null, process cursor.value (current record)
   * 3. Call cursor.continue() to advance to next record
   * 4. Repeat until cursor is null
   */
  req.onsuccess = (event) => {
    // Extract cursor from event target
    const cursor = event.target.result;

    /**
     * Check if iteration is complete.
     *
     * cursor is null when:
     * - All records have been processed
     * - No records exist in the store
     * - The iteration range is exhausted
     */
    if (!cursor) {
      // Iteration complete - log all collected adults
      logger.log('Adults:', adults);
      return;
    }

    /**
     * Process the current record.
     *
     * cursor.value contains the entire record object.
     * cursor.key contains the primary key (in this case, 'id').
     */
    const user = cursor.value;

    /**
     * Apply custom filter logic.
     *
     * Here we check if age >= 18. You can apply any logic:
     * - Complex conditions with multiple fields
     * - Regular expression matching on strings
     * - Date comparisons
     * - Computed properties
     */
    if (user.age >= 18) adults.push(user);

    /**
     * Advance to the next record.
     *
     * cursor.continue() triggers the next onsuccess event.
     *
     * Alternatives:
     * - cursor.advance(n) - skip n records
     * - cursor.continuePrimaryKey(key, primaryKey) - jump to specific position
     * - Not calling continue() stops iteration early
     */
    cursor.continue();
  };

  /**
   * Handle cursor errors.
   *
   * Errors during cursor iteration are rare but possible.
   */
  req.onerror = () => logger.log('Adult query failed');
};
