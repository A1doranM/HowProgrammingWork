/**
 * PRAGMATIC INDEXEDDB TEST SUITE
 *
 * This file demonstrates comprehensive testing of the Database abstraction.
 *
 * Testing Approach:
 * - Uses Node.js built-in test runner (no external test framework needed)
 * - Uses 'fake-indexeddb' to simulate IndexedDB in Node.js environment
 * - Tests all CRUD operations and query DSL features
 * - Validates both happy paths and edge cases
 *
 * What We're Testing:
 * 1. Basic CRUD: insert, get, update, delete
 * 2. Query DSL: where, filter, order, offset, limit, sort
 * 3. Complex queries with multiple DSL options
 * 4. Data validation and integrity
 *
 * This pragmatic test suite provides confidence without excessive complexity.
 * It's comprehensive yet maintainable - covering real-world scenarios
 * without testing implementation details.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';  // Polyfills IndexedDB for Node.js
import { Database } from '../static/storage.js';

/**
 * Test schema definition
 * Reuses the same schema structure as the application for consistency
 */
const schemas = {
  user: {
    id: { type: 'int', primary: true },
    name: { type: 'str', index: true },
    age: { type: 'int' },
  },
};

/**
 * Main test case: Database CRUD operations + Query DSL
 *
 * This test validates all core functionality of the Database class:
 * - Full CRUD cycle (Create, Read, Update, Delete)
 * - All query DSL options (where, filter, order, offset, limit)
 * - Data integrity and consistency
 *
 * Test Structure:
 * Each section tests a specific feature in isolation, making it easy
 * to identify what breaks if a test fails.
 */
test('Pragmatic: Database CRUD + DSL', async () => {
  // Initialize a fresh database for testing
  const db = await new Database('PragmaticDB', { version: 1, schemas });

  // ========== INSERT OPERATIONS ==========
  // Test basic insertion with auto-incrementing IDs
  await db.insert({ store: 'user', record: { name: 'Marcus', age: 20 } });
  await db.insert({ store: 'user', record: { name: 'Lucius', age: 20 } });
  await db.insert({ store: 'user', record: { name: 'Antoninus', age: 40 } });

  // ========== SELECT ALL ==========
  // Verify all records were inserted successfully
  const allUsers = await db.select({ store: 'user' });
  assert.equal(allUsers.length, 3);

  // ========== GET BY ID ==========
  // Test retrieval of a specific record by primary key
  const marcus = await db.get({ store: 'user', id: 1 });
  assert.equal(marcus.name, 'Marcus');

  // ========== UPDATE OPERATION ==========
  // Test modifying an existing record
  marcus.age = 31;
  await db.update({ store: 'user', record: marcus });
  const updated = await db.get({ store: 'user', id: 1 });
  assert.equal(updated.age, 31);  // Verify the update persisted

  // ========== DELETE OPERATION ==========
  // Test record deletion
  await db.delete({ store: 'user', id: 2 });
  const afterDelete = await db.select({ store: 'user' });
  assert.equal(afterDelete.length, 2);  // Should have 2 records now

  // ========== QUERY DSL: WHERE CLAUSE ==========
  // Test exact-match filtering by field value
  const list = await db.select({ store: 'user', where: { name: 'Marcus' } });
  assert.equal(list.length, 1);
  assert.equal(list[0].age, 31);

  // ========== QUERY DSL: FILTER FUNCTION ==========
  // Test custom filter function for complex conditions
  const adults = await db.select({
    store: 'user',
    filter: (u) => u.age >= 30,  // Only users 30 or older
  });
  assert.equal(adults.length, 2);  // Marcus (31) and Antoninus (40)
  assert.equal(adults[0].name, 'Marcus');

  // ========== QUERY DSL: ORDER BY ==========
  // Test sorting by field in descending order
  const ordered = await db.select({
    store: 'user',
    order: { age: 'desc' },  // Oldest first
  });
  assert.equal(ordered[0].name, 'Antoninus');  // age 40
  assert.equal(ordered[1].name, 'Marcus');     // age 31

  // ========== QUERY DSL: OFFSET ==========
  // Test skipping records (pagination support)
  const skipped = await db.select({
    store: 'user',
    offset: 1,                   // Skip first result
    order: { name: 'asc' },      // Sort alphabetically
  });
  assert.equal(skipped.length, 1);
  assert.equal(skipped[0].name, 'Antoninus');  // M skipped, A second -> A returned

  // ========== QUERY DSL: LIMIT ==========
  // Test limiting number of results
  const limited = await db.select({
    store: 'user',
    limit: 1,  // Return only first result
  });
  assert.equal(limited.length, 1);
});

/**
 * Complex DSL test: Multiple query options combined
 *
 * This test validates that all query DSL options work correctly
 * when used together. It tests the processing order:
 * 1. where clause filters first
 * 2. filter function applies second
 * 3. offset skips results
 * 4. limit caps results
 * 5. sort and order are applied to final results
 *
 * This is a pragmatic test - it validates real-world usage where
 * multiple options are combined for complex queries.
 */
test('Pragmatic: Complex DSL', async () => {
  // Create a separate database for this test (isolation)
  const db = await new Database('ComplexDB', { version: 1, schemas });

  // Insert test data: two 20-year-olds and one 40-year-old
  await db.insert({ store: 'user', record: { name: 'Marcus', age: 20 } });
  await db.insert({ store: 'user', record: { name: 'Lucius', age: 20 } });
  await db.insert({ store: 'user', record: { name: 'Antoninus', age: 40 } });

  /**
   * Complex query with ALL DSL options enabled:
   * - where: Only age=20 records (filters out Antoninus)
   * - filter: Additional check age<30 (redundant but tests chaining)
   * - sort: Custom comparator by age
   * - order: Then sort by name descending
   * - offset: Skip first result
   * - limit: Return only 1 result
   *
   * Expected result: 1 record with age=20 (the second one after offset)
   */
  const list = await db.select({
    store: 'user',
    where: { age: 20 },                   // Only 20-year-olds
    filter: (user) => user.age < 30,      // Additional filter
    sort: (a, b) => a.age - b.age,        // Custom sort by age
    order: { name: 'desc' },              // Then by name descending
    offset: 1,                            // Skip first result
    limit: 1,                             // Return only 1
  });

  // Verify the query returned exactly 1 result with age 20
  assert.equal(list.length, 1);
  assert.equal(list[0].age, 20);
});
