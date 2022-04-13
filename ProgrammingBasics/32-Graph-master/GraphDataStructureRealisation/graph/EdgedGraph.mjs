// Сделан на основе ShemsedinovGraph 2-insert-link-to.js.
// Добавлена возможность устанавливать ребра.

class Vertex { // Вершина графа.
    constructor(graph, data) {
        this.graph = graph; // Ссылка на граф.
        this.data = data; // Ссылка на данные.
        this.links = new Map(); // Коллекция вершин на которые она ссылается.
        this.weight = 0;
    }

    link(...args) {
        const distinct = new Set(args); // Для того чтобы ссылки были уникальными, все что нам прислали кладем в Set().
        const {links} = this; // Берем ссылки которые сейчас хранятся внутри вершины
        const {keyField} = this.graph; // Берем ключевое поле это у нас у самого графа есть одно из полей по которому мы
                                       // будем идентифицировать вершины. И это поле будет браться из объектов и при
                                       // помощи этого поля мы будем обращаться к вершинам.
        for (const item of distinct) { // Проходимся по вершинам которые нам передали
            const value = item.data[keyField]; // берем из них значение при помощи keyField
            links.set(value, item); // в свою коллекцию связей устанавливаем значение и вершину к которой оно привязано.
        }
        return this;
    }

    getAdjacentVertices() { // Возвращает коллекцию вершин на которые ссылается текущая вершина.
        return this.links;
    }
}

class Edge { // Вершина графа.
    constructor(firstVertex, secondVertex, weight) {
        this.weight = weight; // Ссылка на данные ребра.
        this.firstVertex = firstVertex;
        this.secondVertex = secondVertex;
    }

    getEdge() { // Возвращает ребро.
        return this;
    }
}

class Graph {
    constructor(keyField) { // Устанавливаем ключевое поле по которому граф будет индексироваться
        this.keyField = keyField;
        this.vertices = new Map(); // Список вершин графа.
        this.edges = new Map();
    }

    add(data) {
        const vertex = new Vertex(this, data);
        const key = data[this.keyField];
        if (this.vertices.get(key) === undefined) {
            this.vertices.set(key, vertex);
        }
        return vertex;
    }

    select(query) {
        // TODO: need implementation instead of current dummy implementation.
        const result = this.vertices.get(query);
        return result;
    }

    link(source) {
        const {vertices, edges} = this; // Забираем ссылку на все вершины и ребра.
        const from = vertices.get(source); // забираем линку от которой хотим привязаться.
        return { // Возвращаем объект у которого есть метод to
            to(verticesToConnect, weights = []) { // для привязки к другим линкам.
                const destinations = new Set(verticesToConnect);

                if(weights.length && weights.length !== destinations.size) {
                    throw new Error("Unequal number of vertices and weights! Weights should be the same length as vertices, or null");
                }

                if (from) {
                    for (let i = 0; i < destinations.length; i++) {
                        const target = vertices.get(destinations[i]); // Находим куда пристыковаться
                        const weight = weights.length ? weights[i] : 0;
                        if (target) {
                            from.link(target); // линкуемся к ней.
                            edges.set(`${from[this.keyField]}|${target[this.keyField]}`, new Edge(from, target, weight)); // Сохраняем ребро с весами если они переданы.
                            // Итоговое ребро выглядит примерно так { "Marcus Aurelius"|"Antoninus Pius", первое ребро, второе ребро }
                        }
                    }
                }
            }
        };
    }

    insert(records) { // Сохраняем список вершин в графе.
        for (const record of records) {
            this.add(record);
        }
    }

    size() { // Возвращает размер графа.
        return this.vertices.size;
    }

    getVerticesList() {
        return this.vertices;
    }

    getEdges() {
        return this.edges;
    }
}

export default Graph;

// Example of usage.

const graph = new Graph("name");

graph.insert([
    {name: "Marcus Aurelius", city: "Rome", born: 121, dynasty: "Antonine"},
    {name: "Lucius Verus", city: "Rome", born: 130, dynasty: "Antonine"},
    {name: "Antoninus Pius", city: "Lanuvium", born: 86, dynasty: "Antonine"},
    {name: "Hadrian", city: "Santiponce", born: 76, dynasty: "Nerva–Trajan"},
    {name: "Trajan", city: "Sevilla", born: 98, dynasty: "Nerva–Trajan"},
]);

graph.link("Marcus Aurelius").to(["Lucius Verus"], [3]);
graph.link("Lucius Verus").to(["Trajan", "Marcus Aurelius", "Marcus Aurelius"], [213, 22]);
graph.link("Antoninus Pius").to(["Marcus Aurelius", "Lucius Verus"]);
graph.link("Hadrian").to(["Trajan"], [344]);
graph.link("Trajan").to(["Lucius Verus", "Marcus Aurelius"]);
