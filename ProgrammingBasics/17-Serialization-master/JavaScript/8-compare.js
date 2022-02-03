"use strict";

const v8 = require("v8");
const fs = require("fs");
const jstp = require("metarhia-jstp");
const BSON = require("bson");
const bson = new BSON();

const persons = [
  { name: "Marcus Aurelius", city: "Rome", born: 121 },
  { name: "Victor Glushkov", city: "Rostov on Don", born: 1923 },
  { name: "Ibn Arabi", city: "Murcia", born: 1165 },
  { name: "Mao Zedong", city: "Shaoshan", born: 1893 },
  { name: "Rene Descartes", city: "La Haye en Touraine", born: 1596 }
];

const v8Data = v8.serialize(persons);
const v8File = "./data.v8";
fs.writeFile(v8File, v8Data, () => {
  console.log("Saved " + v8File);
});

const jsonData = JSON.stringify(persons);
const jsonFile = "./data.json";
fs.writeFile(jsonFile, jsonData, () => {
  console.log("Saved " + jsonFile);
});

const jstpData = jstp.stringify(persons);
const jstpFile = "./data.jstp";
fs.writeFile(jstpFile, jstpData, () => {
  console.log("Saved " + jstpFile);
});

const bsonData = bson.serialize(persons);
const bsonFile = "./data.bson";
fs.writeFile(bsonFile, bsonData, () => {
  console.log("Saved " + bsonFile);
});
