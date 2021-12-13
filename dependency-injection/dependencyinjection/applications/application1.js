api.console.log("From application1 global context");

module.exports = () => {
    // Print from the exported function context

    api.fs.readFile("../../README.md", (err, data) => {
        if (err) {
            api.console.log(err.message);
            return;
        }
        api.console.log(data.toString());
    });

    api.timers.setTimeout(() => {
        api.console.log("From application1 exported function");
    }, 5000);
};