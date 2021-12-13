const fs = require("fs");
const zlib = require("zlib");
const http = require("http");

const prepareCache = (callback) => {
    const rs = fs.createReadStream("index.html");
    const gs = zlib.createGzip();

    const buffers = [];
    let buffer = null;

    gs.on("data", buffer => {
        buffers.push(buffer);
    });

    gs.once("end", () => {
        buffer = Buffer.concat(buffers);
        if (callback) {
            callback(null, buffer);
            callback = null;
        }
    });

    rs.on("error", err => {
        if (callback) {
            callback(err);
            callback = null;
        }
    })

    gs.on("error", err => {
        if (callback) {
            callback(err);
            callback = null;
        }
    })

    rs.pipe(gs);
};

const startServer = (err, buffer) => {
    if (err) {
        throw err;
    }

    const server = http.createServer((req, res) => {
        console.log(req.url);
        res.writeHead(200, {"Content-Encoding": "gzip"});
        res.end(buffer);
    });
};

prepareCache(startServer);