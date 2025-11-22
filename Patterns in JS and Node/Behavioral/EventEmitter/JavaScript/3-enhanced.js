'use strict';

/**
 * FILE PURPOSE: Enhanced EventEmitter with Wildcard Support
 *
 * This file demonstrates how to extend Node.js's built-in EventEmitter
 * to add wildcard ('*') event support.
 *
 * NEW FEATURE:
 * ✅ Wildcard listener: Listen to ALL events with single listener
 *
 * USE CASES:
 * - Global logging (log all events)
 * - Debugging (see all events fired)
 * - Analytics (track all user actions)
 * - Monitoring (observe system activity)
 *
 * IMPLEMENTATION TECHNIQUE:
 * Wraps Node.js EventEmitter and intercepts emit() to add wildcard emission.
 *
 * PATTERN: Decorator Pattern
 * - Wraps existing EventEmitter
 * - Enhances emit() behavior
 * - Preserves original functionality
 *
 * ⚠️ WARNING:
 * This implementation has a bug (infinite loop with '*' event)
 * See 4-star-fix.js for the corrected version.
 */

/**
 * Import Node.js native EventEmitter
 *
 * Node.js provides a built-in EventEmitter class.
 * We'll enhance it rather than reimplement from scratch.
 *
 * WHY USE NATIVE EventEmitter?
 * ✅ Battle-tested and optimized
 * ✅ Complete feature set (once, removeListener, etc.)
 * ✅ Used throughout Node.js ecosystem
 * ✅ No need to reimplement basic functionality
 */
const events = require('node:events');

/**
 * Factory: Create Enhanced EventEmitter
 *
 * PATTERN: Factory + Decorator
 * - Creates new EventEmitter instance
 * - Decorates emit() method with wildcard support
 * - Returns enhanced emitter
 *
 * ENHANCEMENT TECHNIQUE: Method Wrapping
 * 1. Store original emit method
 * 2. Replace emit with wrapper function
 * 3. Wrapper calls original + emits wildcard
 *
 * @returns {EventEmitter} - Enhanced emitter with wildcard support
 *
 * WHY FACTORY FUNCTION?
 * - Encapsulates enhancement logic
 * - Each call creates independent enhanced emitter
 * - Clean API: const ee = emitter();
 */
const emitter = () => {
  /**
   * Create base EventEmitter instance
   *
   * This is Node.js's native EventEmitter.
   * Has all standard methods: on, once, emit, removeListener, etc.
   */
  const ee = new events.EventEmitter();
  
  /**
   * Save original emit method
   *
   * CRITICAL: Store reference before overriding!
   *
   * Without this:
   *   ee.emit = newEmit  // Original emit lost forever!
   *
   * With this:
   *   const emit = ee.emit  // Original saved
   *   ee.emit = newEmit     // Override
   *   emit.apply(...)       // Can still call original
   *
   * This is the DECORATOR PATTERN technique:
   * Save original, wrap it, enhance it.
   */
  const emit = ee.emit;
  
  /**
   * Override emit to add wildcard functionality
   *
   * ENHANCED BEHAVIOR:
   * 1. Call original emit (specific event)
   * 2. Call original emit again with '*' (wildcard event)
   *
   * @param {...any} args - Event name and data
   *
   * EXECUTION FLOW:
   *
   * ee.emit('click', { x: 10 })
   *   ↓
   * 1. emit.apply(ee, ['click', { x: 10 }])
   *    → Calls original emit
   *    → Notifies 'click' listeners
   *    → listener({ x: 10 })
   *   ↓
   * 2. args.unshift('*')
   *    → args becomes ['*', 'click', { x: 10 }]
   *   ↓
   * 3. emit.apply(ee, ['*', 'click', { x: 10 }])
   *    → Calls original emit again
   *    → Notifies '*' listeners
   *    → wildcardListener('click', { x: 10 })
   *
   * RESULT:
   * - Specific event listeners get: (data)
   * - Wildcard listeners get: (eventName, data)
   *
   * WHY apply()?
   * - Preserves 'this' context (ee)
   * - Passes arguments array as individual args
   * - Required for proper method binding
   *
   * ⚠️ BUG ALERT:
   * If someone emits '*' event directly:
   *   ee.emit('*', data)
   *
   * Flow:
   *   1. emit('*', data) → notifies '*' listeners
   *   2. unshift('*') → args = ['*', '*', data]
   *   3. emit('*', '*', data) → notifies '*' listeners again
   *   4. unshift('*') → args = ['*', '*', '*', data]
   *   5. INFINITE RECURSION! Stack overflow!
   *
   * FIX: See 4-star-fix.js which prevents this
   */
  ee.emit = (...args) => {
    // Call original emit with specific event
    emit.apply(ee, args);
    
    // Add '*' at beginning of args
    args.unshift('*');
    
    // Call original emit with wildcard event
    emit.apply(ee, args);
    
    // BUG: No protection against emitting '*' directly!
  };
  
  /**
   * Return enhanced emitter
   *
   * RESULT:
   * EventEmitter with:
   * - All native Node.js EventEmitter features
   * - Plus wildcard event support
   */
  return ee;
};

