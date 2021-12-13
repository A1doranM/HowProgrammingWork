api.console.log("From application2 global context");

module.exports = () => {
    // Print from the exported function context
    api.timers.setTimeout(() => {
        api.console.log("From application2 exported function");
    }, 5000);
};