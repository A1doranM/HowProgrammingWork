"use strict";

module.exports = async (name) => new Promise((resolve, reject) => {
  const sql = `SELECT * FROM SystemUser WHERE Login = "${name}"`;
  db.query(sql, (err, data) => {
    if (err) {
      reject(err);
      return;
    }
    console.table(data.fields);
    console.table(data.rows);
    resolve(data);
  });
});
