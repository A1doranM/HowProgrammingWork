"use strict";

const ActorSystem = require("../system");
const http = require("http");

const URL = "http://localhost:8000/";
const INTERVAL = 2000; // Интервал с которым мы будем мониторит УРЛ.

// Актор мониторинга сервиса. Он не принимает и не реагирует на сообщение, у него уже задана работа которую он будет делать.
ActorSystem.register(class Monitoring {
  constructor() {
    console.log("Start actor: Monitoring");
    this.prevSuccess = true; // Предполагается что предидущее состояние это успех.
    this.timer = setInterval(() => { // Навешиваем таймер который будет пытаться постучать по урлу.
      this.attempt(URL);
    }, INTERVAL);
  }

  attempt(url) { // Делаем запрос и проверяем статус код.
    http.get(url, (res) => {
      const success = res.statusCode === 200;
      this.notify({ url, success, status: res.statusCode }); // Отправляем результат в виде структуры.
    }).on("error", (error) => {
      this.notify({ url, success: false, status: error.message }); // Если случилась ошибка сокета.
    });
  }

  notify({ url, success, status }) { // Отсылаем сообщение с данными через менеджера акторов.
    if (this.prevSuccess !== success) { // Если предидущее состояние не равно текущему,
      this.prevSuccess = success; // сохраняем текущее состояние.
      ActorSystem.send("Renderer", { url, success, status }); // Отправляем письмо актору Рендерер.
    }
  }

  async message() {}

  async exit() {
    clearInterval(this.timer);
    console.log("Stop actor: Monitoring");
  }
});
