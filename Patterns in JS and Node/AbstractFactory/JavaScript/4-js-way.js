'use strict';

const dataAccessStrategies = {
  fs: require('./4-fs.js'),
  pg: require('./4-pg.js'),
  minio: require('./4-minio.js'),
};

// Usage

const main = async () => {
  const dal = dataAccessStrategies['fs'];
  const db = dal.createDatabase('./storage.dat');
  const cursor = db.select({ city: 'Roma' });
  for await (const record of cursor) {
    console.dir(record);
  }
};

main();
