const fs = require("fs");

const buffer = fs.readFileSync("1-readFileSync.js", "utf8");
const src = buffer.toString();
const lines = src.split("\n").filter(line => !!line);
fs.writeFileSync("readFileSync.txt", lines.join("\n"));