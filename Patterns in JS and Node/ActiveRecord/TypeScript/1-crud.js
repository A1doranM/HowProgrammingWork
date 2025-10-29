'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const USERS = {};

class User {
  id;
  name;
  email;

  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  static async find(id) {
    const record = USERS[id];
    if (!record) return null;
    return new User(record.id, record.name, record.email);
  }

  async save() {
    const { id, name, email } = this;
    USERS[this.id] = { id, name, email };
  }

  async delete() {
    delete USERS[this.id];
  }
}

// Usage

const main = async () => {
  const user = new User('1012', 'Marcus', 'marcus@rpqr.com');
  await user.save();
  if (user) {
    const user = await User.find('1012');
    await user?.delete();
  }
};

main();
