// Finding Single Source Shortest Path with help of Bellman Ford Algorithm

// Find Minimum Spanning Tree using Kruskal Algorithm.
// Complexity: O(E logE);

import EdgedGraph from "../graph/EdgedGraph.mjs";

function findSingleSourceShortestPath(graph) {
    if (!graph) throw new Error("Missing graph!");



    return result;
}

export default findSingleSourceShortestPath;

// Example of usage.

const graph = new EdgedGraph("name");

graph.insert([
    {name: "Marcus Aurelius", city: "Rome", born: 121, dynasty: "Antonine"},
    {name: "Lucius Verus", city: "Rome", born: 130, dynasty: "Antonine"},
    {name: "Antoninus Pius", city: "Lanuvium", born: 86, dynasty: "Antonine"},
    {name: "Hadrian", city: "Santiponce", born: 76, dynasty: "Nerva–Trajan"},
    {name: "Trajan", city: "Sevilla", born: 98, dynasty: "Nerva–Trajan"},
]);

graph.link("Marcus Aurelius").to(["Lucius Verus", "Antoninus Pius", "Hadrian", "Trajan"], [1, 2, 3, 4]);
graph.link("Lucius Verus").to(["Antoninus Pius", "Hadrian"], [5, 6]);
graph.link("Antoninus Pius").to(["Hadrian", "Trajan"], [7, 7]);
graph.link("Hadrian").to(["Trajan"], [1]);

console.log()

const SingleSourceShortestPath = findSingleSourceShortestPath(graph);
console.log(graph);
console.log(SingleSourceShortestPath);