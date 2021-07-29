const fs = require("fs");

const files = ["1-readFileSync.js", "2-writeFileSync.js", "4-errorFstat.js"];
const count = files.length - 1;
const stats = new Array(files.length);

const printResult = () => {
    console.dir({stats});
};

const addToStats = (file, i, err, stat) => {
    if (err) {
        console.log(`File ${file} not found`);
    } else {
        stats[i] = stat;
    }
    if (i === count) printResult();
};

const iterable = (file, i) => {
    console.dir({file, i});
    const cb = addToStats.bind(null, file, i);
    fs.lstat(file, cb);
};

files.forEach(iterable);

files.forEach((file, i) => {
    console.dir({file, i});
    fs.lstat(file, (err, stat) => {
        if (err) {
            console.log(`File ${file} not found`);
        } else {
            stats[i] = stat;
        }
        if (i === count) printResult();
    });
})