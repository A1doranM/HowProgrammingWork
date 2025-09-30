"use strict";

const name = "Marcus Aurelius";

console.log();
console.log(`name = ${name}`);

console.log();
console.log("Deprecated: String.prototype.substr(start, length)");
console.log(`name.substr(2) = "${name.substr(2)}"`);
console.log(`name.substr(-3) = "${name.substr(-3)}"`);
console.log(`name.substr(2, 4) = "${name.substr(2, 4)}"`);
console.log(`name.substr(-3, 2) = "${name.substr(-3, 2)}"`);
console.log(`name.substr(3, -2) = "${name.substr(3, -2)}"`);
console.log(`name.substr(-3, -2) = "${name.substr(-3, -2)}"`);

console.log();
console.log("String.prototype.slice(begin, [end])");
console.log(`name.slice(2) = "${name.slice(2)}"`);
console.log(`name.slice(-3) = "${name.slice(-3)}"`);
console.log(`name.slice(2, 4) = "${name.slice(2, 4)}"`);
console.log(`name.slice(-3, 2) = "${name.slice(-3, 2)}"`);
console.log(`name.slice(3, -2) = "${name.slice(3, -2)}"`);
console.log(`name.slice(-3, -2) = "${name.slice(-3, -3)}"`);

console.log();
console.log("String.prototype.substring(begin, [end])");
console.log(`name.substring(2) = "${name.substring(2)}"`);
console.log(`name.substring(-3) = "${name.substring(-3)}"`);
console.log(`name.substring(2, 4) = "${name.substring(2, 4)}"`);
console.log(`name.substring(-3, 2) = "${name.substring(-3, 2)}"`);
console.log(`name.substring(3, -2) = "${name.substring(3, -2)}"`);
console.log(`name.substring(-3, -2) = "${name.substring(-3, -2)}"`);
