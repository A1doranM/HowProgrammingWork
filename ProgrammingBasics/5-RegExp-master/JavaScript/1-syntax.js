"use strict";

// Docs: https://developer.mozilla.org/en-US/docs/Web
//       /ShemsedinovGraphs/Reference/Global_Objects/RegExp

/*
    .  - single char // Маскирует любой один символ.
    x? - optional or non-greedy // Говорит о том что символ перед ним может либо быть, либо не быть. Но обязательно именно этот символ.
    x+ - 1 or more times // Выражение до + может быть 1, или больше раз.
    x* - 0 or more times
    () - group $1...$9 // Группы от 1 до 9.
    [] - chars // Перечисление символов в определенной позиции.
    {} - фигурные скобки позволяют найти не меньше и не больше кол-ва элементов.
    \x - escape x
    ^x - line begin or negated expr // ^ говорит о том что с этого символа строка должна начинаться.
    x$ - line end // с этого заканчиваться.
    x|y - either x or y // ИЛИ.

    ^ - означает нет.

    /g - искать вхождения регулярного выражения во всей строке.

    Регулярка начинается со / и заканчивается /

    Надо понимать что регулярное выражение медленное, и часто быстрее сделать то что требуется обычными
    методами строк. Но их преимущества в краткости и то что их можно хранить например где-то в конфигах, и потом использовать
    по всему приложению.
*/


const rx1 = /abc/; // Создаем регулярку.
console.log("Do you know abc?".match(rx1)); // Проверяем содержит ли строка выражение abc.

const rx2 = new RegExp("abc"); // Тоже самое.
console.log("Do you know abc?".match(rx2));

const rx3 = /[a-z]+a[a-z]+/g; // [a-z]+ - любая буква от а до z хотя бы 1, затем конкретно буква а, и потом любая буква от а до z хотя бы 1.
const st3 = "A man can die but once"; // Подходят слова man, can.
console.log(st3.match(rx3));

const rx4 = /\sg\w*/g; // \s - различные пробелы. \w - все буквы, цифры и знак подчеркивания(_).
const st4 = "Some are born great, " + // В этой регулярке в начале должен идти любой пробел,
  "some achieve greatness, " + // потом буква g и потом любой символ, цифра и подчеркивание 0 и больше раз.
  "and some have greatness thrust upon them."; // \w \s мелкие не равны \W \S большим.
console.log(st4.match(rx4));

const rx5 = /.u../g; // Найти все что имеет букву u во втором символе.
const st5 = "— Such much? — For whom how";
console.log(st5.match(rx5));

const rx6 = /\w{3,5}/g;
const st6 = "— MGIMO finished? — Ask?!";
console.log(st6.match(rx6));

const rx7 = /[^l] /g; // Ищем любой символ который не l(это из-за того что перед l стоит шляпка) и заканчивается на пробел
const st7 = "Nothing will come of nothing";
console.log(st7.match(rx7));

const rx8 = /^\+?\d{12}$/; // Шляпка в начале и доллар в конце означает что все эта строка должна начинаться с того
const st8 = "+380661234567"; // что идет после шляпки и заканчиваться на знаке доллара доллара.
console.log(st8.match(rx8)); // Проверяем что выражение содержит либо 12 цифр, либо знак + и 12 цифр.

const rx9 = /[0-9]+ (hours|days)/g;
const st9 = "5 days";
console.log(st9.match(rx9));
