const fs = require("fs");

const files = ["1-readFileSync.js", "2-writeFileSync.js", "4-errorFstat.js"];

const stats = new Array(files.length);

const maxIndex = files.length - 1;

const printResult = () => {
    console.dir({stats});
}

files.forEach((file, i) => {
    console.dir({file, i});
    fs.lstat(file, (err, stat) => {
        if (err) {
            console.log(`File ${file} not found`);
        } else {
            stats[i] = stat;
        }
        if (i === maxIndex) printResult();
    });
})