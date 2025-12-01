'use strict';

/**
 * FILE PURPOSE: Real-World Mediator - Collaborative Editor
 *
 * Demonstrates Mediator coordinating multiple users editing a shared document.
 * When one user edits, all others see the update.
 *
 * COORDINATION FLOW:
 * User1 makes edit → Editor applies edit → Editor broadcasts to User2
 * User2 makes edit → Editor applies edit → Editor broadcasts to User1
 *
 * MEDIATOR ROLE (Editor):
 * - Manages shared document
 * - Tracks all active users
 * - Applies edits to document
 * - Broadcasts updates to other users
 *
 * WHY MEDIATOR HERE:
 * Users don't know about each other or send updates directly.
 * Editor coordinates everything - adding/removing users doesn't affect other users.
 */

// ========================================
// Shared Resource: Document
// ========================================

/**
 * Document class stores and manages content.
 * Encapsulates the shared state being edited.
 */
class Document {
  constructor() {
    this.content = [];  // Array of edits
  }

  applyEdit(edit) {
    this.content.push(edit);  // Append edit
  }

  getContent() {
    return this.content.join('');  // Combine all edits
  }
}

// ========================================
// Mediator: Editor
// ========================================

/**
 * Editor Mediator Class
 *
 * Coordinates multiple users editing shared document.
 * Handles:
 * - User registration/removal
 * - Edit application to document
 * - Broadcasting updates to all users except editor
 */
class Editor {
  constructor() {
    this.users = new Map();  // Track all users (userId → User)
    this.document = new Document();  // Shared document
  }

  /**
   * Add user to collaborative session
   * Sets up bidirectional relationship: user knows editor, editor knows user
   */
  addUser(user) {
    this.users.set(user.id, user);
    user.setMediator(this);  // Give user reference to editor
  }

  /**
   * Remove user from session
   */
  removeUser(user) {
    this.users.delete(user.id);
  }

  /**
   * Receive edit from user and broadcast to others
   *
   * COORDINATION LOGIC (the heart of mediator):
   * 1. Validate user exists
   * 2. Apply edit to document
   * 3. Get updated content
   * 4. Notify ALL other users (except sender)
   *
   * This is where the mediator pattern shines - centralized coordination.
   */
  receiveEdit(userId, edit) {
    if (!this.users.has(userId)) return;  // Validate user

    this.document.applyEdit(edit);  // Apply to shared document
    const content = this.document.getContent();  // Get updated content

    // Broadcast to all users except sender
    for (const [id, user] of this.users) {
      if (id !== userId) {  // Skip sender
        user.receiveUpdate(content);  // Notify other users
      }
    }
  }

  getContent() {
    return this.document.getContent();
  }
}

// ========================================
// Colleague: User
// ========================================

/**
 * User Class (Colleague)
 *
 * Represents a user in collaborative editing session.
 * Communicates only with Editor mediator, not other users.
 */
class User {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.mediator = null;  // Set later via setMediator()
  }

  setMediator(mediator) {
    this.mediator = mediator;  // Establish connection to editor
  }

  /**
   * Make edit to document via mediator
   * User doesn't edit document directly - goes through mediator
   */
  makeEdit(edit) {
    if (this.mediator) {
      console.log(`${this.name} edits: "${edit}"`);
      this.mediator.receiveEdit(this.id, edit);  // Send to mediator
    }
  }

  /**
   * Receive update from mediator
   * Called by mediator when another user makes edit
   */
  receiveUpdate(content) {
    console.log(`${this.name} sees updated document: "${content}"`);
  }
}

// ========================================
// Usage: Collaborative Editing
// ========================================

const editor = new Editor();  // Create mediator

const user1 = new User(1, 'Marcus');
const user2 = new User(2, 'Lucius');

editor.addUser(user1);  // Register users
editor.addUser(user2);

console.log('Initial Document:', editor.getContent());  // ""

/**
 * EXECUTION: user1.makeEdit('Hello ')
 * 1. User1 sends edit to Editor
 * 2. Editor applies "Hello " to document
 * 3. Editor broadcasts to User2 (not User1)
 * → Output: "Lucius sees updated document: "Hello ""
 */
user1.makeEdit('Hello ');

/**
 * EXECUTION: user2.makeEdit('World!')
 * 1. User2 sends edit to Editor
 * 2. Editor applies "World!" to document
 * 3. Editor broadcasts to User1 (not User2)
 * → Output: "Marcus sees updated document: "Hello World!""
 */
user2.makeEdit('World!');

console.log('Final Document:', editor.getContent());  // "Hello World!"

/**
 * PATTERN BENEFITS SHOWN:
 *
 * 1. USERS DON'T KNOW EACH OTHER:
 *    User1 doesn't have reference to User2
 *    User2 doesn't have reference to User1
 *
 * 2. CENTRALIZED COORDINATION:
 *    All broadcast logic in Editor.receiveEdit()
 *    Easy to add features (save to DB, conflict resolution, etc.)
 *
 * 3. SCALABLE:
 *    Can add User3, User4, ... without changing existing users
 *    Editor.receiveEdit() already handles N users
 *
 * 4. DECOUPLED:
 *    Users are reusable in different contexts
 *    Editor can work with any User implementation
 */
