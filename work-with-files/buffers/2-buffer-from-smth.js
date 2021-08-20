const b1 = Buffer.from([1, 2, 3, 4, 5, 6]);
console.log(b1);

const b2 = Buffer.from("Test message");
console.log(b2.toString("hex"));
console.log(b2.toString("utf8"));
console.log(b2.toString("ascii"));