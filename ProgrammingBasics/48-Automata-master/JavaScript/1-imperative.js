"use strict";

// Сначала читаем README.md
// Автомат для чтения по одной букве.

process.stdin.setRawMode(true);

const STATE_INIT = 0;
const STATE_WORK = 1;
const STATE_FIN = 2;
const STATE_EXIT = 3;

let state = STATE_INIT; // Начальное состояние.

// Нам приходит символ, мы считываем его и переходим в следующее состояние.
(async () => {
    for await (const chunk of process.stdin) {
        console.log({chunk});
        switch (state) { // Переходы между состояниями.
            case STATE_INIT:
                console.log("initialization");
                state = STATE_WORK; // Переходим в состояние работы.
                break;
            case STATE_WORK:
                console.log("working");
                state = STATE_FIN; // Переходим в состояние финализации.
                break;
            case STATE_FIN:
                console.log("finalization");
                state = STATE_EXIT; // Переходим в состояние выхода.
                break;
            case STATE_EXIT: // Состояние завершения работы.
                console.log("exit");
                process.exit(0);
        }
    }
})();
