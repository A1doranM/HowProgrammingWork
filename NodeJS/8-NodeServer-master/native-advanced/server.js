"use strict";

// Минусы такого сервера в том что он синхронный, и если у нас на каком-то
// роуте будет долго выполняться функция то во время ее выполнения сервер не принимает другие запросы

const http = require("http");

const user = { name: "jura", age: 22 };

const routing = {
  "/": "welcome to homepage",
  "/user": user,
  "/user/name": () => user.name,
  "/user/age": () => user.age,
  "/user/*": (client, par) => "parameter=" + par[0],
};

const types = {
  object: JSON.stringify,
  string: s => s,
  number: n => n + "",
  undefined: () => "not found",
  function: (fn, par, client) => fn(client, par),
};

const matching = [];
// Достаем из роутинга все пути со звездочкой и переносим их в массив matching удаляя из роутинга
for (const key in routing) {
  if (key.includes("*")) {
    const rx = new RegExp(key.replace("*", "(.*)"));
    const route = routing[key];
    matching.push([rx, route]);
    delete routing[key];
  }
}

// Ищем нужный роут проходя по массиву matching если его нету в routing
const router = client => {
  let par;
  let route = routing[client.req.url];
  if (!route) {
    for (let i = 0; i < matching.length; i++) {
      const rx = matching[i];
      par = client.req.url.match(rx[0]);
      if (par) {
        par.shift();
        route = rx[1];
        break;
      }
    }
  }
  const type = typeof route;
  const renderer = types[type];
  return renderer(route, par, client);
};

http.createServer((req, res) => {
  res.end(router({ req, res }) + "");
}).listen(8000);
