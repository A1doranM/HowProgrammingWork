// Сделан на основе ShemsedinovGraph 2-insert-link-to.js.

class Vertex { // Вершина графа.
    constructor(graph, data) {
        this.graph = graph; // Ссылка на граф.
        this.data = data; // Ссылка на данные.
        this.links = new Map(); // Коллекция вершин на которые она ссылается.
        this.weight = 0;
    }

    link(...args) {
        const distinct = new Set(args); // Для того чтобы ссылки были уникальными, все что нам прислали кладем в Set().
        const { links } = this; // Берем ссылки которые сейчас хранятся внутри вершины
        const { keyField } = this.graph; // Берем ключевое поле это у нас у самого графа есть одно из полей по которому мы
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

class Graph {
    constructor(keyField) { // Устанавливаем ключевое поле по которому граф будет индексироваться
        this.keyField = keyField;
        this.vertices = new Map(); // Список вершин графа.
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
        const { vertices } = this; // Забираем ссылку на все вершины
        const from = vertices.get(source); // забираем линку от которой хотим привязаться.
        return { // Возвращаем объект у которого есть метод to
            to(...destinations) { // для привязки к другим линкам.
                if (from) {
                    destinations.forEach(destination => {
                        const target = vertices.get(destination); // Находим куда пристыковаться
                        if (target) from.link(target); // линуемся к ней.
                    });
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
}

export default Graph;

// Example of usage.
//
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
// graph.link("Marcus Aurelius").to("Lucius Verus");
// graph.link("Lucius Verus").to("Trajan", "Marcus Aurelius", "Marcus Aurelius");
// graph.link("Antoninus Pius").to("Marcus Aurelius", "Lucius Verus");
// graph.link("Hadrian").to("Trajan");
// graph.link("Trajan").to("Lucius Verus", "Marcus Aurelius");
