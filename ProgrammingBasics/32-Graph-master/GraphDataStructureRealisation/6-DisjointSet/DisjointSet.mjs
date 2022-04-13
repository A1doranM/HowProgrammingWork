// Detect Cycles in graph using DisjointSet.

import Graph from "../graph/Graph.mjs";

function isCyclePresent(graph) {
    if(!graph) throw new Error("Missing graph!");

    const result = false;
    //TODO: Need implementation

    return result;
}

export default isCyclePresent;

// Example of usage.

const graph = new Graph("name");

graph.insert([
    { name: "Marcus Aurelius", city: "Rome", born: 121, dynasty: "Antonine" },
    { name: "Lucius Verus", city: "Rome", born: 130, dynasty: "Antonine" },
    { name: "Antoninus Pius", city: "Lanuvium", born: 86, dynasty: "Antonine" },
    { name: "Hadrian", city: "Santiponce", born: 76, dynasty: "Nerva–Trajan" },
    { name: "Trajan", city: "Sevilla", born: 98, dynasty: "Nerva–Trajan" },
]);

graph.link("Marcus Aurelius").to("Lucius Verus", "Antoninus Pius");
graph.link("Lucius Verus").to("Trajan", "Marcus Aurelius", "Marcus Aurelius");
graph.link("Antoninus Pius").to("Marcus Aurelius", "Lucius Verus");
graph.link("Hadrian").to("Trajan");
graph.link("Trajan").to("Lucius Verus", "Marcus Aurelius", "Hadrian");

const isCycledGraph = isCyclePresent(graph, "Marcus Aurelius");
console.log(isCycledGraph);