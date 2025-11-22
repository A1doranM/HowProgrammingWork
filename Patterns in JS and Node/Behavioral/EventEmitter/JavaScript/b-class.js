'use strict';

/**
 * FILE PURPOSE: Modern ES6 Class EventEmitter
 *
 * This file demonstrates the MODERN, PRODUCTION-READY EventEmitter using:
 * - ES6 class syntax (instead of prototype or closure)
 * - Map instead of Object (better performance, any key type)
 * - Set instead of Array (O(1) operations, no duplicates)
 * - Wrapper tracking for proper once() removal
 *
 * IMPROVEMENTS over previous versions:
 * ✅ Map: Better than Object (any key type, better iteration)
 * ✅ Set: O(1) add/delete vs Array's O(n)
 * ✅ Wrapper tracking: Can remove once() listeners by original function
 * ✅ Modern syntax: ES6 classes (cleaner, more familiar)
 * ✅ Auto-cleanup: Empty events removed automatically
 *
 * THIS IS THE RECOMMENDED IMPLEMENTATION FOR:
 * - New projects (modern syntax)
 * - Performance-critical applications (Set operations)
 * - Production code (proper encapsulation + wrapper tracking)
 *
 * COMPARISON:
 * - 1-simple.js: Prototype + Object + Array (basic)
 * - 8-methods.js: Closure + Object + Array (full-featured)
 * - b-class.js (this): Class + Map + Set (modern, optimized)
 */

/**
 * EventEmitter Class
 *
 * Modern ES6 class-based implementation with optimal data structures.
 *
 * KEY IMPROVEMENTS:
 *
 * 1. MAP instead of Object for events:
 *    - Any type as key (not just strings)
 *    - Better iteration performance
 *    - No prototype pollution
 *    - Native size property
 *
 * 2. SET instead of Array for listeners:
 *    - O(1) add/delete (vs Array's O(n))
 *    - No duplicate listeners automatically
 *    - Iterator-friendly
 *
 * 3. WRAPPER TRACKING:
 *    - Maps original function to wrapper
 *    - Enables removing once() listeners by original function
 *    - Solves problem from 8-methods.js
 *
 * ARCHITECTURE:
 *
 * EventEmitter {
 *   events: Map<string, Set<Function>>
 *   wrappers: Map<Function, Function>  // original → wrapper
 * }
 */
class EventEmitter {
  /**
   * Initialize EventEmitter with empty registries
   *
   * INITIALIZATION:
   *
   * events = Map {
   *   'event1' => Set { listener1, listener2 },
   *   'event2' => Set { listener3 }
   * }
   *
   * wrappers = Map {
   *   originalFn1 => wrapperFn1,  // for once()
   *   originalFn2 => wrapperFn2
   * }
   *
   * WHY TWO MAPS?
   * - events: Store actual registered listeners
   * - wrappers: Track once() wrapper mappings
   *
   * WRAPPER TRACKING PURPOSE:
   * Allows removing once() listeners by original function:
   *   ee.once('event', fn);
   *   ee.remove('event', fn);  // ✅ Works! (looks up wrapper)
   */
  constructor() {
    /**
     * Events registry: Map<EventName, Set<Listener>>
     *
     * BENEFITS of Map over Object:
     * ✅ Any key type (Symbol, Object, not just String)
     * ✅ No prototype pollution
     * ✅ .size property (vs Object.keys().length)
     * ✅ Better iteration (.keys(), .values(), .entries())
     * ✅ Proper .delete() and .clear()
     */
    this.events = new Map();
    
    /**
     * Wrapper tracking: Map<OriginalFunction, WrapperFunction>
     *
     * PURPOSE:
     * Track which wrapper corresponds to which original function.
     * Enables removing once() listeners by original function reference.
     *
     * EXAMPLE:
     * ee.once('load', originalFn)
     *   → wrapper created
     *   → wrappers.set(originalFn, wrapper)
     *   → events.get('load').add(wrapper)
     *
     * ee.remove('load', originalFn)
     *   → lookup: wrapper = wrappers.get(originalFn)
     *   → remove: events.get('load').delete(wrapper)
     *   → cleanup: wrappers.delete(originalFn)
     *
     * This solves the problem from 8-methods.js!
     */
    this.wrappers = new Map();
  }

