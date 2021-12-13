const fs = require("fs");

fs.readFile("1-readFileSync.js", "utf8", (err, buffer) => {
    if (err) {
        console.log(err);
        process.exit(0);
    }

    console.log("File size: ", buffer.length);
    const src = buffer.toString();
    const lines = src.split("\n").filter(line => !!line);
    const content = lines.join("\n");
    fs.writeFile("readFileSync.txt", content, err => {
        if (err) {
            console.log(err);
            process.exit(0);
        }
        console.log("New file size: ", content.length);
    });
});

console.log("Read write async example");