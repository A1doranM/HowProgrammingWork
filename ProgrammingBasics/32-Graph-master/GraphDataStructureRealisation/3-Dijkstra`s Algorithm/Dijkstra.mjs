// Find Single Source Shortest Path using Bellman-Ford Algorithm
// or Dijkstra Algorithm.

import EdgedGraph from "../graph/EdgedGraph.mjs";

export class SingleSourceShortestPath {
    static BellmanFord(graph, startVertexName) {
        if (!graph || !startVertexName) throw new Error("Missing graph or start vertex!");

        const startVertex = graph.select(startVertexName);

        if (!startVertex) {
            throw new Error("Vertex with such name does not exist!");
        }

        const distances = new Map();
        const result = new Map();

        for (const edge of graph.getAllEdges().values()) {
            distances.set(edge.fromVertex, Number.MAX_SAFE_INTEGER);
            distances.set(edge.toVertex, Number.MAX_SAFE_INTEGER);
        }

        for (let i = 0; i < distances.size - 1; i++) {
            for (const edge of graph.getAllEdges().values()) {
                const distanceFrom = distances.get(edge.fromVertex);
                const distanceTo = distances.get(edge.toVertex) + edge.edgeData;
                if (distanceFrom > distanceTo) {
                    distances.set(edge.fromVertex, distanceTo);
                }
            }
        }

        return result;
    }

    static Dijkstra(graph, startVertexName) {
        if (!graph || !startVertexName) throw new Error("Missing graph or start vertex!");

        const startVertex = graph.select(startVertexName);

        if (!startVertex) {
            throw new Error("Vertex with such name does not exist!");
        }

        const weightToVertex = [];
        const result = new Map();

        for (const vertex of graph.getAllVertices().values()) {
            result.set(vertex, Number.MAX_SAFE_INTEGER);
        }

        weightToVertex.push({weight: 0, vertex: startVertex});
        result.set(startVertex, 0);
        //priorityQueue.set(startVertex, 0)

        while (weightToVertex.size !== 0) {
            const currentVertex = weightToVertex.pop();

            for (const adjacentVertex of currentVertex.getAdjacentVertices().values()) {
                const weightFromParentToAdjacent = 0 + adjacentVertex.weight;
                if (weightFromParentToAdjacent < result.get(adjacentVertex)) {
                    result.set(adjacentVertex, weightFromParentToAdjacent);
                    weightToVertex.push({weight: weightFromParentToAdjacent, vertex: adjacentVertex});
                }
            }
            weightToVertex.sort((weightA, weightB) => (weightA - weightB));
        }

        return result;
    }
}

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

const bfs = SingleSourceShortestPath.BellmanFord(graph, "Marcus Aurelius");