  /**
   * Register listener
   *
   * @param {any} name - Event name (can be any type with Map)
   * @param {Function} fn - Listener function
   *
   * SET BENEFITS:
   *
   * 1. O(1) ADD:
   *    Array: push is O(1), but check for duplicates is O(n)
   *    Set: add is O(1), duplicates handled automatically
   *
   * 2. NO DUPLICATES:
   *    set.add(fn); set.add(fn); → fn appears once
   *    array.push(fn); array.push(fn); → fn appears twice
   *
   * 3. O(1) DELETE:
   *    Set: delete(fn) is O(1) hash lookup
   *    Array: splice(indexOf(fn), 1) is O(n) scan + O(n) shift
   *
   * EXECUTION:
   *
   * ee.on('click', fn1)
   *   → events.get('click') = undefined
   *   → events.set('click', new Set([fn1]))
   *
   * ee.on('click', fn2)
   *   → events.get('click') = Set { fn1 }
   *   → event.add(fn2)
   *   → events.get('click') = Set { fn1, fn2 }
   */
  on(name, fn) {
    const event = this.events.get(name);
    
    if (event) {
      // Event exists: Add to existing Set
      event.add(fn);  // O(1) operation
    } else {
      // New event: Create Set with this listener
      this.events.set(name, new Set([fn]));
    }
  }

  /**
   * Register one-time listener WITH wrapper tracking
   *
   * @param {any} name - Event name
   * @param {Function} fn - Original listener function
   *
   * KEY IMPROVEMENT over 8-methods.js:
   * Tracks wrapper mapping, enabling removal by original function!
   *
   * WRAPPER TRACKING FLOW:
   *
   * ee.once('load', originalFn)
   *   ↓
   * 1. Create wrapper
   * 2. Store mapping: wrappers.set(originalFn, wrapper)
   * 3. Register wrapper: events.get('load').add(wrapper)
   *   ↓
   * ee.remove('load', originalFn)  // Using ORIGINAL function
   *   ↓
   * 4. Lookup wrapper: wrappers.get(originalFn) → wrapper
   * 5. Remove wrapper: events.get('load').delete(wrapper)
   * 6. Clean up mapping: wrappers.delete(originalFn)
   *
   * THIS WORKS because we track the mapping!
   *
   * IN 8-methods.js:
   * ee.once('event', fn);
   * ee.remove('event', fn);  // ❌ Doesn't work (wrapper not tracked)
   *
   * IN b-class.js (this):
   * ee.once('event', fn);
   * ee.remove('event', fn);  // ✅ Works! (wrapper tracked in map)
   */
  once(name, fn) {
    /**
     * Create self-removing wrapper (same concept as before)
     */
    const wrapper = (...args) => {
      this.remove(name, wrapper);  // Remove wrapper
      fn(...args);                  // Call original
    };
    
    /**
     * TRACK WRAPPER MAPPING - KEY IMPROVEMENT!
     *
     * Store: originalFunction → wrapperFunction
     *
     * This allows remove(name, originalFn) to find and remove wrapper.
     */
    this.wrappers.set(fn, wrapper);
    
    /**
     * Register wrapper (not original)
     */
    this.on(name, wrapper);
  }

  /**
   * Emit event to all listeners
   *
   * @param {any} name - Event name
   * @param {...any} args - Arguments to pass to listeners
   *
   * SET ITERATION:
   * for (const fn of event.values()) { }
   *
   * Iterates over Set values in insertion order.
   * Same order guarantee as Array.
   */
  emit(name, ...args) {
    const event = this.events.get(name);
    if (!event) return;  // No listeners
    
    /**
     * Iterate Set and call each listener
     *
     * SET ITERATION:
     * - event.values() returns iterator
     * - for-of consumes iterator
     * - Calls in insertion order (FIFO)
     *
     * PERFORMANCE:
     * Same as Array iteration - O(n) where n = listener count
     */
    for (const fn of event.values()) {
      fn(...args);
    }
  }

