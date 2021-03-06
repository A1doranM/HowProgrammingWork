// Сделан на основе ShemsedinovGraph 2-insert-link-to.js.
// Добавлена возможность устанавливать ребра.

class Vertex { // Вершина графа.
    constructor(graph, data) {
        this.links = new Map(); // Коллекция вершин на которые она ссылается.
        this._graph = graph; // Ссылка на граф.
        this._data = data; // Ссылка на данные.
    }

    link(...args) {
        const distinct = new Set(args); // Для того чтобы ссылки были уникальными, все что нам прислали кладем в Set().
        const {links} = this; // Берем ссылки которые сейчас хранятся внутри вершины
        const {keyField} = this._graph; // Берем ключевое поле это у нас у самого графа есть одно из полей по которому мы
                                       // будем идентифицировать вершины. И это поле будет браться из объектов и при
                                       // помощи этого поля мы будем обращаться к вершинам.
        for (const item of distinct) { // Проходимся по вершинам которые нам передали
            const value = item._data[keyField]; // берем из них значение при помощи keyField
            links.set(value, item); // в свою коллекцию связей устанавливаем значение и вершину к которой оно привязано.
        }
        return this;
    }

    getAdjacentVertices() { // Возвращает коллекцию вершин на которые ссылается текущая вершина.
        return this.links;
    }

    getVertexData() {
        return this._data;
    }
}

class Edge { // Вершина графа.
    constructor(fromVertex, toVertex, edgeData = null) {
        // Ссылка на данные ребра.
        this._fromVertex = fromVertex;
        this._toVertex = toVertex;
        this._edgeData = edgeData;
    }

    get fromVertex() {
        return this._fromVertex;
    }

    set fromVertex(value) {
        this._fromVertex = value;
    }

    get toVertex() {
        return this._toVertex;
    }

    set toVertex(value) {
        this._toVertex = value;
    }

    get edgeData() {
        return this._edgeData;
    }

    set edgeData(value) {
        this._edgeData = value;
    }
}

class EdgedGraph {
    constructor(keyField) { // Устанавливаем ключевое поле по которому граф будет индексироваться
        this.vertices = new Map(); // Список вершин графа.
        this.edges = new Map();
        this._keyField = keyField;
    }

    add(data) {
        const vertex = new Vertex(this, data);
        const key = data[this._keyField];
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

                if(!Array.isArray(destinations) || !Array.isArray(edgesData)) {
                    throw new Error("Vertices to connect and edges data must be arrays!");
                }

                if (destinations.isArray && !destinations.length) {
                    throw new Error("Vertices to connect array can not be null!");
                }

                if (edgesData.length && (edgesData.length !== destinations.length)) {
                    console.log(edgesData.length, destinations.length);
                    throw new Error("Unequal number of vertices and edges data! Edges data must be the same length as vertices, or null.");
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

    get keyField() {
        return this._keyField;
    }

    size() { // Возвращает размер графа.
        return this.vertices.size;
    }

    getAllVertices() {
        return this.vertices;
    }

    getAllEdges() {
        return this.edges;
    }

    setEdge(from, to, edgeData = null) {
        const vertexX = from.getVertexData()[this._keyField];
        const vertexY = to.getVertexData()[this._keyField];
        if (!this.getEdge(from, to)) {
            // Итоговое ребро выглядит примерно так { "Marcus Aurelius"|"Antoninus Pius", первое ребро, второе ребро }.
            this.edges.set(`${vertexX}|${vertexY}`, new Edge(vertexX, vertexY, edgeData));
        }
        return this;
    }

    getEdge(from, to) {
        const vertexX = typeof from === "string" ? from : from.getVertexData()[this._keyField];
        const vertexY = typeof to === "string" ? to : to.getVertexData()[this._keyField];
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
