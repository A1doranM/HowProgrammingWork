"use strict";

// Другая абстракция AsyncResource

// The class AsyncResource is designed to be extended by the embedder's async
// resources. Using this, users can easily trigger the lifetime events of their
// own resources.

// runInAsyncScope()

// Call the provided function with the provided arguments in the execution
// context of the async resource. This will establish the context, trigger
// the AsyncHooks before callbacks, call the function, trigger the AsyncHooks
// after callbacks, and then restore the original execution context.

const { AsyncResource, executionAsyncId } = require("node:async_hooks");

const resource1 = new AsyncResource("name");
const resource2 = new AsyncResource("name");

console.log({ resource1 });
console.log({ resource2 });

const fn = () => {
  const id = executionAsyncId();
  console.log({ id });
};

fn();
resource1.runInAsyncScope(fn);
resource2.runInAsyncScope(fn);
fn();
