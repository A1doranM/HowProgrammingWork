'use strict';

class Document {
  constructor() {
    this.content = [];
  }

  applyEdit(edit) {
    this.content.push(edit);
  }

  getContent() {
    return this.content.join('');
  }
}

// Mediator

class Editor {
  constructor() {
    this.users = new Map();
    this.document = new Document();
  }

  addUser(user) {
    this.users.set(user.id, user);
    user.setMediator(this);
  }

  removeUser(user) {
    this.users.delete(user.id);
  }

  receiveEdit(userId, edit) {
    if (!this.users.has(userId)) return;

    this.document.applyEdit(edit);
    const content = this.document.getContent();

    for (const [id, user] of this.users) {
      if (id !== userId) user.receiveUpdate(content);
    }
  }

  getContent() {
    return this.document.getContent();
  }
}

class User {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.mediator = null;
  }

  setMediator(mediator) {
    this.mediator = mediator;
  }

  makeEdit(edit) {
    if (this.mediator) {
      console.log(`${this.name} edits: "${edit}"`);
      this.mediator.receiveEdit(this.id, edit);
    }
  }

  receiveUpdate(content) {
    console.log(`${this.name} sees updated document: "${content}"`);
  }
}

// Usage

const editor = new Editor();

const user1 = new User(1, 'Marcus');
const user2 = new User(2, 'Lucius');

editor.addUser(user1);
editor.addUser(user2);

console.log('Initial Document:', editor.getContent());

user1.makeEdit('Hello ');
user2.makeEdit('World!');

console.log('Final Document:', editor.getContent());
