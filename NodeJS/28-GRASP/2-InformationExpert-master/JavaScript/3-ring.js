"use strict";

// Eще один пример с созданием циклического буфера.
// Такой буфер при переполнении заменяет первые символы в нем новыми которые в него приходят.

class RingBuffer {
  constructor(size) {
    this.size = size;
    this.buffer = Buffer.alloc(size);
    this.offset = 0;
  }

  write(data) {
    const { size, offset } = this;
    const { length } = data;
    const available = size - offset;
    const len = Math.min(available, size, length);
    const rest = available - length;
    this.buffer.write(data, offset, len);
    this.offset += len;
    if (this.offset === size) this.offset = 0;
    if (rest < 0) this.write(data.slice(rest));
  }

  toString() {
    return this.buffer.toString("utf8");
  }
}

// Usage

const ring = new RingBuffer(10);
ring.write("1");
console.log(ring.toString());
ring.write("23");
console.log(ring.toString());
ring.write("4567890A");
console.log(ring.toString());
ring.write("B");
console.log(ring.toString());
