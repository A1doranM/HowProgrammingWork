'use strict';

// npm install @preact/signals-core --save
const { signal, computed } = require('@preact/signals-core');

const count = signal(100);
console.log(`Count 1: ${count.value}`);

count.value = 200;
console.log(`Count 2: ${count.value}`);

count.value += 50;
console.log(`Count 3: ${count.value}`);

const num = signal(1000);

const total = computed(() => num.value + count.value);
console.log(`Total: ${total.value}`);
