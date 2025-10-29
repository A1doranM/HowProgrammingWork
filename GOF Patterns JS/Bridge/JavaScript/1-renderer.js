'use strict';

// Abstract class or Interface

class Renderer {
  constructor() {
    this.output = [];
  }

  header(s) {
    console.dir({ header: [s] });
    throw new Error('Renderer.header is not implemented');
  }

  paragraph(s) {
    console.dir({ paragraph: [s] });
    throw new Error('Renderer.paragraph is not implemented');
  }

  table(array) {
    console.dir({ table: [array] });
    throw new Error('Renderer.table is not implemented');
  }

  toString() {
    return this.output.join('\n');
  }
}

// Multiple implementations

class HtmlRenderer extends Renderer {
  header(s) {
    this.output.push(`<h1>${s}</h1>`);
  }

  paragraph(s) {
    this.output.push(`<p>${s}</p>`);
  }

  table(array) {
    const columns = Object.keys(array[0]);
    const header = columns.map((s) => `<th>${s}</th>`);
    const rows = array.map((obj) =>
      columns.map((col) => {
        const cell = obj[col];
        return `<td>${cell}</td>`;
      }),
    );
    const tr = (cells) => `<tr>${cells.join('')}</tr>`;
    const result = [header].concat(rows).map(tr).join('\n');
    this.output.push(`<table>\n${result}\n</table>`);
  }
}

class MarkdownRenderer extends Renderer {
  header(s) {
    this.output.push(`# ${s}\n`);
  }

  paragraph(s) {
    this.output.push(s + '\n');
  }

  table(array) {
    const columns = Object.keys(array[0]);
    const header = columns.map((s) => `${s}`);
    const separator = columns.map(() => '---');
    const rows = array.map((obj) => columns.map((col) => `${obj[col]}`));
    const tr = (cells) => `${cells.join(' | ')}`;
    const result = [header, separator].concat(rows).map(tr).join(' |\n| ');
    this.output.push('| ' + result + ' |\n');
  }
}

// Abstract Usage

class Document {
  constructor(Renderer) {
    this.renderer = new Renderer();
  }

  generate() {
    throw new Error('Document.generate is not implemented');
  }

  print() {
    const result = this.renderer.toString();
    console.log(result);
  }
}

// Implementations

class Persons extends Document {
  generate({ title, description, list }) {
    this.renderer.header(title);
    this.renderer.paragraph(description);
    this.renderer.table(list);
  }
}

class Letter extends Document {
  generate({ from, to, subject, content }) {
    this.renderer.header(`Subject: ${subject}`);
    this.renderer.paragraph(`From: ${from}`);
    this.renderer.paragraph(`To: ${to}`);
    this.renderer.paragraph('Hello');
    this.renderer.paragraph(content);
    this.renderer.paragraph('Best regards');
  }
}

// Usage example 1

const persons = new Persons(MarkdownRenderer);
persons.generate({
  title: 'Great Thinkers',
  description: 'Here is a list of the greatest thinkers of mankind',
  list: [
    { name: 'Marcus Aurelius', city: 'Rome', born: 121 },
    { name: 'Victor Glushkov', city: 'Rostov on Don', born: 1923 },
    { name: 'Ibn Arabi', city: 'Murcia', born: 1165 },
    { name: 'Mao Zedong', city: 'Shaoshan', born: 1893 },
    { name: 'Rene Descartes', city: 'La Haye en Touraine', born: 1596 },
  ],
});
persons.print();

// Usage example 2

const letter = new Letter(HtmlRenderer);
letter.generate({
  from: 'Marcus Aurelius',
  to: 'Rene Descartes',
  subject: 'Meditations: Book 2',
  content: `When you wake up in the morning, tell yourself:
    The people I deal with today will be meddling, ungrateful,
    arrogant, dishonest, jealous, and surly. They are like this
    because they can’t tell good from evil.`,
});
letter.print();
