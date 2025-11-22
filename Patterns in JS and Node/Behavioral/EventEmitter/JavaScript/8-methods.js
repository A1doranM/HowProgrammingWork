'use strict';

/**
 * FILE PURPOSE: Full-Featured EventEmitter Implementation
 *
 * This file demonstrates a COMPLETE EventEmitter with all common features:
 * - on() - Register listener
 * - emit() - Notify listeners
 * - once() - One-time listener
 * - remove() - Unregister listener
 * - clear() - Remove all listeners
 * - count() - Count listeners for event
 * - listeners() - Get listener array
 * - names() - Get all event names
 *
 * PLUS BONUS FEATURE:
 * - Auto-unsubscribe timeout (on with timeout parameter)
 *
 * This is close to Node.js EventEmitter API but with simpler implementation.
 *
 * COMPARISON:
 * - 1-simple.js: Just on() and emit() (minimal)
 * - 6-closure.js: Closure-based on() and emit()
 * - 8-methods.js (this): Complete API (production-ready)
 *
 * USE THIS WHEN:
 * You need full EventEmitter functionality without Node.js dependency
 * (e.g., browser environment or lightweight alternative).
 */

/**
 * Factory: Create Full-Featured EventEmitter
 *
 * Returns emitter instance with complete API.
 * Uses closure for privacy (same as 6-closure.js).
 *
 * @returns {Object} - EventEmitter with full API
 */
