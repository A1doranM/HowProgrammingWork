"use strict";

// Парсер и стейт машина разнесены по разным абстракциям. Найболее правильный вариант.

class StateMachine {
    constructor(meta) {
        this.state = Object.keys(meta)[0];
        this.meta = meta;
        this.buffer = "";

        console.log("StateMachine: ",
            "\nState: ", this.state,
            "\nMeta: ", this.meta,
            "\nBuffer: ", this.buffer
        );
    }

    feed(char) {
        const {state, meta, buffer} = this;
        const node = meta[state];
        console.log("\n ----------------------", "\nCurrent node, state, meta, buffer, char.");
        console.log("Node: ", node,
            "\nState: ", state,
            "\nMeta: ", meta,
            "\nBuffer: ", buffer,
            "\nChar: ", char,
            "\n"
        );
        for (const key of Object.keys(node)) {
            if (key.includes(char) || key === "") {
                const next = node[key];
                console.log(`Key, next: ${key} --> ${next}`, "\n ----------------------");
                console.log(`${char}: ${state} --> ${next}`, "\n ----------------------");
                if (state !== next) {
                    this.state = next;
                    this.buffer = key === "" ? char : "";
                    return buffer;
                }
                this.buffer += char;
                return;
            }
        }
        throw Error(`Unexpected char "${char}" at state ${state}`);
    }
}

class ArrayLiteralParser {
    constructor() {
        this.machine = new StateMachine({ // Описываем стейт машину и куда переходить встречая различные символы.
            start: {"[": "array"},
            array: {" ": "", ",": "next", "]": "end", "": "number"},
            next: {"": "array"},
            number: {".-0123456789": "number", ",": "next", "": "array"},
            end: {},
        });
    }

    input(string) {
        const array = [];
        for (const char of string) {
            const s = this.machine.feed(char);
            const el = parseFloat(s);
            if (!Number.isNaN(el)) array.push(el);
        }
        return array;
    }
}

// Usage

const parser = new ArrayLiteralParser();
const array = parser.input("[5, 7.1, -2, 194.5, 32]");
console.log({array});
