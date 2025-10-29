'use strict';

const calculateTotal = (order) => {
  let total = 0;
  for (const groupName in order) {
    const goods = order[groupName];
    total += goods.reduce((sum, { price }) => sum + price, 0);
  }
  return total;
};

const purchase = {
  Electronics: [
    { name: 'Laptop', price: 1500 },
    { name: 'Mouse', price: 25 },
    { name: 'Keyboard', price: 100 },
    { name: 'HDMI cable', price: 10 },
  ],
  Textile: [
    { name: 'Bag', price: 50 },
    { name: 'Mouse pad', price: 5 },
  ],
};

const main = async () => {
  try {
    console.log(purchase);
    const total = calculateTotal(purchase);
    console.log({ total });
  } catch (err) {
    console.error(err);
  }
};

main();
