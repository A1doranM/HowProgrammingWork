import Graph from "../utils/Graph.mjs";

class TopologicalSort {
    static KahnSort(graph, startVertexName) {
        if(!graph || !startVertexName) throw new Error("Missing graph or start vertex!");

        const startVertex = graph.select(startVertexName);

        if (!startVertex) {
            throw new Error("Vertex with such name does not exist!");
        }
    }

    static mDFSSort(graph, startVertexName) {
        if(!graph || !startVertexName) throw new Error("Missing graph or start vertex!");

        const startVertex = graph.select(startVertexName);

        if (!startVertex) {
            throw new Error("Vertex with such name does not exist!");
        }
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

const bfs = TopologicalSort.KahnSort(graph, "Marcus Aurelius");

export default TopologicalSort;

