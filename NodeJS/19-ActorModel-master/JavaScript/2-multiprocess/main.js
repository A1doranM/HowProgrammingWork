"use strict";

const ActorSystem = require("./system.js");

const EXIT_NORMAL = 1000;
const EXIT_ABNORMAL = 5000;

ActorSystem.start("Root");

// Мультипроцессовая реализация Акторов. У которых взаимодействие осуществляется через встроенное межпроцессовое взаимодействие.

process.on("SIGINT", () => {
  console.log("");
  ActorSystem.stop("Root");
  setTimeout(() => {
    console.log("Graceful shutdown");
    process.exit(0); // Если все акторы завершились за отведенное время отсылаем код нормального завершения работы.
  }, EXIT_NORMAL);
  setTimeout(() => {
    console.log("Abnormal termination");
    process.exit(1); // Иначе не нормальное.
  }, EXIT_ABNORMAL);
});
