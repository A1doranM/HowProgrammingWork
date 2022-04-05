// Tarjan Algorithm

import Graph from "../graph/Graph.mjs";

function FindArticulationPoints(graph, startVertexName) {
    if (!graph || !startVertexName) throw new Error("Missing graph or start vertex!");

    const startVertex = graph.select(startVertexName);

    if (!startVertex) {
        throw new Error("Vertex with such name does not exist!");
    }

    const result = [];
    const visited = new Map();
    const discoveredTime = new Map();
    const lowTime = new Map();
    const parents = new Map();
    let time = 0;

    function TarjanAlgo(graph, discoveredTime, lowTime, visited, parents, result, vertex) {
        visited.set(vertex, true);
        lowTime.set(vertex, time + 1);
        discoveredTime.set(vertex, time + 1);
        let child = 0;
        for (const adjacentVertex of vertex.getAdjacentVertices().values()) {
            if (!visited.has(adjacentVertex)) {
                child++;
                parents.set(adjacentVertex, vertex);
                TarjanAlgo(graph, discoveredTime, lowTime, visited, parents, result, adjacentVertex);
                lowTime.set(vertex,
                    Math.min(lowTime.get(vertex), discoveredTime.get(adjacentVertex))
                );
                if ((parents.get(vertex) === undefined) && (child > 1)) {
                    result.push(vertex);
                }
                if ((parents.get(vertex) !== undefined) && (lowTime.get(adjacentVertex) >= discoveredTime.get(vertex))) {
                    result.push(vertex);
                }
            } else if (adjacentVertex !== parents.get(vertex)) {
                lowTime.set(vertex,
                    Math.min(lowTime.get(vertex), discoveredTime.get(adjacentVertex))
                );
            }
        }
    }

    TarjanAlgo(graph, discoveredTime, lowTime, visited, parents, result, startVertex);

    return result;
}

export default FindArticulationPoints;

// Example of usage.

const graph = new Graph("name");

graph.insert([
    {name: "Marcus Aurelius", city: "Rome", born: 121, dynasty: "Antonine"},
    {name: "Lucius Verus", city: "Rome", born: 130, dynasty: "Antonine"},
    {name: "Antoninus Pius", city: "Lanuvium", born: 86, dynasty: "Antonine"},
    {name: "Hadrian", city: "Santiponce", born: 76, dynasty: "Nerva–Trajan"},
    {name: "Trajan", city: "Sevilla", born: 98, dynasty: "Nerva–Trajan"},
]);

graph.link("Marcus Aurelius").to("Lucius Verus", "Antoninus Pius");
graph.link("Lucius Verus").to("Trajan", "Marcus Aurelius", "Marcus Aurelius");
graph.link("Antoninus Pius").to("Marcus Aurelius", "Lucius Verus");
graph.link("Hadrian").to("Trajan");
graph.link("Trajan").to("Lucius Verus", "Marcus Aurelius", "Hadrian");

const articulationPoints = FindArticulationPoints(graph, "Marcus Aurelius");
console.log(articulationPoints);