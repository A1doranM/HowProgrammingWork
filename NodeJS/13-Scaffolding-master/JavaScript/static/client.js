"use strict";

const buildAPI = (methods) => {
  const api = {};
  for (const method of methods) {
    api[method] = (...args) => new Promise((resolve, reject) => {
      const url = `/api/${method}`;
      console.log(url, args);
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      }).then((res) => {
        const { status } = res;
        if (status !== 200) {
          reject(new Error(`Status Code: ${status}`));
          return;
        }
        resolve(res.json());
      });
    });
  }
  return api;
};

const api = buildAPI(["entity", "read", "update"]);

const createForm = async (entity, id) => {
  const schema = await api.entity(entity);
  const instance = await api.read(id);
  const form = document.createElement("div");
  const inputs = {}; // Коллекция инпутов,
  for (const field in schema) { // идем по схеме,
    const definition = schema[field]; // для каждого поля
    const input = document.createElement("input"); // создаем инпут,
    input.setAttribute("id", field); // устанавливаем аттрибуты,
    if (definition.control === "password") { // если тип - пароль, то устанваливаем аттрибут,
      input.setAttribute("type", "password");
    }
    input.value = instance[field]; // забираем значение,
    inputs[field] = input; // складываем наш инпут в коллекцию,
    const label = document.createElement("label"); // создаем лейбл,
    label.innerHTML = field;
    label.setAttribute("for", field);
    const br = document.createElement("br");
    form.appendChild(label); // устанавливаем лейбл в форму,
    form.appendChild(input); // устанавливаем инпут в форму.
    form.appendChild(br);
  }
  const button = document.createElement("button"); // Создаем кнопку.
  button.innerHTML = "Save";
  button.onclick = () => { // При клике,
    const instance = {};
    for (const field in schema) { // проходим по всем полям в схеме и
      instance[field] = inputs[field].value; // для каждого инпута из коллекции забираем значение и сохраняем его,
    }
    api.update(id, instance); // вызываем апдейт куда отдаем коллекцию с новыми значениями.
  };
  form.appendChild(button);
  document.body.appendChild(form);
};

createForm("sensor", 2000); // Построить функцию по заданной схеме с заданным ид.
