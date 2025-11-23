'use strict';

/**
 * FILE PURPOSE: EventTarget (W3C Standard) in Node.js
 *
 * This file demonstrates using EventTarget - the browser's standard event API,
 * now available in Node.js (v15+).
 *
 * WHAT IS EventTarget?
 * - W3C DOM Events standard
 * - Used in browsers for DOM elements: element.addEventListener()
 * - Now available in Node.js for AbortController, etc.
 * - Enables code sharing between browser and Node.js
 *
 * KEY DIFFERENCES from EventEmitter:
 * - Must create Event or CustomEvent objects
 * - Data passed via event.detail property
 * - addEventListener/removeEventListener (longer names)
 * - dispatchEvent instead of emit
 * - Auto-deduplicates listeners
 *
 * WHY USE EventTarget in Node.js?
 * ✅ Browser-compatible code
 * ✅ W3C standard (stable, documented)
 * ✅ Cross-platform event handling
 * ✅ Future-proof (standard won't change)
 *
 * NODE.JS VERSION REQUIREMENTS:
 * - v19.0.0+: Native EventTarget and CustomEvent
 * - v18.7.0+: Available globally
 * - v16.17.0+: Behind --experimental-global-customevent flag
 */

// Node.js v19.0.0
// or v18.7.0, v16.17.0 behind --experimental-global-customevent

/**
 * Create EventTarget instance
 *
 * EventTarget is a constructor available globally in Node.js 15+.
 *
 * WHAT IS EventTarget?
 * An object that can receive and dispatch events.
 *
 * IN BROWSERS:
 * - HTML elements are EventTargets: button.addEventListener()
 * - window is EventTarget: window.addEventListener()
 * - document is EventTarget: document.addEventListener()
 *
 * IN NODE.JS:
 * - AbortController.signal is EventTarget
 * - Can create custom EventTargets for any purpose
 *
 * INTERNAL STATE:
 * Maintains registry of event listeners (like EventEmitter).
 * Implementation is similar but API is different.
 */
const target = new EventTarget();

/**
 * Register event listener (W3C Standard API)
 *
 * METHOD: addEventListener(type, listener, options)
 *
 * @param {string} type - Event type (like EventEmitter's event name)
 * @param {Function} listener - Callback function
 *
 * LISTENER SIGNATURE:
 * (event) => void
 *
 * Receives Event object, not raw data!
 *
 * EVENT OBJECT STRUCTURE:
 * {
 *   type: string,        // Event type ('name')
 *   target: EventTarget, // Where event was dispatched
 *   detail: any,         // Custom data (for CustomEvent)
 *   // ... other properties
 * }
 *
 * KEY DIFFERENCE from EventEmitter:
 * - EventEmitter: listener(data1, data2, data3)  // Direct args
 * - EventTarget:  listener(event)                // Event object
 *
 * DATA ACCESS:
 * Must access data via event.detail property.
 *
 * OPTIONS (third parameter, not shown here):
 * {
 *   once: boolean,    // Auto-remove after first call
 *   capture: boolean, // Use capture phase (DOM only)
 *   passive: boolean  // Optimize scroll performance (DOM only)
 * }
 *
 * DEDUPLICATION:
 * EventTarget automatically deduplicates:
 *   target.addEventListener('click', fn);
 *   target.addEventListener('click', fn);  // Ignored (same fn)
 *   // fn will be called only ONCE per dispatch
 */
target.addEventListener('name', (event) => {
  console.log({ event });          // Full event object
  console.log({ data: event.detail }); // Custom data
});

/**
 * Create custom event with data
 *
 * CLASS: CustomEvent extends Event
 *
 * WHY CustomEvent?
 * Standard Event doesn't have 'detail' property.
 * CustomEvent adds 'detail' for custom data.
 *
 * CONSTRUCTOR:
 * new CustomEvent(type, options)
 *
 * @param {string} type - Event type ('name')
 * @param {Object} options - Event configuration
 *   - detail: any     - Custom data to pass
 *   - bubbles: boolean - Should bubble (DOM only)
 *   - cancelable: boolean - Can be cancelled
 *
 * EVENT OBJECT CREATED:
 * {
 *   type: 'name',
 *   detail: { id: 100, city: 'Roma', country: 'Italy' },
 *   target: null,  // Set when dispatched
 *   // ... other properties
 * }
 *
 * COMPARISON TO EventEmitter:
 *
 * EventTarget (this):
 *   const event = new CustomEvent('name', { detail: data });
 *   target.dispatchEvent(event);
 *
 * EventEmitter:
 *   emitter.emit('name', data);
 *
 * EventTarget requires explicit Event creation!
 */
const event = new CustomEvent('name', {
  detail: { id: 100, city: 'Roma', country: 'Italy' },
});

/**
 * Dispatch event to target (W3C Standard API)
 *
 * METHOD: dispatchEvent(event)
 *
 * Notifies all listeners registered for event.type ('name').
 *
 * @param {Event} event - Event object to dispatch
 * @returns {boolean} - true if not cancelled, false if cancelled
 *
 * EXECUTION FLOW:
 *
 * target.dispatchEvent(event)
 *   ↓
 * 1. Set event.target = target
 * 2. Get listeners for event.type ('name')
 * 3. Call each listener with event object
 *    → listener(event)
 * 4. Return true (not cancelled)
 *
 * LISTENER EXECUTION:
 * listener(event)
 *   ↓
 * console.log({ event })  // Full Event object
 * console.log({ data: event.detail })  // Custom data
 *
 * OUTPUT:
 * {
 *   event: CustomEvent {
 *     type: 'name',
 *     detail: { id: 100, city: 'Roma', country: 'Italy' },
 *     target: EventTarget { },
 *     // ...
 *   }
 * }
 * { data: { id: 100, city: 'Roma', country: 'Italy' } }
 *
 * COMPARISON TO EventEmitter:
 *
 * EventTarget:
 *   target.dispatchEvent(new CustomEvent('name', { detail: data }))
 *   → listener(eventObject)
 *   → access: eventObject.detail
 *
 * EventEmitter:
 *   emitter.emit('name', data)
 *   → listener(data)
 *   → access: data (direct)
 *
 * EventTarget is more verbose but follows W3C standard.
 */
target.dispatchEvent(event);

/**
 * KEY TAKEAWAYS:
 *
 * 1. EVENTTARGET: W3C standard event API
 * 2. CUSTOMEVENT: Carries custom data in 'detail'
 * 3. addEventListener: Register listener (like emitter.on)
 * 4. dispatchEvent: Trigger event (like emitter.emit)
 * 5. EVENT OBJECTS: Required (unlike EventEmitter's direct args)
 * 6. CROSS-PLATFORM: Same API in browser and Node.js
 *
 * WHEN TO USE:
 * ✅ Need browser compatibility
 * ✅ Want W3C standard API
 * ✅ Sharing code between platforms
 * ✅ Using AbortController or other EventTarget-based APIs
 *
 * COMPARISON FILES:
 * - 1-event.js (this): EventTarget (W3C)
 * - 2-emitter.js: EventEmitter (Node.js)
 * - 4-multiple.js: Compare duplicate behavior
 * - 5-remove.js: Compare removal behavior
 */
