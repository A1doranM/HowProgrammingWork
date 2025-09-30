"use strict";

const ActorSystem = require("../system");
const nodemailer = require("nodemailer"); // Подгружаем библиотеку. Сторонняя библиотека для отправки емейлов.
const auth = require("../config");

const FROM = "nodeua.com@gmail.com";

ActorSystem.register(class Mailer {
  constructor() {
    console.log("Start actor: Mailer");
    this.transport = nodemailer.createTransport({
      service: "gmail", auth
    });
  }

  async message({ to, subject, message }) { // Принимаем сообщения.
    const mail = { from: FROM, to, subject, text: message };
    this.transport.sendMail(mail, (error, data) => { // Отсылаем емейл.
      if (error) console.log(error);
      else console.log(`Email sent: ${data.response}`);
    });
  }

  async exit() {
    this.transport.close();
    console.log("Stop actor: Mailer");
  }
});
