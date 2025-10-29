'use strict';

const EventEmitter = require('node:events');

class Editor extends EventEmitter {
  constructor() {
    super();
    this.document = [];
    this.on('edit', ({ name, edit }) => {
      this.document.push(edit);
      const content = this.getContent();
      this.emit('content', { name, content });
    });
  }

  getContent() {
    return this.document.join('');
  }
}

class User {
  constructor(name, editor) {
    this.name = name;
    this.editor = editor;
    editor.on('content', ({ name, content }) => {
      if (name === this.name) return;
      console.log(`${this.name} sees updated document: "${content}"`);
    });
  }

  makeEdit(edit) {
    console.log(`${this.name} edits: "${edit}"`);
    this.editor.emit('edit', { name: this.name, edit });
  }
}

// Usage

const editor = new Editor();

const user1 = new User('Marcus', editor);
const user2 = new User('Lucius', editor);

console.log('Initial Document:', editor.getContent());

user1.makeEdit('Hello ');
user2.makeEdit('World!');

console.log('Final Document:', editor.getContent());
