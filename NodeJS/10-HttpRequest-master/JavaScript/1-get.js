"use strict";

const http = require("http");

const url = "http://ietf.org/";

http.get(url, res => { // Функция из библиотеки хттп.
  console.log(res.req._header); // Заголовки которые мы отсылаем на сервер.
  console.dir(res.headers); // Заголовки которые сервер нам прислал.
  if (res.statusCode !== 200) {
    const { statusCode, statusMessage } = res;
    console.log(`Status Code: ${statusCode} ${statusMessage}`);
    return;
  }
  res.setEncoding("utf8");
  const buffer = []; // Буфер данных
  res.on("data", chunk => {
    buffer.push(chunk);
  });
  res.on("end", () => { // В конце объединяем данные в буффере в одно целое.
    console.log(buffer.join());
  });
});