const emitter = () => {
  /**
   * Private events registry (via closure)
   *
   * NOTE: Using 'let' instead of 'const'
   * Allows clear() to reassign: events = {}
   *
   * STRUCTURE:
   * {
   *   'event1': [listener1, listener2],
   *   'event2': [listener3]
   * }
   */
  let events = {};  // let for reassignment in clear()
  
  /**
   * EventEmitter API object
   *
   * All methods close over 'events' variable.
   * Circular reference: Methods reference 'ee', 'ee' is returned object.
   * This allows methods to call each other (e.g., once() calls on()).
   */
  const ee = {
    /**
     * Register listener with optional auto-unsubscribe timeout
     *
     * @param {string} name - Event name
     * @param {Function} f - Listener function
     * @param {number} timeout - Optional: Auto-unsubscribe after ms (default: 0 = no timeout)
     *
     * NEW FEATURE: timeout parameter
     * If provided, listener automatically removed after timeout ms.
     *
     * USE CASE:
     * Temporary listeners that should auto-cleanup:
     *   ee.on('data', handler, 5000);  // Remove after 5 seconds
     *
     * EXECUTION FLOW:
     *
     * ee.on('event', fn, 3000)
     *   ↓
     * 1. Get/create listener array
     * 2. Push fn to array
     * 3. setTimeout(() => ee.remove('event', fn), 3000)
     *    ↓ (after 3000ms)
     * 4. Remove fn from listeners
     *
     * TIMEOUT MECHANISM:
     * setTimeout creates a timer that will call ee.remove() after delay.
     * Closure captures name and f for later removal.
     *
     * MEMORY NOTE:
     * Timer holds reference to listener until it fires or is cleared.
     * Listener can't be garbage collected during this time.
     */
    on: (name, f, timeout = 0) => {
      // Get existing listener array or create empty one
      const event = events[name] || [];
      events[name] = event;  // Ensure event is registered
      
      // Add listener to array
      event.push(f);
      
      // Auto-unsubscribe feature
      if (timeout) {
        setTimeout(() => {
          ee.remove(name, f);  // Remove after timeout
        }, timeout);
      }
    },
    
    /**
     * Emit event to all listeners
     *
     * @param {string} name - Event name
     * @param {...any} data - Arguments to pass to listeners
     *
     * Same as previous implementations.
     * Calls all registered listeners with provided data.
     */
    emit: (name, ...data) => {
      const event = events[name];
      if (event) event.forEach((f) => f(...data));
    },
    
    /**
     * Register one-time listener
     *
     * Listener is automatically removed after first execution.
     *
     * @param {string} name - Event name
     * @param {Function} f - Listener function (called only once)
     *
     * IMPLEMENTATION TECHNIQUE: Wrapper Function
     *
     * 1. Create wrapper function 'g'
     * 2. Wrapper removes itself then calls original
     * 3. Register wrapper, not original
     *
     * EXECUTION FLOW:
     *
     * ee.once('load', originalFn)
     *   ↓
     * 1. Create wrapper: g = (...a) => { remove(g); originalFn(...a); }
     * 2. Register wrapper: ee.on('load', g)
     *   ↓
     * ee.emit('load', data)
     *   ↓
     * 3. Wrapper called: g(data)
     * 4. Wrapper removes itself: ee.remove('load', g)
     * 5. Wrapper calls original: originalFn(data)
     *   ↓
     * ee.emit('load', data2)  // Second emit
     *   ↓
     * 6. No listeners (wrapper removed itself)
     *   ↓
     * Nothing happens
     *
     * WHY WRAPPER?
     * Can't use original function because we need to remove it.
     * Wrapper holds reference to itself for self-removal.
     *
     * CLOSURE CHAIN:
     * - g closes over f (original function)
     * - g closes over name (event name)
     * - g closes over ee (emitter instance)
     *
     * PROBLEM WITH THIS IMPLEMENTATION:
     * Can't remove once listener by original function:
     *   ee.once('event', fn);
     *   ee.remove('event', fn);  // Won't work! 'g' is registered, not 'fn'
     *
     * Solution: Track wrapper mapping (see b-class.js)
     */
    once: (name, f) => {
      // Create self-removing wrapper
      const g = (...a) => {
        ee.remove(name, g);  // Remove wrapper first
        f(...a);              // Then call original
      };
      
      // Register wrapper instead of original
      ee.on(name, g);
    },
    
    /**
     * Remove listener from event
     *
     * @param {string} name - Event name
     * @param {Function} f - Listener function to remove
     *
     * REMOVAL PROCESS:
     * 1. Get listener array for event
     * 2. Find listener in array (indexOf)
     * 3. Remove using splice
     *
     * LIMITATION:
     * Won't remove once() listeners by original function.
     * Can only remove the wrapper, but we don't have reference to it.
     *
     * EXAMPLE:
     *
     * const fn = () => {};
     * ee.on('event', fn);
     * ee.remove('event', fn);  // ✅ Works
     *
     * ee.once('event', fn);
     * ee.remove('event', fn);  // ❌ Doesn't work (wrapper registered)
     *
     * FIX: See b-class.js which tracks wrapper mappings
     *
     * PERFORMANCE:
     * - indexOf: O(n) where n = number of listeners
     * - splice: O(n) (shifts remaining elements)
     * - Total: O(n)
     *
     * IMPROVEMENT:
     * Use Set instead of Array for O(1) removal (see b-class.js)
     */
    remove: (name, f) => {
      const event = events[name];
      if (!event) return;  // No listeners for this event
      
      // Find listener index
      const i = event.indexOf(f);
      
      // Remove if found
      if (i !== -1) event.splice(i, 1);
    },
    
    /**
     * Clear listeners
     *
     * @param {string} name - Optional: Event name to clear
     *                        If omitted, clears ALL events
     *
     * TWO MODES:
     *
     * 1. Clear specific event:
     *    ee.clear('event1')
     *    → Removes all listeners for 'event1'
     *    → Other events unchanged
     *
     * 2. Clear all events:
     *    ee.clear()
     *    → Removes ALL listeners for ALL events
     *    → Resets emitter to initial state
     *
     * IMPLEMENTATION:
     *
     * With name:
     *   delete events[name]
     *   → Remove property from object
     *   → Listeners garbage collected
     *
     * Without name:
     *   events = {}
     *   → Replace object with new empty one
     *   → All listeners garbage collected
     *
     * NOTE: This is why events is 'let', not 'const'
     * Can't reassign const, but can delete properties.
     *
     * ALTERNATIVE:
     * events = {}  // Works with let
     * for (const key in events) delete events[key]  // Works with const
     */
    clear: (name) => {
      if (name) delete events[name];  // Clear specific event
      else events = {};                // Clear all events
    },
    
    /**
     * Count listeners for event
     *
     * @param {string} name - Event name
     * @returns {number} - Number of listeners (0 if no listeners)
     *
     * INTROSPECTION METHOD:
     * Allows checking how many listeners are registered.
     *
     * USE CASES:
     * - Debugging (how many listeners registered?)
     * - Warnings (too many listeners?)
     * - Testing (verify listener registered)
     *
     * SAFE:
     * Returns 0 if event doesn't exist (no error thrown).
     */
    count: (name) => {
      const event = events[name];
      return event ? event.length : 0;
    },
    
    /**
     * Get copy of listeners array
     *
     * @param {string} name - Event name
     * @returns {Array} - Copy of listeners array
     *
     * RETURNS COPY:
     * event.slice() creates a copy, not reference.
     *
     * WHY COPY?
     * Prevent external modification of internal array:
     *
     * const listeners = ee.listeners('event');
     * listeners.push(maliciousFunction);  // Doesn't affect internal array
     *
     * ENCAPSULATION:
     * Even though we return listeners, they can't modify internal state.
     *
     * USE CASES:
     * - Debugging (see what's registered)
     * - Testing (verify correct listeners)
     * - Introspection (analyze event system)
     */
    listeners: (name) => {
      const event = events[name];
      return event.slice();  // Return copy, not reference
    },
    
    /**
     * Get all registered event names
     *
     * @returns {Array<string>} - Array of event names
     *
     * INTROSPECTION:
     * See what events have listeners registered.
     *
     * IMPLEMENTATION:
     * Object.keys(events) returns array of property names.
     *
     * EXAMPLE:
     * events = { 'click': [fn1], 'load': [fn2, fn3] }
     * ee.names() → ['click', 'load']
     *
     * USE CASES:
     * - Debugging (what events exist?)
     * - Cleanup (remove all events)
     * - Testing (verify events registered)
     * - Documentation (list available events)
     */
    names: () => Object.keys(events),
  };
  
  return ee;
};

