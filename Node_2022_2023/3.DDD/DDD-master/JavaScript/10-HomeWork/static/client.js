"use strict";

const webSocketUrl = "ws://127.0.0.1:8001";
const httpUrl = "http://localhost:8001";

const headers = new Headers();

headers.append("Accept", "*");

const webSocketScaffold = (serviceName, methodName) => (...args) => new Promise((resolve) => {
  const packet = {name: serviceName, method: methodName, args};
  socket.send(JSON.stringify(packet));
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    resolve(data);
  };
});

const httpScaffold = (serviceName, methodName) => (...args) => new Promise((resolve) => {
  fetch(`${httpUrl}/${serviceName}/${methodName}/${args}`, {
    method: "GET",
  }).then(async (res) => {
    const data = await res.json();
    resolve(data[0]);
  });
});

const scaffold = (structure, url) => {
  const transportType = url.split("://")[0];
  const transports = {
    "http": httpScaffold,
    "ws": webSocketScaffold
  };

  const api = {};
  const services = Object.keys(structure);

  for (const serviceName of services) {
    api[serviceName] = {};
    const service = structure[serviceName];
    const methods = Object.keys(service);

    for (const methodName of methods) {
      api[serviceName][methodName] = transports[transportType](serviceName, methodName);
    }
  }

  console.log("API: ", api);

  return api;
};


const api = scaffold({
  user: {
    create: ["record"],
    read: ["id"],
    update: ["id", "record"],
    delete: ["id"],
    find: ["mask"],
  },
  country: {
    read: ["id"],
    delete: ["id"],
    find: ["mask"],
  },
}, httpUrl);

const runHttp = async () => {
  console.log("Run HTTP");
  const data = await api.user.read(3);
  console.log("DATA: ", {data});
}

const runWs = () => {
  const socket = new WebSocket(webSocketUrl);
  socket.addEventListener("open", async () => {
    const data = await api.user.read(3);
    console.dir({data});
  });
}

runHttp();




