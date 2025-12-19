/**
 * DATABASE ABSTRACTION LAYER
 * ==========================
 * 
 * This file demonstrates the FACADE PATTERN to wrap IndexedDB's complex API
 * into a clean, Promise-based interface.
 * 
 * DESIGN PATTERNS APPLIED:
 * - Facade Pattern: Simplifies IndexedDB's callback-based API
 * - Promise Pattern: Converts callbacks to modern async/await
 * 
 * GRASP PRINCIPLES:
 * - Information Expert: Database has knowledge of connection state
 * - Pure Fabrication: Not a domain concept, but necessary infrastructure
 * - Low Coupling: Provides simple interface hiding IndexedDB complexity
 * - Protected Variations: Shields rest of application from IndexedDB API changes
 * 
 * SOLID PRINCIPLES:
 * - Single Responsibility: Only manages database connection and transactions
 * - Open/Closed: Can be extended without modification
 * - Dependency Inversion: Higher layers depend on this abstraction, not IndexedDB
 * 
 * KEY CONCEPTS:
 * - Private fields (#db) for encapsulation
 * - Promise wrappers around IndexedDB callbacks
 * - Centralized transaction management
 * - Upgrade callback for schema evolution
 */

export class Database {
  /**
   * PRIVATE FIELD: Database Instance
   * 
   * Using JavaScript private field (#) ensures the database instance
   * cannot be accessed or modified from outside this class.
   * 
   * This is ENCAPSULATION - protecting internal state from external interference.
   * 
   * Benefits:
   * - Prevents accidental modification of database connection
   * - Forces all database access through controlled methods
   * - Makes the API surface smaller and safer
   */
  #db;

  /**
   * CONSTRUCTOR: Database Configuration
   * 
   * @param {string} name - Database name (e.g., 'MyApplication')
   * @param {number} version - Schema version for migrations (default: 1)
   * @param {Function} upgradeCallback - Schema setup function called during upgrades
   * 
   * PATTERN: Strategy Pattern (upgradeCallback)
   * - Allows client to define schema without modifying Database class
   * - Follows Open/Closed Principle (open for extension, closed for modification)
   * 
   * NOTE: Connection is not established in constructor (lazy initialization)
   * - Constructors should not perform I/O operations
   * - Call connect() explicitly after construction
   */
  constructor(name, version = 1, upgradeCallback) {
    this.name = name;
    this.version = version;
    this.upgradeCallback = upgradeCallback;
  }

  /**
   * CONNECT: Establish Database Connection
   * 
   * This method wraps IndexedDB's callback-based open() in a Promise,
   * enabling modern async/await syntax throughout the application.
   * 
   * FLOW:
   * 1. Call indexedDB.open() to request database connection
   * 2. If version is new/higher → onupgradeneeded fires → run schema setup
   * 3. Once ready → onsuccess fires → store connection in private field
   * 4. On error → onerror fires → reject Promise with error
   * 
   * WHY PROMISE WRAPPER:
   * - IndexedDB uses callback-based API (onsuccess, onerror)
   * - Promises enable cleaner async/await code
   * - Consistent error handling with try/catch
   * 
   * USAGE:
   *   const db = new Database('MyDB', 1, (db) => {
   *     db.createObjectStore('users', { keyPath: 'id' });
   *   });
   *   await db.connect(); // Wait for connection
   */
  async connect() {
    return new Promise((resolve, reject) => {
      // Request to open database with specified version
      const request = indexedDB.open(this.name, this.version);

      /**
       * ONUPGRADENEEDED: Schema Migration Handler
       * 
       * This event fires when:
       * - Database is created for the first time (version 0 → 1)
       * - Version number is incremented (e.g., 1 → 2)
       * 
       * This is where you create/modify object stores and indexes.
       * It's the ONLY place where schema changes are allowed.
       * 
       * PATTERN: Template Method
       * - We define the structure (when to call callback)
       * - Client defines the content (what schema to create)
       */
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // Delegate schema creation to client-provided callback
        if (this.upgradeCallback) this.upgradeCallback(db);
      };

      /**
       * ONSUCCESS: Connection Established
       * 
       * Store the database connection in private field and resolve Promise.
       * After this, the database is ready for transactions.
       */
      request.onsuccess = () => {
        this.#db = request.result; // Store in private field
        resolve(); // Signal that connection is ready
      };

      /**
       * ONERROR: Connection Failed
       * 
       * Reject Promise with the error so caller can handle it with try/catch.
       */
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * TRANSACTION: Get Object Store for Direct Access
   * 
   * This method provides direct access to an object store for manual operations.
   * 
   * @param {string} storeName - Name of the object store (e.g., 'user')
   * @param {string} mode - Transaction mode: 'readonly' or 'readwrite'
   * @returns {IDBObjectStore} Object store for performing operations
   * 
   * NOTE: This is a low-level API. Most code should use exec() instead.
   * 
   * USAGE:
   *   const store = db.transaction('user', 'readonly');
   *   const request = store.get(1);
   */
  transaction(storeName, mode = 'readonly') {
    // Create transaction and immediately return the object store
    const tx = this.#db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  /**
   * EXEC: Execute Operation in Transaction Context
   * 
   * This is the primary API for database operations. It abstracts the
   * transaction lifecycle, letting you focus on the operation itself.
   * 
   * @param {string} storeName - Object store to operate on
   * @param {string} mode - Transaction mode ('readonly' or 'readwrite')
   * @param {Function} operation - Function that receives store and returns result
   * @returns {Promise} Resolves with operation result, rejects on error
   * 
   * PATTERN: Template Method + Strategy
   * - Template Method: We manage transaction lifecycle (create, wait, resolve/reject)
   * - Strategy: Client provides operation logic via function parameter
   * 
   * TRANSACTION LIFECYCLE:
   * 1. Create transaction with specified mode
   * 2. Get object store from transaction
   * 3. Execute client operation on store
   * 4. Wait for transaction to complete
   * 5. Resolve Promise with result
   * 
   * WHY THIS IS BETTER THAN RAW IndexedDB:
   * - No need to manually manage transaction lifecycle
   * - Consistent Promise-based error handling
   * - Transaction completes automatically
   * - Less boilerplate code
   * 
   * USAGE:
   *   await db.exec('user', 'readwrite', (store) => {
   *     return store.add({ name: 'Alice', age: 30 });
   *   });
   * 
   * GRASP: High Cohesion
   * - All transaction management logic in one place
   * - Operation logic separated (passed in as function)
   */
  exec(storeName, mode, operation) {
    return new Promise((resolve, reject) => {
      try {
        // 1. Create transaction with specified mode
        const tx = this.#db.transaction(storeName, mode);
        
        // 2. Get object store from transaction
        const store = tx.objectStore(storeName);
        
        // 3. Execute client operation (may return IDBRequest or Promise)
        const result = operation(store);
        
        // 4. Wait for transaction to complete successfully
        // NOTE: Transaction auto-completes when all requests are done
        tx.oncomplete = () => resolve(result);
        
        // 5. Handle transaction-level errors
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        // Handle synchronous errors (e.g., operation threw exception)
        reject(err);
      }
    });
  }
}
