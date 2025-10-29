'use strict';
// Entity DAO
Object.defineProperty(exports, '__esModule', { value: true });
class UserDAO {
  options;
  constructor(options) {
    this.options = options;
  }
  getById(id) {
    if (!this.options.fake) throw new Error('Not a fake');
    return Promise.resolve({ id, name: 'Marcus Aurelius' });
  }
}
// Domain Entity
class User {
  id;
  name;
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}
// Repository
class UserRepository {
  dao;
  constructor(dao) {
    this.dao = dao;
  }
  async findById(id) {
    const raw = await this.dao.getById(id);
    if (!raw) throw new Error(`Record not found: User(${id})`);
    return new User(raw.id, raw.name);
  }
}
// Usage
const main = async () => {
  const userDAO = new UserDAO({ fake: true });
  const userRepositoty = new UserRepository(userDAO);
  const user = await userRepositoty.findById(1011);
  console.log({ user });
};
main();
