"use strict";

// Выделим парсер и стейт машину в отдельные абстракции.
// Стейт машина.
class StateMachine {
  constructor(meta) {
    this.state = "S0"; // Начальное состояние.
    this.meta = meta; // Последующие состояния.
  }

  feed(char) {
    const { state, meta } = this;
    const node = meta[state]; // Берем узел.
    const next = node[char]; // Берем символ.
    if (!next) throw Error(`Unexpected char "${char}" at state ${state}`); // Если не нашли.
    console.log(`${char}: ${state} --> ${next}`); // Говорим куда перейдем.
    this.state = next; // Устанавливаем куда перейти.
  }

  input(string) {
    for (const char of string) this.feed(char); // Разделяем строчку посимвольно и скармливам в фид.
  }
}

// Usage

const sm = new StateMachine({ // Состояния и что может приходить в каждое их них
  S0: { A: "S1", B: "S2", C: "S1" }, // может приходить А, В, С. Если А то переходим в S1, если В переходим в S2, и т.д.
  S1: { A: "S0", C: "S4" },
  S2: { B: "S0", C: "S3" },
  S3: { A: "S2", B: "S4", C: "S0" },
  S4: {},
});

sm.input("AABCB");
