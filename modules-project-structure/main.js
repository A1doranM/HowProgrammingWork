const lib = {};

// Dynamically load functions from libs from specified path;
["submodule1", "submodule2", "submodule3"].forEach(name => {
   const sub = require(`./lib/${name}.js`);
   Object.assign(lib, sub);
});

console.log('All modules imported');
console.log(Object.keys(lib).join(","));