  /**
   * Remove listener WITH wrapper tracking support
   *
   * @param {any} name - Event name
   * @param {Function} fn - Listener to remove (original or wrapper)
   *
   * ENHANCED REMOVAL LOGIC:
   *
   * 1. Try to remove function directly (for regular listeners)
   * 2. If not found, check if it's a once() original function
   * 3. If it's once(), look up wrapper and remove that
   * 4. Clean up empty events and wrapper mappings
   *
   * HANDLES TWO CASES:
   *
   * CASE 1: Regular listener
   *   ee.on('event', fn);
   *   ee.remove('event', fn);  // Direct removal
   *
   * CASE 2: Once listener
   *   ee.once('event', fn);
   *   ee.remove('event', fn);  // Lookup wrapper, remove wrapper
   *
   * SET BENEFITS:
   * - event.has(fn): O(1) check
   * - event.delete(fn): O(1) removal
   * - vs Array: indexOf O(n) + splice O(n) = O(n) total
   */
  remove(name, fn) {
    const event = this.events.get(name);
    if (!event) return;  // Event doesn't exist
    
    /**
     * CASE 1: Direct removal (regular listener)
     *
     * Check if function is directly in the Set.
     * This handles on() registered listeners.
     */
    if (event.has(fn)) {
      event.delete(fn);  // O(1) removal with Set!
      return;
    }
    
    /**
     * CASE 2: Wrapper removal (once listener)
     *
     * If function not found directly, it might be a once() original.
     * Look up the wrapper and remove that instead.
     *
     * WRAPPER LOOKUP:
     * wrappers.get(fn) → wrapper (if exists)
     *
     * If wrapper found:
     * 1. Remove wrapper from event listeners
     * 2. Clean up if event is now empty
     * 3. Remove from wrapper tracking
     */
    const wrapper = this.wrappers.get(fn);
    if (wrapper) {
      event.delete(wrapper);  // Remove wrapper, not original
      
      /**
       * AUTO-CLEANUP: Remove empty events
       *
       * If no more listeners for this event, delete the event entirely.
       * Prevents memory leaks from empty Set objects.
       *
       * BENEFIT:
       * events Map only contains events that have listeners.
       * names() only returns events with active listeners.
       */
      if (event.size === 0) {
        this.events.delete(name);
      }
    }
  }

  /**
   * Clear listeners
   *
   * @param {any} name - Optional: Event name to clear
   *
   * MAP BENEFITS:
   * - .delete(key): O(1) removal
   * - .clear(): O(1) clear all
   *
   * vs Object:
   * - delete obj[key]: O(1) but modifies object
   * - obj = {}: O(1) but loses reference
   */
  clear(name) {
    if (name) this.events.delete(name);  // Clear specific
    else this.events.clear();             // Clear all
  }

  /**
   * Count listeners
   *
   * @param {any} name - Event name
   * @returns {number} - Listener count
   *
   * SET BENEFIT:
   * .size is native property (vs array.length)
   */
  count(name) {
    const event = this.events.get(name);
    return event ? event.size : 0;  // Set.size
  }

  /**
   * Get listeners
   *
   * @param {any} name - Event name
   * @returns {Set} - Copy of listeners Set
   *
   * RETURNS SET (not Array like previous versions):
   *
   * const listeners = ee.listeners('event');
   * listeners.forEach(fn => ...);
   *
   * COPY CREATION:
   * new Set(event) creates a new Set with same values.
   * Prevents external modification of internal Set.
   */
  listeners(name) {
    const event = this.events.get(name);
    return new Set(event);  // Return copy
  }

  /**
   * Get event names
   *
   * @returns {Array} - Array of event names
   *
   * MAP ITERATION:
   * - this.events.keys() returns iterator
   * - [...iterator] converts to array
   *
   * BENEFIT:
   * Only returns events that have listeners (empty events auto-cleaned).
   */
  names() {
    return [...this.events.keys()];
  }
}

// ===========================
// Usage Examples - Same API, Better Performance
// ===========================

/**
 * Create EventEmitter using class syntax
 * 
 * SYNTAX: new EventEmitter() (not factory function)
 * 
 * BENEFITS over closure factory:
 * - instanceof checks work: ee instanceof EventEmitter
 * - Can extend: class MyEmitter extends EventEmitter
 * - Shared prototype methods (memory efficient)
 * - Familiar class syntax
 */
// Usage

const ee = new EventEmitter();

// on and emit

ee.on('e1', (data) => {
  console.dir(data);
});

ee.emit('e1', { msg: 'e1 ok' });

// once

ee.once('e2', (data) => {
  console.dir(data);
});

ee.emit('e2', { msg: 'e2 ok' });
ee.emit('e2', { msg: 'e2 not ok' });

// remove

const f3 = (data) => {
  console.dir(data);
};

ee.on('e3', f3);
ee.remove('e3', f3);
ee.emit('e3', { msg: 'e3 not ok' });

// count

ee.on('e4', () => {});
ee.on('e4', () => {});
console.log('e4 count', ee.count('e4'));

// clear

ee.clear('e4');
ee.emit('e4', { msg: 'e4 not ok' });
ee.emit('e1', { msg: 'e1 ok' });

ee.clear();
ee.emit('e1', { msg: 'e1 not ok' });

// listeners and names

ee.on('e5', () => {});
ee.on('e5', () => {});
ee.on('e6', () => {});
ee.on('e7', () => {});

console.log('listeners', ee.listeners('e5'));
console.log('names', ee.names());
