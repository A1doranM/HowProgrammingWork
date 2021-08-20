const fs = require("fs");
const zlib = require("zlib");

const rs = fs.createReadStream("1-readable.js", "utf8");
const ws = fs.createWriteStream("copyGz.js.gz", "utf8");
const gs = zlib.createGzip();

rs.pipe(gs).pipe(ws);

rs.on("end", () => {
    console.log("Done");
});