({
  login: { type: "string", unique: true },
  password: "string",
  blocked: { type: "boolean", default: false },
  company: "Company",
  fullName: {
    given: "?string",
    middle: "?string",
    surname: "?string",
  },
  addresses: { many: "Address" },
});
