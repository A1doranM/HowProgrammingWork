// server

// Пример описания контракта. Такой контракт проверяется в рантайме.
({
  parameters: { // Описания входящих параметров для метода.
    a: "number",
    b: "number",
  },

  method: async ({ a, b }) => { // Есть ключ - метод.
    const result = a > b;
    return result;
  },

  returns: "boolean", // Описание возвращаемого результата.
});

// front

const res = await api.example.compare({ a: 1, b: 2 });