/**
 * Export factory function
 *
 * Usage: const emitter = require('./3-enhanced.js');
 *        const ee = emitter();
 */
module.exports = emitter;

/**
 * USAGE EXAMPLE (see 5-usage.js):
 *
 * const ee = emitter();
 *
 * // Specific event listener
 * ee.on('event1', (data) => {
 *   console.log('Specific:', data);
 * });
 *
 * // Wildcard listener (receives ALL events)
 * ee.on('*', (name, data) => {
 *   console.log('Wildcard:', name, data);
 * });
 *
 * ee.emit('event1', { a: 5 });
 * // Output:
 * // Specific: { a: 5 }
 * // Wildcard: event1 { a: 5 }
 *
 * ee.emit('event2', { b: 10 });
 * // Output:
 * // Wildcard: event2 { b: 10 }
 * // (No specific listener for event2)
 */

/**
 * WILDCARD USE CASES:
 *
 * 1. GLOBAL LOGGER:
 *    ee.on('*', (name, ...args) => {
 *      logger.log(`Event ${name}:`, ...args);
 *    });
 *
 * 2. ANALYTICS:
 *    ee.on('*', (name, data) => {
 *      analytics.track(name, data);
 *    });
 *
 * 3. DEBUGGING:
 *    if (DEBUG) {
 *      ee.on('*', (name, ...args) => {
 *        console.log('[DEBUG]', name, ...args);
 *      });
 *    }
 *
 * 4. EVENT REPLAY:
 *    const history = [];
 *    ee.on('*', (name, ...args) => {
 *      history.push({ name, args, timestamp: Date.now() });
 *    });
 *
 * 5. MONITORING:
 *    ee.on('*', (name) => {
 *      metrics.increment(`events.${name}`);
 *    });
 */

/**
 * DECORATOR PATTERN APPLICATION:
 *
 * This is a textbook example of Decorator pattern:
 *
 * BEFORE:
 *   emit(event, data) → notifies listeners
 *
 * AFTER:
 *   emit(event, data) → {
 *     notifies specific listeners
 *     notifies wildcard listeners  // ADDED
 *   }
 *
 * DECORATOR CHARACTERISTICS:
 * ✅ Wraps existing object (EventEmitter)
 * ✅ Adds functionality (wildcard)
 * ✅ Preserves original interface (still has on, emit, etc.)
 * ✅ Transparent to users (API unchanged)
 * ✅ Composable (could add more decorators)
 */

/**
 * KEY TAKEAWAYS:
 *
 * 1. EXTENDING BUILT-IN: How to enhance Node.js EventEmitter
 * 2. WILDCARD PATTERN: Listen to all events with '*'
 * 3. DECORATOR: Method wrapping to add functionality
 * 4. FACTORY: Function that creates and returns enhanced object
 * 5. BUG PRESENT: Infinite loop if '*' emitted directly (fixed in next file)
 *
 * COMPARISON:
 * - 1-simple.js: Basic implementation (on, emit)
 * - 3-enhanced.js: Add wildcard (but with bug)
 * - 4-star-fix.js: Fix the bug
 *
 * This shows iterative improvement:
 * Basic → Enhanced → Debugged
 */
