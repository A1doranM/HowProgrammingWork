"use strict";

const http = require("http");

const Client = require("./client.js");
const Session = require("./session.js");

// Роутинг проекта, все обработчики в котором асинхронны
const routing = {
  "/": async () => "<h1>welcome to homepage</h1><hr>",
  "/start": async (client) => { // Хендлер начала сессии
    Session.start(client);
    return `Session token is: ${client.token}`;
  },
  "/destroy": async (client) => {
    const result = `Session destroyed: ${client.token}`;
    Session.delete(client);
    return result;
  },
  "/api/method1": async (client) => {
    if (client.session) {
      client.session.set("method1", "called");
      return {data: "example result"};
    } else {
      return {data: "access is denied"};
    }
  },
  "/api/method2": async (client) => ({
    url: client.req.url,
    headers: client.req.headers,
  }),
  "/api/method3": async (client) => {
    if (client.session) {
      return [...client.session.entries()] // Преобразование итератора в массив.
        .map(([key, value]) => `<b>${key}</b>: ${value}<br>`)
        .join();
    }
    return "No session found";
  },
};


// Сериализатор, суть сериализатора все привести к строке чтобы затем отдать на клиент
const types = {
  object: JSON.stringify,
  string: (s) => s,
  number: (n) => n.toString(),
  undefined: () => "not found",
};

http.createServer(async (req, res) => {
  const client = await Client.getInstance(req, res); // Создаем наш клиент
  const {method, url, headers} = req;
  console.log(`${method} ${url} ${headers.cookie}`);
  const handler = routing[url]; // Считываем роут и получаем асинхронную функцию
  res.on("finish", () => { // Если будет существовать сессия то в конце мы ее сохраним
    if (client.session) client.session.save();
  });
  if (!handler) { // Если такого роута нет
    res.statusCode = 404;
    res.end("Not found 404");
    return;
  }
  handler(client)
    .then((data) => {
      const type = typeof data;
      const serializer = types[type];
      const result = serializer(data);
      client.sendCookie();
      res.end(result);
    }, (err) => {
      res.statusCode = 500;
      res.end("Internal Server Error 500");
      console.log(err);
    });
}).listen(8000);
