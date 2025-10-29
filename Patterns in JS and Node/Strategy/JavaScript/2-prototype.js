'use strict';

function Renderer() {}

Renderer.prototype.render = function () {
  console.log('Not implemented');
};

function ConsoleRenderer() {}

ConsoleRenderer.prototype.render = function (data) {
  console.table(data);
};

Object.setPrototypeOf(ConsoleRenderer.prototype, Renderer.prototype);

function WebRenderer() {}

WebRenderer.prototype.render = function (data) {
  const keys = Object.keys(data[0]);
  const line = (row) =>
    '<tr>' + keys.map((key) => `<td>${row[key]}</td>`).join('') + '</tr>';
  const output = [
    '<table><tr>',
    keys.map((key) => `<th>${key}</th>`).join(''),
    '</tr>',
    data.map(line).join(''),
    '</table>',
  ];
  console.log(output.join(''));
};

Object.setPrototypeOf(WebRenderer.prototype, Renderer.prototype);

function MarkdownRenderer() {}

MarkdownRenderer.prototype.render = function (data) {
  const keys = Object.keys(data[0]);
  const line = (row) =>
    '|' + keys.map((key) => `${row[key]}`).join('|') + '|\n';
  const output = [
    '|',
    keys.map((key) => `${key}`).join('|'),
    '|\n',
    '|',
    keys.map(() => '---').join('|'),
    '|\n',
    data.map(line).join(''),
  ];
  console.log(output.join(''));
};

Object.setPrototypeOf(MarkdownRenderer.prototype, Renderer.prototype);

function Context(renderer) {
  this.renderer = renderer;
}

Context.prototype.process = function (data) {
  return this.renderer.render(data);
};

// Usage

const non = new Context(new Renderer());
const con = new Context(new ConsoleRenderer());
const web = new Context(new WebRenderer());
const mkd = new Context(new MarkdownRenderer());

const persons = [
  { name: 'Marcus Aurelius', city: 'Rome', born: 121 },
  { name: 'Victor Glushkov', city: 'Rostov on Don', born: 1923 },
  { name: 'Ibn Arabi', city: 'Murcia', born: 1165 },
  { name: 'Mao Zedong', city: 'Shaoshan', born: 1893 },
  { name: 'Rene Descartes', city: 'La Haye en Touraine', born: 1596 },
];

console.group('Abstract Strategy:');
non.process(persons);
console.groupEnd();

console.group('\nConsoleRenderer:');
con.process(persons);
console.groupEnd();

console.group('\nWebRenderer:');
web.process(persons);
console.groupEnd();

console.group('\nMarkdownRenderer');
mkd.process(persons);
console.groupEnd();
