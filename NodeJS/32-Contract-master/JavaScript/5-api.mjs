// server: application/api/crm/createAccount.js

({
  parameters: {
    name: "string",
    age: { type: "number", min: 16 },
    address: {
      city: "string",
      street: "?string",
      building: "?number",
    },
  },

  method: async ({ name, age, address }) => {
    const processed = await db.select("Account", { name });
    if (processed) return { exists: true, status: "registered" };
    const cityId = await db.select("City", { name: address.city });
    const accountId = await db.insert("Account", { name, age, city });
    return { exists: true, status: "inserted" };
  },

  returns: {
    exists: "boolean",
    status: { enum: ["inserted", "restricted", "registered"] },
  },
});

// client

const res = await api.crm.createAccount({ name, age, address });
