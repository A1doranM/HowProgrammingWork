'use strict';

const rome = { name: 'Rome' };

const marcus = {
  id: 1,
  name: 'Marcus',
  city: rome,
  email: 'marcus@metarhia.com',
};
marcus.name = 'Marcus Aurelius';

const lucius = Object.assign({}, marcus, { name: 'Lucius Verus' });
lucius.email = 'lucius@metarhia.com';

console.log({ marcus, lucius });
