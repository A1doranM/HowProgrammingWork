// Find Minimum Spanning Tree using Kruskal Algorithm and Prims Algorithm.

import EdgedGraph from "../graph/EdgedGraph.mjs";

class FindMinimumSpanningTree {
    // Complexity: O(E logE);
    static KruskalAlg(graph) {
        if (!graph) throw new Error("Missing graph!");

        const parents = new Map();
        const ranks = new Map();

        const result = new EdgedGraph(graph.keyField);

        for (const vertex of graph.getAllVertices().values()) {
            result.add(vertex.getVertexData());
        }

        function _setParentsAndRanks() {
            for (const vertex of graph.getAllVertices().keys()) {
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

    // Time complexity O(E logV)
    static PrimAlg(graph, startVertexName) {
        if (!graph || !startVertexName) throw new Error("Missing graph or start vertex!");

        const startVertex = graph.select(startVertexName);

        if (!startVertex) {
            throw new Error("Vertex with such name does not exist!");
        }

        const parent = new Map();
        const key = new Map();
        const inMST = new Map();
        const priorityQueue = [];
        const result = new EdgedGraph(graph.keyField);

        const addToPriorityQueue = (weight, elem) => {
            priorityQueue.push({
                weight: weight,
                vertexName: elem
            });
            priorityQueue.sort((a, b) => {
                return (a.weight > b.weight);
            });
        }

        addToPriorityQueue(0, startVertex.getVertexData()[graph.keyField]);

        for (const edge of graph.getAllEdges().values()) {
            inMST.set(edge.fromVertex, false);
            inMST.set(edge.toVertex, false);
            key.set(edge.fromVertex, Number.MAX_SAFE_INTEGER);
            key.set(edge.toVertex, Number.MAX_SAFE_INTEGER);
        }

        key.set(startVertex.getVertexData()[graph.keyField], 0);

        while (priorityQueue.length) {
            const currVertex = priorityQueue.shift().vertexName;

            if (parent.get(currVertex) && (inMST.get(currVertex) === false)) {
                const from = graph.select(parent.get(currVertex));
                const to = graph.select(currVertex);
                const fromData = from.getVertexData();
                const toData = to.getVertexData();
                const edgeData = graph.getEdge(from, to).edgeData;

                result.add(fromData);
                result.add(toData);
                result.link(fromData[result.keyField]).to([toData[result.keyField]], [edgeData]);
            }

            inMST.set(currVertex, true);

            for (const adjacentVertex of graph.select(currVertex).getAdjacentVertices().keys()) {
                const edge = graph.getEdge(currVertex, adjacentVertex);
                const av = edge.toVertex;
                const weight = edge.edgeData;

                if ((inMST.get(av) === false) && (key.get(av) > weight)) {
                    parent.set(av, currVertex);
                    key.set(av, weight);
                    addToPriorityQueue(weight, av);
                }
            }
        }

        return result;
    }

}

export default FindMinimumSpanningTree;

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

const minimumSpanningTreeKruskal = FindMinimumSpanningTree.KruskalAlg(graph);
const minimumSpanningTreePrim = FindMinimumSpanningTree.PrimAlg(graph, "Marcus Aurelius");
// console.log(graph);
console.log(minimumSpanningTreeKruskal, minimumSpanningTreePrim);