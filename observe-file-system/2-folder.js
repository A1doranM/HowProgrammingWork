const fs = require("fs");

const changes = [];

const display = (files) => {
    console.log("\x1Bc");
    while (changes.length > 10) {
        changes.shift();
    }
    console.log("Changes: ");
    for (const item of changes) {
        console.log(item);
    }
    console.log("\nFiles:");
    for (const file of files) {
        console.log(file);
    }
};

const ls = (path) => {
    fs.readdir(path, (err, files) => {
        if (err) return;
        display(files);
    });
};

const watch = (path) => {
    fs.watch(path, (event, file) => {
        console.log("\x1Bc");
        changes.push({data: new Date(), event, file});
        ls(path);
    });
};

const path = "./";
ls(path);
watch(path);