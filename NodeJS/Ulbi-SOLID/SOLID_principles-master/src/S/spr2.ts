// Single Responsibility Principle
// Принцип единственной ответственности

// Другой пример.

// Класс для работы с ХТТП запросами.
class HttpClient {
  get(url: string) {}
  post() {}
  put() {}
  delete() {}
}

// Класс для работы с Юзером.
class UserService {
  client: HttpClient;
  constructor(client) {
      this.client = client;
  }
  getOneUser(id: number) {}
  getAllUsers() {}
}

class RequisitesService {
  createRequisites() {}
  getRequisites() {}
  updateRequisites() {}
}



