/**
 * PRAGMATIC INDEXEDDB DATABASE ABSTRACTION
 *
 * This file demonstrates a balanced, pragmatic approach to IndexedDB:
 * - Clean class-based API that hides IndexedDB complexity
 * - Schema-driven development with runtime validation
 * - Promise-based operations for modern async/await usage
 * - Query DSL (Domain-Specific Language) for flexible data retrieval
 * - Automatic transaction management
 *
 * Key Features Demonstrated:
 * 1. Schema validation - Ensures data integrity
 * 2. CRUD operations - Simple, consistent API
 * 3. Query DSL - Declarative filtering, sorting, pagination
 * 4. Private fields - Encapsulation using modern JavaScript
 * 5. Error handling - Proper promise rejections with descriptive messages
 *
 * This is a "pragmatic" approach because it:
 * - Provides useful abstractions without over-engineering
 * - Balances simplicity with production-ready features
 * - Can be understood and extended by any JavaScript developer
 * - Requires minimal configuration to get started
 */

class Database {
  #name;         // Database name
  #version;      // Schema version number (for migrations)
  #schemas;      // Object store schemas with field definitions
  #instance = null;  // IDBDatabase instance once connected
  #active = false;   // Connection status flag

  /**
   * Constructor - Initialize database with configuration
   *
   * @param {string} name - Database name
   * @param {Object} options - Configuration options
   * @param {number} options.version - Schema version (default: 1)
   * @param {Object} options.schemas - Object store definitions
   *
   * Returns a promise that resolves to the Database instance.
   * This allows using: const db = await new Database(...)
   *
   * The constructor immediately calls #open() to establish the connection,
   * making the database ready to use once the promise resolves.
   */
  constructor(name, { version = 1, schemas = {} } = {}) {
    this.#name = name;
    this.#version = version;
    this.#schemas = schemas;
    return this.#open();  // Return promise for async initialization
  }

  /**
   * Private method to open the IndexedDB database
   *
   * This method wraps the IndexedDB.open() callback-based API in a Promise,
   * allowing us to use async/await throughout the application.
   *
   * The version parameter is crucial - if the version is higher than the
   * current database version, onupgradeneeded is triggered, allowing us
   * to create or modify object stores (similar to database migrations).
   *
   * @returns {Promise<Database>} - Returns this for method chaining
   */
  async #open() {
    await new Promise((resolve, reject) => {
      // Open the database - if version > current version, triggers upgrade
      const request = indexedDB.open(this.#name, this.#version);
      
      // Triggered when database needs to be created or version changed
      // This is the ONLY place where we can create/modify object stores
      request.onupgradeneeded = (event) => this.#upgrade(event.target.result);
      
      // Successfully opened - store the connection and mark as active
      request.onsuccess = (event) => {
        this.#instance = event.target.result;
        this.#active = true;
        resolve();
      };
      
      // Handle errors (e.g., user denied permission, database corrupted)
      request.onerror = (event) => {
        let { error } = event.target;
        if (!error) error = new Error(`IndexedDB: can't open ${this.#name}`);
        reject(error);
      };
    });
    return this;  // Return instance for chaining
  }

  /**
   * Private method to upgrade database schema
   *
   * Called during onupgradeneeded event when:
   * - Database is created for the first time
   * - Version number increases (migration)
   *
   * This method:
   * 1. Iterates through all schemas defined in constructor
   * 2. Creates object stores (similar to database tables)
   * 3. Creates indexes on fields marked with index: true
   *
   * Note: Object stores can ONLY be created/modified during upgrade.
   * Once the database is open, the structure is locked until next version.
   *
   * @param {IDBDatabase} db - The database connection in upgrade mode
   */
  #upgrade(db) {
    // Iterate through each schema (e.g., 'user', 'product')
    for (const [name, schema] of Object.entries(this.#schemas)) {
      // Only create if object store doesn't already exist
      if (!db.objectStoreNames.contains(name)) {
        // Create object store with auto-incrementing 'id' as primary key
        const options = { keyPath: 'id', autoIncrement: true };
        const store = db.createObjectStore(name, options);
        
        // Create indexes for fields that have index: true
        // Indexes allow efficient querying by fields other than the primary key
        for (const [field, def] of Object.entries(schema)) {
          if (name !== 'id' && def.index) {
            store.createIndex(field, field, { unique: false });
          }
        }
      }
    }
  }

