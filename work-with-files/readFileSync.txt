const fs = require("fs");

const buffer = fs.readFileSync("1-readFileSync.js", "utf8");
const src = buffer.toString();

console.log("Buffer length: ", buffer.length);
console.log(buffer);
console.log("SRC: ", src);

const lines = src.split("\n").filter(line => !!line);
console.dir(lines);