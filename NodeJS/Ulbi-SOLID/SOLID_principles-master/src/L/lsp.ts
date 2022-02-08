// Принцип подстановки Барбары Лисков.
// Функции и сущности которые используют родительский тип должны точно так же работать с дочерними классами
// не ломая программу. Иначе говоря, наследуя что-то мы должны дополнять поведение родителя, а не замещать его.
// Например у класса Person есть методы move, sleep, и наследуясь от него создавая например Лучника и вызывая его
// метод move мы должны получать именно перемещение, а не например полет.
class Database {
  connect() {}
  read() {}
  write() {}
}

class SQLDatabase extends Database {
  connect() {}
  read() {}
  write() {}
  joinTables() {}
}

class NOSQLDatabase extends Database {
  connect() {}
  read() {}
  write() {}
  createIndex() {}
}

class MySQLDatabase extends SQLDatabase {
  connect() {}
  read() {}
  write() {}
  joinTables() {}
}

class MongoDatabase extends NOSQLDatabase {
  connect() {}
  read() {}
  write() {}
  createIndex() {}
  mergeDocuments() {}
}


function startApp(database: Database) {
  database.connect()
}
startApp(new MongoDatabase())
startApp(new MySQLDatabase())





