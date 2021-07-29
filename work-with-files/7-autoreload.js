const fs = require("fs");

let buffer;

const load = path => {
    fs.readFile(path, "utf8", (err, data) => {
        if (err) throw err;
        buffer = data;
        console.log("\x1Bc");
        console.log("Buffer length: ", buffer.length);
        console.log(buffer.toString());
    });
};

const watch = path => {
    fs.watch("6-watch.js", (event, file) => {
        console.dir({event, file});
        load(path);
    });
};

const path = "./1-readFileSync.js";
load(path);
watch(path);