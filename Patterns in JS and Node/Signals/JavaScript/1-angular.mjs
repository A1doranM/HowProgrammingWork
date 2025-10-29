import { signal, computed } from '@angular/core';

// npm install @angular/core --save
// yarn add @angular/core

const count = signal(100);
console.log(`Count 1: ${count()}`);

count.set(200);
console.log(`Count 2: ${count()}`);

count.update((prev) => prev + 50);
console.log(`Count 3: ${count()}`);

const num = signal(1000);

const total = computed(() => num() + count());
console.log(`Total: ${total()}`);
