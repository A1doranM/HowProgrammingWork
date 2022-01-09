"use strict";

// Проверяем если мы в мастер процессе то запускаем местер, иначе воркера.
module.exports = process.channel ? require("./worker") : require("./master");
