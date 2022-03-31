import Graph from "../graph/Graph.mjs";

function Dijkstra(graph, startVertexName) {
    if(!graph || !startVertexName) throw new Error("Missing graph or start vertex!");

    const startVertex = graph.select(startVertexName);

    if (!startVertex) {
        throw new Error("Vertex with such name does not exist!");
    }

    const weightToVertex = [];
    const result = new Map();

    for(const vertex of graph.getVerticesList().values()) {
        result.set(vertex, Number.MAX_SAFE_INTEGER);
    }

    weightToVertex.push({weight: 0, vertex: startVertex});
    result.set(startVertex, 0);
    //priorityQueue.set(startVertex, 0)

    while(weightToVertex.size !== 0){
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

    console.log(weightToVertex);

    return result;
}

// const graph = new Graph("name");
//
// graph.insert([
//     { name: "Marcus Aurelius", city: "Rome", born: 121, dynasty: "Antonine" },
//     { name: "Lucius Verus", city: "Rome", born: 130, dynasty: "Antonine" },
//     { name: "Antoninus Pius", city: "Lanuvium", born: 86, dynasty: "Antonine" },
//     { name: "Hadrian", city: "Santiponce", born: 76, dynasty: "Nerva–Trajan" },
//     { name: "Trajan", city: "Sevilla", born: 98, dynasty: "Nerva–Trajan" },
// ]);
//
// graph.link("Marcus Aurelius").to("Lucius Verus", "Antoninus Pius");
// graph.link("Lucius Verus").to("Trajan", "Marcus Aurelius", "Marcus Aurelius");
// graph.link("Antoninus Pius").to("Marcus Aurelius", "Lucius Verus");
// graph.link("Hadrian").to("Trajan");
// graph.link("Trajan").to("Lucius Verus", "Marcus Aurelius", "Hadrian");

const bfs = Dijkstra(graph, "Marcus Aurelius");

export default Dijkstra;