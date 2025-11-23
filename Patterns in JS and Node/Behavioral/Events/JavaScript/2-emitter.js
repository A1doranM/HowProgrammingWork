'use strict';

/**
 * FILE PURPOSE: EventEmitter (Node.js Standard)
 *
 * This file demonstrates Node.js EventEmitter for comparison with
 * EventTarget from 1-event.js.
 *
 * WHAT IS EventEmitter?
 * - Node.js core event system
 * - Used throughout Node.js (streams, HTTP, process, etc.)
 * - Simpler API than EventTarget
 * - Direct data passing (no Event objects)
 *
 * KEY ADVANTAGES over EventTarget:
 * ✅ Simpler API (on/emit vs addEventListener/dispatchEvent)
 * ✅ Direct arguments (no Event object wrapper)
 * ✅ Multiple arguments support
 * ✅ Less boilerplate
 * ✅ Node.js ecosystem standard
 *
 * COMPARISON TO 1-event.js:
 * - 1-event.js: EventTarget (W3C standard, verbose)
 * - 2-emitter.js (this): EventEmitter (Node.js, concise)
 *
 * Same functionality, different API!
 */

/**
 * Import EventEmitter from Node.js core
 *
 * NATIVE MODULE:
 * 'node:events' is a built-in Node.js module.
 * No npm install needed - part of Node.js core.
 *
 * DESTRUCTURING:
 * const { EventEmitter } = require('node:events')
 * Gets EventEmitter class from exports.
 *
 * ALTERNATIVE:
 * const events = require('node:events');
 * const emitter = new events.EventEmitter();
 *
 * NODE.JS CORE USAGE:
 * EventEmitter is the base class for:
 * - http.Server
 * - net.Server
 * - stream.Readable
 * - stream.Writable
 * - child_process.ChildProcess
 * - and many more!
 */
const { EventEmitter } = require('node:events');

/**
 * Create EventEmitter instance
 *
 * INSTANTIATION:
 * const emitter = new EventEmitter()
 *
 * Creates new emitter with empty event registry.
 *
 * INTERNAL STATE (conceptually):
 * emitter._events = {}  // Private registry
 *
 * ALTERNATIVELY:
 * Can extend EventEmitter for custom classes:
 *   class MyClass extends EventEmitter { }
 *   const instance = new MyClass();
 *   instance.on('event', handler);
 */
const emitter = new EventEmitter();

/**
 * Register event listener (Node.js API)
 *
 * METHOD: on(eventName, listener)
 * ALIAS: addListener() (same as on())
 *
 * @param {string} eventName - Event name to listen for
 * @param {Function} listener - Callback function
 *
 * LISTENER SIGNATURE:
 * (data1, data2, ...) => void
 *
 * Receives DIRECT ARGUMENTS (not Event object).
 *
 * COMPARISON TO EventTarget:
 *
 * EventTarget (1-event.js):
 *   target.addEventListener('name', (event) => {
 *     const data = event.detail;  // Access via event.detail
 *   });
 *
 * EventEmitter (this):
 *   emitter.on('name', (data) => {
 *     // Direct access to data
 *   });
 *
 * SIMPLER: No event object wrapper needed!
 *
 * MULTIPLE LISTENERS:
 * Can add same listener multiple times (unlike EventTarget):
 *   emitter.on('event', fn);
 *   emitter.on('event', fn);  // Added AGAIN!
 *   emitter.emit('event');     // fn called TWICE
 *
 * This is a KEY DIFFERENCE from EventTarget which deduplicates.
 */
emitter.on('name', (data) => {
  console.dir({ data });
});

/**
 * Emit event (Node.js API)
 *
 * METHOD: emit(eventName, ...args)
 *
 * Notifies all listeners with provided arguments.
 *
 * @param {string} eventName - Event name to emit
 * @param {...any} args - Arguments to pass to listeners
 * @returns {boolean} - true if event had listeners, false otherwise
 *
 * EXECUTION FLOW:
 *
 * emitter.emit('name', { a: 5 })
 *   ↓
 * 1. Get listeners for 'name': [listener]
 * 2. Call listener({ a: 5 })
 *    ↓
 *    console.dir({ data: { a: 5 } })
 *    ↓
 *    Output: { data: { a: 5 } }
 * 3. Return true (had listeners)
 *
 * MULTIPLE ARGUMENTS:
 * emitter.emit('event', arg1, arg2, arg3)
 *   → listener(arg1, arg2, arg3)
 *
 * vs EventTarget:
 * const event = new CustomEvent('event', {
 *   detail: { arg1, arg2, arg3 }  // Must wrap
 * });
 * target.dispatchEvent(event);
 *   → listener(event)
 *   → access: event.detail.arg1, event.detail.arg2
 *
 * EventEmitter is MORE CONVENIENT for multiple arguments!
 *
 * SYNCHRONOUS:
 * Listeners execute synchronously (blocks until all complete).
 * For async, see ../EventEmitter/c-async.js.
 */
emitter.emit('name', { a: 5 });

/**
 * EXPECTED OUTPUT:
 *
 * { data: { a: 5 } }
 *
 * COMPARISON TO 1-event.js OUTPUT:
 *
 * 1-event.js (EventTarget):
 *   { event: CustomEvent { ... } }
 *   { data: { id: 100, city: 'Roma', country: 'Italy' } }
 *
 * 2-emitter.js (EventEmitter):
 *   { data: { a: 5 } }
 *
 * EventEmitter output is simpler (no event object).
 */

/**
 * EVENTTARGET vs EVENTEMITTER SUMMARY:
 *
 * ┌────────────────────┬─────────────────────┬──────────────────┐
 * │     Feature        │    EventTarget      │   EventEmitter   │
 * ├────────────────────┼─────────────────────┼──────────────────┤
 * │ Add Listener       │ addEventListener()  │ on()             │
 * │ Emit Event         │ dispatchEvent()     │ emit()           │
 * │ Event Object       │ Required            │ Not required     │
 * │ Data Access        │ event.detail        │ Direct args      │
 * │ Multiple Args      │ Via detail object   │ Native           │
 * │ Duplicates         │ Auto-deduplicated   │ Allowed          │
 * │ Platform           │ Browser + Node.js   │ Node.js only     │
 * │ Standard           │ W3C                 │ Node.js          │
 * │ Verbosity          │ More                │ Less             │
 * └────────────────────┴─────────────────────┴──────────────────┘
 *
 * CHOOSE BASED ON:
 * - Platform: Browser → EventTarget, Node.js → EventEmitter
 * - Compatibility: Cross-platform → EventTarget
 * - Simplicity: EventEmitter (less boilerplate)
 * - Standard: W3C standard → EventTarget
 *
 * NEXT FILES:
 * - 3-naive.js: Custom EventEmitter implementation
 * - 4-multiple.js: Compare duplicate handling
 * - 5-remove.js: Compare removal behavior
 */
