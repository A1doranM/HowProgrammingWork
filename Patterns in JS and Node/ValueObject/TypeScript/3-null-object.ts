// Value Object

class UserId {
  constructor(public id?: number) {}
}

// Null Object

class NullUser extends UserId {
  constructor() {
    super(-1);
  }
}

// Usage

const userId = new UserId(1012);
console.log(userId);

const userNone = new NullUser();
console.log(userNone);
