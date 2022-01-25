"use strict";

// Плохая реализация.

const express = require("express");
const logger = require("./logger.js");
const timeout = require("./timeout.js");

const app = express();

// Цепляем наш логер. Чтобы при каждом вызове он срабатывал.
app.use(logger);
// Цепляем мидлвар который считает таймауты, который к тому же не работает без логера.
// Должен отдавать ошибку если запрос выполняется дольше одной секунды.
app.use(timeout(1000));

// Роутинг
app.get("/", (req, res) => {
  res.end("Hello World!");
});

// Роутинг для проверки таймаута
app.get("/page1", (req, res) => {
  setTimeout(() => {
    res.end("Hello World!");
  }, 5000);
});

app.listen(8000);
