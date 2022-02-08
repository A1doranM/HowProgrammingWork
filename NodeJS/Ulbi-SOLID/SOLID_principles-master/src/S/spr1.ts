// Single Responsibility Principle
// Принцип единственной ответственности гласит что один класс, или функция должен решать одну задачу.
const http = {send: () => ({})};

const generateId = () => Date.now() * Math.random();

// Есть класс пользователя.
class User {
  id: number;
  username: string;
  password: string;

  constructor(username: string, password: string) {
    this.id = generateId();
    this.username = username;
    this.password = password;
  }
}

// Отдельно доступ к БД, а не внутри юзера.
class UserRepository {
  save(user: User) {
    // сохранение пользователя в бд
  }
}

// Логер.
class UserLogger {
  log(user: User) {
    console.log(user)
  }
}

// И контролер
class UserController {
  send(user: User) {
    return http.send()
  }
}
