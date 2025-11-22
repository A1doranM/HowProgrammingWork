'use strict';

/**
 * FILE PURPOSE: Wildcard EventEmitter Usage Demonstration
 *
 * This file demonstrates how to use the wildcard feature from 4-star-fix.js.
 * Shows both specific and wildcard listeners in action.
 *
 * KEY CONCEPTS DEMONSTRATED:
 * 1. Specific event listeners (normal behavior)
 * 2. Wildcard listeners (receive ALL events)
 * 3. Reserved event name protection (error when emitting '*')
 *
 * WILDCARD PATTERN BENEFITS:
 * ✅ Global event monitoring
 * ✅ Logging all events
 * ✅ Debugging event flow
 * ✅ Analytics/metrics collection
 */

/**
 * Import enhanced emitter factory
 *
 * Gets the factory function from 4-star-fix.js that creates
 * EventEmitter instances with wildcard support.
 */
const emitter = require('./4-star-fix.js');

/**
 * Create enhanced EventEmitter instance
 *
 * INITIALIZATION:
 * ee = Node.js EventEmitter with overridden emit() for wildcard support
 *
 * CAPABILITIES:
 * - All native EventEmitter methods (on, once, removeListener, etc.)
 * - Plus wildcard event listening
 * - Protected against '*' emission
 */
const ee = emitter();

/**
 * Register SPECIFIC event listener
 *
 * This listener only responds to 'event1'.
 * Won't be called for 'event2', 'event3', etc.
 *
 * LISTENER SIGNATURE:
 * @param {any} data - Data passed with event
 *
 * PURPOSE:
 * Handle specific 'event1' occurrences.
 *
 * AFTER REGISTRATION:
 * ee._events = {
 *   'event1': [this listener]
 * }
 */
ee.on('event1', (data) => {
  console.log('Certain event');  // Indicates specific listener fired
  console.dir(data);
});

/**
 * Register WILDCARD listener
 *
 * This listener responds to ALL events (except '*' itself).
 * Called for every emit(), receiving the event name + data.
 *
 * LISTENER SIGNATURE:
 * @param {string} name - The event name that was emitted
 * @param {any} data - Data passed with event
 *
 * PURPOSE:
 * Monitor all events for logging/debugging/analytics.
 *
 * WILDCARD BEHAVIOR:
 * When ANY event is emitted:
 * 1. Specific listeners are called with (data)
 * 2. Wildcard listeners are called with (eventName, data)
 *
 * Notice the SIGNATURE DIFFERENCE:
 * - Specific: listener(data)
 * - Wildcard: listener(eventName, data)
 *
 * This allows wildcard listeners to know which event occurred.
 *
 * AFTER REGISTRATION:
 * ee._events = {
 *   'event1': [specific listener],
 *   '*': [wildcard listener]
 * }
 */
ee.on('*', (name, data) => {
  console.log('Any event');  // Indicates wildcard listener fired
  console.dir([name, data]); // Shows event name + data
});

/**
 * Emit 'event1'
 *
 * EXECUTION FLOW:
 *
 * ee.emit('event1', { a: 5 })
 *   ↓
 * 1. Check: name !== '*' ✓
 *   ↓
 * 2. emit('event1', { a: 5 })
 *    → Calls specific 'event1' listener
 *    → Output: "Certain event"
 *    → Output: { a: 5 }
 *   ↓
 * 3. unshift('*'): args = ['*', 'event1', { a: 5 }]
 *   ↓
 * 4. emit('*', 'event1', { a: 5 })
 *    → Calls wildcard '*' listener
 *    → Output: "Any event"
 *    → Output: [ 'event1', { a: 5 } ]
 *
 * TOTAL OUTPUT:
 * Certain event
 * { a: 5 }
 * Any event
 * [ 'event1', { a: 5 } ]
 *
 * NOTICE:
 * Wildcard listener receives event NAME + data!
 */
ee.emit('event1', { a: 5 });

