"use strict";

const ActorSystem = require("../system");

// Актор рендерер. Этот актор получает сообщения и отсылает их Мейлеру.
ActorSystem.register(class Renderer {
  constructor() {
    console.log("Start actor: Renderer");
  }

  // Формируем сообщения и отправляем их.
  async message({ url, success, status }) {
    const to = "nodeua.com@gmail.com";
    const msg = success ? "is available again" : "is not available";
    const date = new Date().toUTCString();
    const reason = (success ? "Status code: " : "Error code: ") + status;
    const message = `Resource ${url} ${msg} (${date})\n${reason}`;
    const subject = "Server Monitoring";
    ActorSystem.send("Mailer", { to, subject, message });
  }

  async exit() {
    console.log("Stop actor: Renderer");
  }
});
