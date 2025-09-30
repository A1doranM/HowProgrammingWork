module.exports = {
  static: {
   port: 8000
  },
  api: {
    port: 8001
  },
  sandbox: {
    timeout: 5000,
    displayErrors: false
  },
  db: {
    host: "localhost",
    port: 5433,
    name: "node-2022",
    user: "postgres",
    password: "1q2w3e3e2w1q4r"
  },
  transport: "http"
}
