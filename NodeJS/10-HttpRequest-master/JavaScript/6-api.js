"use strict";

const http = require("http");

const ajax = (base, methods) => {
    const api = {};
    for (const method of methods) { // Идем по переданным методам,
        api[method] = (...args) => { // доклеиваем в объект методы по их именам,
            const callback = args.pop(); // достаем коллбек из последнего аргумента и удаляем его, контракт коллбека, вначале ошибка, потом данные.
            const url = base + method + "/" + args.join("/"); // УРЛ по которому метод срабатывает.
            console.log(url);
            http.get(url, res => { // Делаем запрос.
                if (res.statusCode !== 200) {
                    callback(new Error(`Status Code: ${res.statusCode}`));
                    return;
                }
                const buffer = [];
                res.on("data", chunk => buffer.push(chunk));
                res.on("end", () => callback(null, JSON.parse(buffer.join())));
            });
        };
    }
    return api;
};

// Usage

const api = ajax(
    "http://localhost:8000/api/",
    ["user", "userBorn"]
); // Декларативно прописываем урл на котором находится апи и методы которые у него будут.

api.user("marcus", (err, data) => {
    if (err) throw err;
    console.dir({data});
});

api.userBorn("mao", (err, data) => {
    if (err) throw err;
    console.dir({data});
});
