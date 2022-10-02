"use strict";

// Функция для получения всех буферов из реквеста
// и их склеивания.

const receiveArgs = async (req) => {
  const buffers = [];
  for await (const chunk of req) buffers.push(chunk);
  const data = Buffer.concat(buffers).toString(); // Склеиваем все и затем превращаем в строку.
  return JSON.parse(data);
};

module.exports = receiveArgs;
