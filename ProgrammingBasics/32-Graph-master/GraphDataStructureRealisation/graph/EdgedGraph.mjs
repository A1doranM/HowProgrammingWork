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
    constructor(fromVertex, toVertex, edgeData) {
        // Ссылка на данные ребра.
        this.fromVertex = fromVertex;
        this.toVertex = toVertex;
        this.edgeData = edgeData;
    }
}

class EdgedGraph {
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
        const {vertices} = this; // Забираем ссылку на все вершины и ребра.
        const from = vertices.get(source); // забираем линку от которой хотим привязаться
        const setEdge = this.setEdge.bind(this); // привяжем контекс чтобы отдать метод в объект с методом to.
        return { // Возвращаем объект у которого есть метод to
            to(verticesToConnect, edgesData = []) { // для привязки к другим линкам.
                const destinations = [...new Set(verticesToConnect)];

                if (edgesData.length && (edgesData.length !== destinations.size)) {
                    throw new Error("Unequal number of vertices and Edge data! Edge data must be the same length as vertices, or null");
                }

                if (from) {
                    for (let i = 0; i < destinations.length; i++) {
                        const target = vertices.get(destinations[i]); // Находим куда пристыковаться
                        const edgeData = edgesData.length ? edgesData[i] : null;
                        if (target) {
                            from.link(target); // линкуемся к ней.
                            setEdge(from, target, edgeData); // Сохраняем ребро с данными если они переданы.
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

    getAllEdges() {
        return this.edges;
    }

    setEdge(from, to, edgeData = null) {
        const vertexX = from.data[this.keyField];
        const vertexY = to.data[this.keyField];
        if (!this.getEdge(from, to)) {
            // Итоговое ребро выглядит примерно так { "Marcus Aurelius"|"Antoninus Pius", первое ребро, второе ребро }.
            this.edges.set(`${vertexX}|${vertexY}`, new Edge(vertexX, vertexY, edgeData));
        }
        return this;
    }

    getEdge(from, to) {
        const vertexX = from.data[this.keyField];
        const vertexY = to.data[this.keyField];
        return this.edges.get(`${vertexX}|${vertexY}`);
    }
}

export default EdgedGraph;

// Example of usage.

// const graph = new EdgedGraph("name");
//
// graph.insert([
//     {name: "Marcus Aurelius", city: "Rome", born: 121, dynasty: "Antonine"},
//     {name: "Lucius Verus", city: "Rome", born: 130, dynasty: "Antonine"},
//     {name: "Antoninus Pius", city: "Lanuvium", born: 86, dynasty: "Antonine"},
//     {name: "Hadrian", city: "Santiponce", born: 76, dynasty: "Nerva–Trajan"},
//     {name: "Trajan", city: "Sevilla", born: 98, dynasty: "Nerva–Trajan"},
// ]);
//
// graph.link("Marcus Aurelius").to(["Lucius Verus"], [3]);
// graph.link("Lucius Verus").to(["Trajan", "Marcus Aurelius", "Marcus Aurelius"], [213, 22]);
// graph.link("Antoninus Pius").to(["Marcus Aurelius", "Lucius Verus"]);
// graph.link("Hadrian").to(["Trajan"], [344]);
// graph.link("Trajan").to(["Lucius Verus", "Marcus Aurelius"]);
