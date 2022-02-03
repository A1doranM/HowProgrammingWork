// server

({
  parameters: {
    a: "number",
    b: "number",
  },

  method: async ({ a, b }) => {
    const result = a > b;
    return result;
  },

  returns: "boolean",
});

// front

const res = await api.example.compare({ a: 1, b: 2 });
