// Detect Cycles in graph using DisjointSet.

import EdgedGraph from "../graph/EdgedGraph.mjs";

function findMST(graph) {
    if (!graph) throw new Error("Missing graph!");



    return result;
}

export default findMST;

// Example of usage.

const graph = new EdgedGraph("name");

graph.insert([
    {name: "Marcus Aurelius", city: "Rome", born: 121, dynasty: "Antonine"},
    {name: "Lucius Verus", city: "Rome", born: 130, dynasty: "Antonine"},
    {name: "Antoninus Pius", city: "Lanuvium", born: 86, dynasty: "Antonine"},
    {name: "Hadrian", city: "Santiponce", born: 76, dynasty: "Nerva–Trajan"},
    {name: "Trajan", city: "Sevilla", born: 98, dynasty: "Nerva–Trajan"},
]);

graph.link("Marcus Aurelius").to(["Lucius Verus"]);
graph.link("Lucius Verus").to(["Antoninus Pius"]);
graph.link("Antoninus Pius").to(["Marcus Aurelius", "Hadrian"]);
graph.link("Hadrian").to(["Trajan"]);

console.log()

const isCycledGraph = findMST(graph, "Marcus Aurelius");
console.log(isCycledGraph);