// Entity DAO

type RawUser = { id: number; name: string };

class UserDAO {
  constructor(public options: { fake: true }) {}

  getById(id: number): Promise<RawUser> {
    if (!this.options.fake) throw new Error('Not a fake');
    return Promise.resolve({ id, name: 'Marcus Aurelius' });
  }
}

// Domain Entity

class User {
  constructor(public id: number, public name: string) {}
}

// Repository

class UserRepository {
  constructor(private dao: UserDAO) {}

  async findById(id: number): Promise<User> {
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
