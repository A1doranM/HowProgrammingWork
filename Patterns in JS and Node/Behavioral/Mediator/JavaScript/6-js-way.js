'use strict';

/**
 * FILE PURPOSE: Modern Mediator - EventEmitter-Based
 *
 * Most JavaScript-idiomatic mediator implementation using EventEmitter.
 * Replaces direct method calls with event-based communication.
 *
 * IMPROVEMENTS over 5-collaborative.js:
 * ✅ Event-driven (more decoupled)
 * ✅ No explicit user tracking needed in User class
 * ✅ Easier to extend (just add event listeners)
 * ✅ Familiar pattern (EventEmitter is standard in Node.js)
 *
 * PATTERN: Mediator + Observer
 * Combines Mediator (Editor coordinates) with Observer (EventEmitter pub/sub).
 *
 * COMMUNICATION:
 * User → emit('edit') → Editor → emit('content') → Other Users
 */

const EventEmitter = require('node:events');

// ========================================
// Mediator: Editor (EventEmitter-based)
// ========================================

/**
 * Editor Mediator
 *
 * Extends EventEmitter to use event-based communication.
 * Listens for 'edit' events, broadcasts 'content' events.
 *
 * EVENT FLOW:
 * 'edit' event → apply to document → 'content' event → all users notified
 */
class Editor extends EventEmitter {
  constructor() {
    super();  // Initialize EventEmitter
    this.document = [];  // Shared document state
    
    /**
     * Listen for 'edit' events from users
     *
     * When any user emits 'edit', this handler:
     * 1. Applies edit to document
     * 2. Gets updated content
     * 3. Broadcasts 'content' event to all listeners (users)
     *
     * This replaces receiveEdit() method from 5-collaborative.js
     */
    this.on('edit', ({ name, edit }) => {
      this.document.push(edit);  // Apply edit
      const content = this.getContent();
      this.emit('content', { name, content });  // Broadcast update
    });
  }

  getContent() {
    return this.document.join('');
  }
}

// ========================================
// Colleague: User
// ========================================

/**
 * User Class
 *
 * Communicates with Editor via events instead of direct method calls.
 * Automatically subscribes to content updates on construction.
 *
 * EVENT-BASED PATTERN:
 * - Emits 'edit' events to editor
 * - Listens for 'content' events from editor
 * - No direct coupling to other users
 */
class User {
  constructor(name, editor) {
    this.name = name;
    this.editor = editor;  // Reference to mediator
    
    /**
     * Subscribe to content updates
     *
     * Automatically registers listener when user created.
     * Filters out own edits (don't notify self).
     *
     * This replaces receiveUpdate() being called by mediator -
     * now it's event-driven subscription.
     */
    editor.on('content', ({ name, content }) => {
      if (name === this.name) return;  // Skip own edits
      console.log(`${this.name} sees updated document: "${content}"`);
    });
  }

  /**
   * Make edit (emit event instead of calling method)
   *
   * Emits 'edit' event that Editor is listening for.
   * Doesn't call editor.receiveEdit() directly - uses events.
   */
  makeEdit(edit) {
    console.log(`${this.name} edits: "${edit}"`);
    this.editor.emit('edit', { name: this.name, edit });  // Event-based
  }
}

// ========================================
// Usage
// ========================================

const editor = new Editor();  // Mediator

const user1 = new User('Marcus', editor);  // Auto-subscribes to 'content'
const user2 = new User('Lucius', editor);  // Auto-subscribes to 'content'

console.log('Initial Document:', editor.getContent());

/**
 * EXECUTION: user1.makeEdit('Hello ')
 * 1. User1 emits 'edit' event
 * 2. Editor's 'edit' listener applies edit
 * 3. Editor emits 'content' event
 * 4. User2's 'content' listener receives update
 * → "Lucius sees updated document: "Hello ""
 */
user1.makeEdit('Hello ');

/**
 * EXECUTION: user2.makeEdit('World!')
 * 1. User2 emits 'edit' event
 * 2. Editor applies edit
 * 3. Editor emits 'content' event
 * 4. User1's 'content' listener receives update
 * → "Marcus sees updated document: "Hello World!""
 */
user2.makeEdit('World!');

console.log('Final Document:', editor.getContent());  // "Hello World!"

/**
 * EVENTEMITTER MEDIATOR BENEFITS:
 *
 * vs 5-collaborative.js (direct method calls):
 *
 * 1. MORE DECOUPLED:
 *    Users don't call mediator methods directly
 *    Events provide loose coupling
 *
 * 2. EASIER TO EXTEND:
 *    Add new event types without changing classes
 *    editor.on('save', ...), editor.on('undo', ...)
 *
 * 3. FAMILIAR PATTERN:
 *    EventEmitter is Node.js standard
 *    Developers already know this pattern
 *
 * 4. FLEXIBLE:
 *    Multiple listeners per event
 *    Easy to add logging, analytics, etc.
 *
 * PATTERN EVOLUTION COMPLETE:
 * 1-theory → 2-simple → 3-auth → 4-js-way → 5-collaborative → 6-js-way ✅
 */
