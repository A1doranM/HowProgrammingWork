// Detect Cycles in graph using DisjointSet.

import EdgedGraph from "../graph/EdgedGraph.mjs";

function isCyclePresent(graph) {
    if (!graph) throw new Error("Missing graph!");

    const parents = new Map();
    const ranks = new Map();

    let result = false;

    function _setParentsAndRanks() {
        for (const vertex of graph.getVerticesList().values()) {
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

    function _detectCycle() {
        _setParentsAndRanks();

        for (const edge of graph.getAllEdges().values()) {
            const vertexX = _find(edge.fromVertex, parents);
            const vertexY = _find(edge.toVertex, parents);
            console.log("Cur Vertices: ", vertexX, vertexY);
            if (vertexX === vertexY) {
                result = true;
            } else {
                _unionSet(vertexX, vertexY);
            }
        }
    }

    _detectCycle();

    return result;
}

export default isCyclePresent;

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

const isCycledGraph = isCyclePresent(graph, "Marcus Aurelius");
console.log(isCycledGraph);