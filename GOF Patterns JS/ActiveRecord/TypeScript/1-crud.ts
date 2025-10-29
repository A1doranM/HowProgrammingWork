const USERS: Record<string, unknown> = {};

class User {
  constructor(
    public id: string,
    public name: string,
    public email: string
  ) {}

  static async find(id: string): Promise<User | null> {
    const record = USERS[id] as User;
    if (!record) return null;
    return new User(record.id, record.name, record.email);
  }

  async save(): Promise<void> {
    const { id, name, email } = this;
    USERS[this.id] = { id, name, email };
  }

  async delete(): Promise<void> {
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
