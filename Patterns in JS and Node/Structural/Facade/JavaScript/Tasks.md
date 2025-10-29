# Facade tasks

1. Analize `1-prototype.js` and improve to be compatible with frontend and backend (node.js)
2. Make implementation from `2-class.js` compatible with Map interface and prepare .d.ts
3. Improve implementation in `3-function.js` to be mix-ins free and better optimized for V8. Hint: return object literal from `timeoutCollection`
4. Rewrite `3-function.js` to avoid setTimeout and use collection of expitation time instead
5. Fix eslint warning for `4-scheduler.js` with message `Expected this to be used by class method log`, adding constructor for `Logger` class to pass instance of `Console`, pass mentioned instance to `new Scheduler({ options: { output: Console } })`
6. Remove `Task` constructor: remove if statement and use either two methods or two subclasses as well for `Scheduler` method `task`