  /**
   * Private method to execute operations within a transaction
   *
   * This is a Template Method pattern - provides a standard structure
   * for all database operations, handling transaction lifecycle automatically.
   *
   * Benefits:
   * - Eliminates boilerplate transaction code in each method
   * - Ensures consistent error handling
   * - Centralizes transaction management
   * - Makes adding new operations trivial
   *
   * @param {string} store - Object store name
   * @param {Function} operation - Function that performs the actual operation
   * @param {string} mode - Transaction mode ('readwrite' or 'readonly')
   * @returns {Promise} - Resolves with operation result when transaction completes
   */
  #exec(store, operation, mode = 'readwrite') {
    // Ensure database is connected before attempting operations
    if (!this.#active) {
      return Promise.reject(new Error('Database not connected'));
    }
    
    return new Promise((resolve, reject) => {
      try {
        // Create transaction for the specified store
        // readonly is faster when only reading data
        const tx = this.#instance.transaction(store, mode);
        const objectStore = tx.objectStore(store);
        
        // Execute the operation (passed as a function)
        // This is the Strategy pattern - operation logic is injected
        const result = operation(objectStore);
        
        // Wait for transaction to complete before resolving
        // This ensures all changes are committed to the database
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error ?? new Error('Transaction error'));
      } catch (error) {
        // Catch synchronous errors (e.g., invalid store name)
        reject(error);
      }
    });
  }

  /**
   * Validate a record against its schema
   *
   * This method ensures data integrity by checking that:
   * 1. The schema exists for the store
   * 2. All fields in the record are defined in the schema
   * 3. Field values match their declared types
   *
   * This is a pragmatic approach - just enough validation to catch
   * common errors without being overly complex or restrictive.
   *
   * @param {Object} params - Parameters object
   * @param {string} params.store - Object store name
   * @param {Object} params.record - Record to validate
   * @throws {Error} If validation fails
   */
  validate({ store, record }) {
    // Ensure the schema exists
    const schema = this.#schemas[store];
    if (!schema) throw new Error(`Schema for ${store} is not defined`);
    
    // Validate each field in the record
    for (const [key, val] of Object.entries(record)) {
      const field = schema[key];
      const name = `Field ${store}.${key}`;
      
      // Field must be defined in schema
      if (!field) throw new Error(`${name} is not defined`);
      
      // Type checking based on schema definition
      if (field.type === 'int') {
        if (Number.isInteger(val)) continue;
        throw new Error(`${name} expected to be integer`);
      } else if (field.type === 'str') {
        if (typeof val === 'string') continue;
        throw new Error(`${name} expected to be string`);
      }
      // Additional types can be easily added here
    }
  }

  /**
   * Insert a new record into the database
   *
   * Automatically assigns an ID using autoIncrement.
   * Validates the record before insertion to ensure data integrity.
   *
   * @param {Object} params - Parameters object
   * @param {string} params.store - Object store name
   * @param {Object} params.record - Record to insert (without id)
   * @returns {Promise} - Resolves when transaction completes
   */
  insert({ store, record }) {
    // Validate before inserting to catch errors early
    this.validate({ store, record });
    // Use add() which fails if a record with the same key exists
    return this.#exec(store, (objectStore) => objectStore.add(record));
  }

  /**
   * Update an existing record in the database
   *
   * Updates the record with the matching id.
   * If no record with that id exists, creates a new one (upsert behavior).
   *
   * @param {Object} params - Parameters object
   * @param {string} params.store - Object store name
   * @param {Object} params.record - Record to update (must include id)
   * @returns {Promise} - Resolves when transaction completes
   */
  update({ store, record }) {
    // Validate the updated record
    this.validate({ store, record });
    // Use put() which creates or updates (upsert)
    return this.#exec(store, (objectStore) => objectStore.put(record));
  }

  /**
   * Delete a record by its ID
   *
   * @param {Object} params - Parameters object
   * @param {string} params.store - Object store name
   * @param {number|string} params.id - Record ID to delete
   * @returns {Promise} - Resolves when transaction completes
   */
  delete({ store, id }) {
    // Delete operation doesn't need validation
    return this.#exec(store, (objectStore) => objectStore.delete(id));
  }

  /**
   * Retrieve a single record by its ID
   *
   * This is the fastest way to get a specific record.
   * Uses readonly transaction for better performance.
   *
   * @param {Object} params - Parameters object
   * @param {string} params.store - Object store name
   * @param {number|string} params.id - Record ID to retrieve
   * @returns {Promise<Object|undefined>} - The record, or undefined if not found
   */
  get({ store, id }) {
    const op = (objectStore) => {
      // Get by primary key is the fastest operation
      const req = objectStore.get(id);
      // Need to wrap in promise since get() uses callbacks
      return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error(`Can't get ${id}`));
      });
    };
    // Use readonly mode - faster when not modifying data
    return this.#exec(store, op, 'readonly');
  }

  /**
   * Select records using a query DSL (Domain-Specific Language)
   *
   * This is the most powerful method in the Database class.
   * It provides SQL-like querying capabilities using a declarative API.
   *
   * DSL Options:
   * - where: {field: value} - Exact match filtering
   * - filter: (record) => boolean - Custom filter function
   * - order: {field: 'asc'|'desc'} - Sort by field
   * - sort: (a, b) => number - Custom comparator function
   * - limit: number - Maximum results to return
   * - offset: number - Skip first N results
   *
   * Processing order:
   * 1. Iterate through all records via cursor
   * 2. Apply where clause (exact match)
   * 3. Apply filter function
   * 4. Handle offset (skip records)
   * 5. Collect results until limit reached
   * 6. Apply sorting
   *
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} - Array of matching records
   */
  select({ store, where, limit, offset, order, filter, sort }) {
    const op = (objectStore) => {
      const result = [];  // Accumulate matching records
      let skipped = 0;    // Track offset skipping
      
      return new Promise((resolve, reject) => {
        // Helper to finalize and return results
        const reply = () => {
          // Apply custom sort function if provided
          if (sort) result.sort(sort);
          // Apply field-based ordering if provided
          if (order) Database.#sort(result, order);
          resolve(result);
        };
        
        // Open cursor to iterate through all records
        // Cursors are the only way to iterate in IndexedDB
        const req = objectStore.openCursor();
        req.onerror = () => reject(req.error);
        
        req.onsuccess = (event) => {
          const cursor = event.target.result;
          // null cursor means we've reached the end
          if (!cursor) return void reply();
          
          const record = cursor.value;
          
          // Apply where clause (exact match on fields)
          const check = ([key, val]) => record[key] === val;
          const match = !where || Object.entries(where).every(check);
          
          // Apply filter function (custom logic)
          const valid = !filter || filter(record);
          
          // Only include records that pass both where and filter
          if (match && valid) {
            // Handle offset by skipping first N matching records
            if (!offset || skipped >= offset) result.push(record);
            else skipped++;
            
            // Stop if we've reached the limit
            if (limit && result.length >= limit) return void reply();
          }
          
          // Move to next record
          cursor.continue();
        };
      });
    };
    // Use readonly mode for better performance
    return this.#exec(store, op, 'readonly');
  }

  /**
   * Static helper method to sort an array by a field
   *
   * This method implements declarative sorting like SQL's ORDER BY.
   * It modifies the array in-place for efficiency.
   *
   * Expected order format: { fieldName: 'asc' | 'desc' }
   * Example: { name: 'asc' } or { age: 'desc' }
   *
   * @param {Array} arr - Array to sort (modified in-place)
   * @param {Object} order - Sort specification {field: direction}
   */
  static #sort(arr, order) {
    // Validate order parameter
    if (typeof order !== 'object') return;
    const rule = Object.entries(order)[0];
    if (!Array.isArray(rule)) return;
    
    // Extract field name and direction
    const [field, dir = 'asc'] = rule;
    
    // Use sign multiplier for direction: asc=1, desc=-1
    // This allows a single comparison logic for both directions
    const sign = dir === 'desc' ? -1 : 1;
    
    // Sort in-place using the field values
    arr.sort((a, b) => {
      const x = a[field];
      const y = b[field];
      if (x === y) return 0;
      return x > y ? sign : -sign;
    });
  }
}

// Export the Database class for use in other modules
export { Database };
