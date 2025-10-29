# Strategy tasks

1. Extract strategy selection mashinery from `3-function.js` to reuse it for any strategy of certain format:
  - Implement `selectStrategy(strategy, name)` returning function
  - Reading certain behaviour from `strategy` collection do not use technique like this `renderers[rendererName] || renderers.abstract`
  - Try to get `strategy` collection keys and check required key; in collection contains no key use `abstract` instead
2. Rewrite example from `3-function.js` to decouple strategy implementation and `console`
  - Resurn `string` from all strategy implementations
  - Here is an example: `console.log(png(persons))`
3. Make high level abstraction from `5-agent.js`:
  - Now we have `registerAgent(name, behaviour)` and `getAgent(name, action)`
  - Create `Strategy` class:
    - `constructor(strategyName: string, actions: Array<string>)`
    - `registerBehaviour(implementationName, behaviour)`
    - `getBehaviour(implementationName, actionName)`
4. Prepare ESM or CJS module for `Strategy`
  - Add .d.ts typings
  - Add tests and cases
5. Rewrite strategy from classes to just module exporting interface:
  - `createStrategy(strategyName: string, actions: Array<string>)`
  - `createStrategy` will return `{ registerBehaviour, getBehaviour }` without class syntax
  - Module contains a collection of strategies
  - Strategy (closure) contains a collection of `implementations`
  - Implementations (struct) contains a collection of `actions`
