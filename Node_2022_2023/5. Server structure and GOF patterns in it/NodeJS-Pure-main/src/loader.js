"use strict";

const fsp = require("node:fs").promises;
const vm = require("node:vm");
const path = require("node:path");

const OPTIONS = {
  timeout: 5000,
  displayErrors: false,
};

const load = async (filePath, sandbox, contextualize = false) => {
  const src = await fsp.readFile(filePath, "utf8");
  const opening = contextualize ? "(context) => " : "";
  const code = `"use strict";\n${opening}${src}`;
  const script = new vm.Script(code, { ...OPTIONS, lineOffset: -1 });
  const context = vm.createContext(Object.freeze({ ...sandbox }));
  return script.runInContext(context, OPTIONS);
};

const loadDir = async (dir, sandbox, contextualize = false) => {
  const container = new Map();
  const files = await fsp.readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const { name } = file;

    if (file.isFile() && !name.endsWith(".js")) continue;

    const location = path.join(dir, name);
    const prefix = path.basename(name, ".js");
    const loader = file.isFile() ? load : loadDir;

    console.log("Loader: ", location, sandbox);

    const exp = await loader(location, sandbox, contextualize);

    if (exp.constructor.name === "Map") {
      for (const [key, value] of exp) {
        container.set(prefix + "." + key, value);
      }
    } else {
      container.set(prefix, exp);
    }
  }

  return container;
};

module.exports = { load, loadDir };
