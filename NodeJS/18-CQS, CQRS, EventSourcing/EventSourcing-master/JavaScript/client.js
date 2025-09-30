"use strict";

// Файл который запускает весь наш процесс.

const { EventEmitter } = require("events");
const eventBus = new EventEmitter(); // Создаем шину которая будет каналом взаимодействия между модулями.

const { BankWrite } = require("./writer.js"); // Подгружаем модули.
const { BankRead } = require("./reader.js");

// На запись создается один АПИ чтобы избежать проблем когда сразу несколько разных модулей пишут в одно место.
const writeApi = new BankWrite(eventBus); // Один на запись.
const readApi1 = new BankRead(eventBus); // Три на чтение.
const readApi2 = new BankRead(eventBus);
const readApi3 = new BankRead(eventBus);

// Когда мы создаем аккаунт в бэкенде для записи, вызовы продублируются в бэкендах для записи.
// Тогда они будут хранить всю историю и все записи у себя и можно будет распаралелить нагрузку на чтение.
const marcus = "Marcus Aurelius";
writeApi.createAccount(marcus);
writeApi.operation(marcus, 1000);
writeApi.operation(marcus, -50);

const pius = "Antoninus Pius";
writeApi.createAccount(pius);
writeApi.operation(pius, 500);
writeApi.operation(pius, -100);
writeApi.operation(pius, 150);

const res1 = readApi1.select({ account: marcus });
console.table(res1);
const marcusBalance1 = readApi1.getAccount(marcus);
console.dir({ marcusBalance1 });

const res2 = readApi2.select({ account: pius, operation: "Income" });
console.table(res2);

const res3 = readApi3.select({ operation: "Withdraw" });
console.table(res3);
