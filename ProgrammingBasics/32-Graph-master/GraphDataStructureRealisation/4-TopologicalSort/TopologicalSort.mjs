import Graph from "../graph/Graph.mjs";

class TopologicalSort {

    // Time Сomplexity O(V+E)
    // Auxiliary Space: O(V).

    static KahnSort(graph, startVertexName) {
        if(!graph || !startVertexName) throw new Error("Missing graph or start vertex!");

        const startVertex = graph.select(startVertexName);

        if (!startVertex) {
            throw new Error("Vertex with such name does not exist!");
        }

        const result = [];
        const indegree = new Map();
        const queue = new Array(graph.size());

        function findIndegree () {
            let indegree = 0;
            for(let i = 0; i < graph.size(); i++) {

            }

            return indegree;
        }

        while (queue.length !== 0) {

        }

        return result;
    }

    static mDFSSort(graph) {
        const visited = new Map();
        const sortedNodes = [];

        function DFS(graph, startNode, visited, sortedNodes){
            const startVertex = graph.select(startNode);
            const dfsStack = [];

            dfsStack.push(startVertex);
            visited.set(startVertex, true);
            while (dfsStack.length !== 0) {
                const vertex = dfsStack.pop();
                for (const adjacentVertex of vertex.getAdjacentVertices().values()) {
                    if (!visited.has(adjacentVertex)) {
                        dfsStack.push(adjacentVertex);
                        visited.set(adjacentVertex, true);
                    }
                }
            }
            sortedNodes.unshift(startNode);
        }

        for (const vertex of graph.getVerticesList().keys()) {
            if (!visited.has(vertex)) {
                DFS(graph, vertex[graph.keyField], visited, sortedNodes);
            }
        }

        return sortedNodes;
    }
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

const bfs = TopologicalSort.mDFSSort(graph, "Marcus Aurelius");

export default TopologicalSort;

