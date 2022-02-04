"use strict";

function userFactory1(name, group, email) {
  return { name, group, email };
}

const userFactory2 = (name, group, email) => ({
  name, group, email
});

const userFactory3 = (name, group, email) => {
  name, group, email
};

const userFactory4 = (name, group, email) => (
  name, group, email
);

const user1 = userFactory1("marcus", "emperors", "marcus@spqr.it");
console.log(user1);

const user2 = userFactory2("marcus", "emperors", "marcus@spqr.it");
console.log(user2);

const user3 = userFactory3("marcus", "emperors", "marcus@spqr.it");
console.log(user3);
// Explain: why undefined

const user4 = userFactory4("marcus", "emperors", "marcus@spqr.it");
console.log(user4);
// Explain: why "marcus@spqr.it"