/**
 * Emit 'event2' (no specific listener)
 *
 * EXECUTION FLOW:
 *
 * ee.emit('event2', { a: 500 })
 *   ↓
 * 1. Check: name !== '*' ✓
 *   ↓
 * 2. emit('event2', { a: 500 })
 *    → No specific 'event2' listeners
 *    → Nothing happens
 *   ↓
 * 3. unshift('*'): args = ['*', 'event2', { a: 500 }]
 *   ↓
 * 4. emit('*', 'event2', { a: 500 })
 *    → Calls wildcard '*' listener
 *    → Output: "Any event"
 *    → Output: [ 'event2', { a: 500 } ]
 *
 * TOTAL OUTPUT:
 * Any event
 * [ 'event2', { a: 500 } ]
 *
 * KEY INSIGHT:
 * Even without specific listener, wildcard listener is notified!
 * This is perfect for logging/monitoring all events.
 */
ee.emit('event2', { a: 500 });

/**
 * Attempt to emit '*' event - WILL THROW ERROR!
 *
 * EXECUTION FLOW:
 *
 * ee.emit('*', { a: 700 })
 *   ↓
 * 1. Extract name: '*'
 *   ↓
 * 2. Guard clause: name === '*' ✓
 *   ↓
 * 3. throw Error('Event name "*" is reserved')
 *   ↓
 * PROGRAM CRASHES!
 *
 * ERROR MESSAGE:
 * Error: Event name "*" is reserved
 *
 * WHY THIS IS GOOD:
 * - Prevents infinite loop bug
 * - Makes the rule explicit
 * - Fails fast (better than silent corruption)
 * - Developers learn not to emit '*'
 *
 * DESIGN PRINCIPLE: Fail Fast
 * Better to crash with clear error than have subtle bug.
 */
ee.emit('*', { a: 700 });  // ⚠️ THROWS: Event name "*" is reserved

/**
 * COMPLETE EXECUTION (if last line commented out):
 *
 * Certain event
 * { a: 5 }
 * Any event
 * [ 'event1', { a: 5 } ]
 * Any event
 * [ 'event2', { a: 500 } ]
 *
 * OBSERVATION:
 * - 'event1' triggers BOTH specific and wildcard listeners
 * - 'event2' triggers ONLY wildcard listener (no specific registered)
 * - Wildcard always knows which event was emitted (receives name)
 */

/**
 * WILDCARD PATTERN USE CASES:
 *
 * 1. DEVELOPMENT LOGGER:
 *    ee.on('*', (name, ...args) => {
 *      if (process.env.DEBUG) {
 *        console.log(`[EVENT] ${name}`, ...args);
 *      }
 *    });
 *
 * 2. EVENT ANALYTICS:
 *    ee.on('*', (name, data) => {
 *      analytics.track({
 *        event: name,
 *        data: data,
 *        timestamp: Date.now()
 *      });
 *    });
 *
 * 3. EVENT REPLAY SYSTEM:
 *    const history = [];
 *    ee.on('*', (name, ...args) => {
 *      history.push({ name, args, time: Date.now() });
 *    });
 *
 *    // Replay later
 *    history.forEach(({ name, args }) => {
 *      ee.emit(name, ...args);
 *    });
 *
 * 4. MONITORING/METRICS:
 *    ee.on('*', (name) => {
 *      metrics.increment(`events.${name}.count`);
 *    });
 *
 * 5. CONDITIONAL LOGGING:
 *    ee.on('*', (name, data) => {
 *      if (name.startsWith('error')) {
 *        errorLogger.log(name, data);
 *      }
 *    });
 */

/**
 * KEY TAKEAWAYS:
 *
 * 1. WILDCARD LISTENER: on('*', (name, data) => {})
 * 2. RECEIVES ALL EVENTS: Called for every emit (except '*')
 * 3. GETS EVENT NAME: First parameter is event name
 * 4. RESERVED NAME: Cannot emit('*') - will throw error
 * 5. USEFUL FOR: Logging, monitoring, debugging, analytics
 *
 * PATTERN BENEFITS:
 * ✅ Global visibility into all events
 * ✅ No need to register for each event individually
 * ✅ Easy to add/remove global monitoring
 * ✅ Doesn't affect specific listeners
 *
 * COMPARISON:
 * - Without wildcard: Must register for each event separately
 * - With wildcard: One listener for all events
 *
 * This feature makes EventEmitter much more powerful for
 * observability and debugging!
 */
