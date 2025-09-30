const api = {};
api.fs = require("fs");
api.vm = require("vm");
api.sandboxedFs = require("sandboxed-fs");

const sandboxRequire = (moduleName) => {
    const restrictedModules = new Set(["fs", "os", "cluster"]);
    if (restrictedModules.has(moduleName)) {
        const msg = `The module ${moduleName} is restricted`;
        return new Error(msg);
    } else {
        console.log(`Trying to require ${moduleName} `);
        return require(moduleName);
    }
}

const sandboxLogger = (message) => {
    console.log("Message from sandbox: ");
    console.log(message);
}

const runPracticeSandbox = (path) => {
    const context = {
        module: {},
        require: sandboxRequire,
        sandboxApi: {
            console: {
                log: sandboxLogger
            },
            timers: {
                setInterval: sandboxInterval,
                setTimeout: sandboxTimeout,
            }
        }
    };

}