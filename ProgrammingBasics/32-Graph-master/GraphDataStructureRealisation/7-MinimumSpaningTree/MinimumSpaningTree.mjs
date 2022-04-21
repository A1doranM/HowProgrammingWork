// Find Minimum Spanning Tree using Kruskal Algorithm.
// Complexity: O(E logE);

import EdgedGraph from "../graph/EdgedGraph.mjs";

function findMST(graph) {
    if (!graph) throw new Error("Missing graph!");

    const parents = new Map();
    const ranks = new Map();

    const result = new EdgedGraph(graph.keyField);

    for (const vertex of graph.getVerticesList().values()) {
        result.add(vertex.getVertexData());
    }

    function _setParentsAndRanks() {
        for (const vertex of graph.getVerticesList().keys()) {
            parents.set(vertex, vertex);
            ranks.set(vertex, 0);
        }
    }

    function _find(vertex, parents) {
        if (vertex !== parents.get(vertex)) {
            parents.set(vertex, _find(parents.get(vertex), parents));
        }

        return parents.get(vertex);
    }

    // Complexity of unionFind O(E logV)
    function _unionSet(firstVertex, secondVertex) {
        const vertexX = _find(firstVertex, parents);
        const vertexY = _find(secondVertex, parents);
        const vertexXrank = ranks.get(vertexX);
        const vertexYrank = ranks.get(vertexY);
        if (vertexX === vertexY) {
            return;
        }
        if (vertexXrank > vertexYrank) {
            parents.set(vertexY, vertexX);
        } else {
            parents.set(vertexX, vertexY);
            if (vertexXrank === vertexYrank) {
                ranks.set(vertexY, vertexYrank + 1);
            }
        }
    }

    function _kruskalAlg() {
        _setParentsAndRanks();

        for (const edge of graph.getAllEdges().values()) {
            if (_find(edge.fromVertex, parents) !== _find(edge.toVertex, parents)) {
                console.log(edge.toVertex, [edge.edgeData]);
                result.link(edge.fromVertex).to([edge.toVertex], [edge.edgeData]);
                _unionSet(edge.fromVertex, edge.toVertex);
            }
        }
    }

    _kruskalAlg();

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

graph.link("Marcus Aurelius").to(["Lucius Verus", "Antoninus Pius", "Hadrian", "Trajan"], [1, 2, 3, 4]);
graph.link("Lucius Verus").to(["Antoninus Pius", "Hadrian"], [5, 6]);
graph.link("Antoninus Pius").to(["Hadrian", "Trajan"], [7, 7]);
graph.link("Hadrian").to(["Trajan"], [1]);

console.log()

const minimumSpanningTree = findMST(graph);
console.log(graph);
console.log(minimumSpanningTree);