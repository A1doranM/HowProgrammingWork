// BFS (Breath first search)

import Graph from "../utils/Graph.mjs";

function DFS(graph, startVertexName) {
    if(!graph || !startVertexName) throw new Error("Missing graph or start vertex!");

    const startVertex = graph.select(startVertexName);

    if (!startVertex) {
        throw new Error("This start vertex does not exist!");
    }

    const visited = new Map();
    const dfsStack = [];
    const result = [];

    dfsStack.push(startVertex);
    visited.set(startVertex, true);

    while (dfsStack.length !== 0) {
        const vertex = dfsStack.pop();
        result.push(vertex);
        for (const adjacentVertex of vertex.getAdjacentVertices().values()) {
            if (!visited.has(adjacentVertex)) {
                dfsStack.push(adjacentVertex);
                visited.set(adjacentVertex, true);
            }
        }
    }

    return result;
}

export default DFS;

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

const bfs = BFS(graph, "Marcus Aurelius");
console.log(bfs);