// ===========================
// Usage Examples for All Methods
// ===========================

/**
 * Create full-featured emitter instance
 * 
 * Instance has all 8 methods available.
 */
// Usage

const ee = emitter();

// ===========================
// Example 1: on() and emit()
// ===========================

/**
 * Basic pub/sub demonstration
 */
ee.on('e1', (data) => {
  console.dir(data);
});

ee.emit('e1', { msg: 'e1 ok' });
// Output: { msg: 'e1 ok' }

// ===========================
// Example 2: once()
// ===========================

/**
 * One-time listener demonstration
 *
 * Listener executes once, then removes itself.
 */
ee.once('e2', (data) => {
  console.dir(data);
});

ee.emit('e2', { msg: 'e2 ok' });
// Output: { msg: 'e2 ok' }
// Listener called and removed

ee.emit('e2', { msg: 'e2 not ok' });
// No output - listener was removed after first emit

// ===========================
// Example 3: remove()
// ===========================

/**
 * Manual listener removal demonstration
 *
 * Register listener with named function reference,
 * then remove it before emitting.
 */
const f3 = (data) => {
  console.dir(data);
};

ee.on('e3', f3);       // Register
ee.remove('e3', f3);   // Remove
ee.emit('e3', { msg: 'e3 not ok' });
// No output - listener was removed

// ===========================
// Example 4: count()
// ===========================

/**
 * Count listeners demonstration
 *
 * Register 2 listeners and verify count.
 */
ee.on('e4', () => {});
ee.on('e4', () => {});
console.log('e4 count', ee.count('e4'));
// Output: e4 count 2

// ===========================
// Example 5: clear()
// ===========================

/**
 * Clear specific event
 */
ee.clear('e4');
ee.emit('e4', { msg: 'e4 not ok' });
// No output - e4 cleared

ee.emit('e1', { msg: 'e1 ok' });
// Output: { msg: 'e1 ok' }
// e1 still exists

/**
 * Clear all events
 */
ee.clear();
ee.emit('e1', { msg: 'e1 not ok' });
// No output - all events cleared

// ===========================
// Example 6: listeners() and names()
// ===========================

/**
 * Introspection demonstration
 *
 * Register multiple listeners on multiple events,
 * then inspect the emitter state.
 */
ee.on('e5', () => {});
ee.on('e5', () => {});
ee.on('e6', () => {});
ee.on('e7', () => {});

console.log('listeners', ee.listeners('e5'));
// Output: listeners [ [Function], [Function] ]
// e5 has 2 listeners

console.log('names', ee.names());
// Output: names [ 'e5', 'e6', 'e7' ]
// 3 events registered

/**
 * COMPLETE DEMONSTRATION SUMMARY:
 *
 * This usage section demonstrates all 8 methods:
 *
 * 1. ✅ on() - Register listeners
 * 2. ✅ emit() - Notify listeners
 * 3. ✅ once() - One-time listeners
 * 4. ✅ remove() - Unregister listeners
 * 5. ✅ clear() - Remove all (specific or all events)
 * 6. ✅ count() - Count listeners
 * 7. ✅ listeners() - Get listener array
 * 8. ✅ names() - Get event names
 *
 * PATTERN BENEFITS SHOWN:
 * - Event registration and emission
 * - Temporary listeners (once)
 * - Listener management (remove, clear)
 * - System introspection (count, listeners, names)
 *
 * REAL-WORLD EQUIVALENTS:
 * This implementation provides similar API to:
 * - Node.js EventEmitter
 * - DOM addEventListener/removeEventListener
 * - jQuery on/off/trigger
 * - RxJS Subject
 */
