'use strict';

class QueryBuilder {
  constructor(table) {
    this.options = { table, fields: ['*'], where: {} };
  }

  where(conditions) {
    Object.assign(this.options.where, conditions);
    return this;
  }

  order(field) {
    this.options.order = field;
    return this;
  }

  limit(count) {
    this.options.limit = count;
    return this;
  }

  then(resolve) {
    const { table, fields, where, limit, order } = this.options;
    const cond = Object.entries(where)
      .map((e) => e.join('='))
      .join(' AND ');
    const sql = `SELECT ${fields} FROM ${table} WHERE ${cond}`;
    const opt = `ORDER BY ${order} LIMIT ${limit}`;
    const query = sql + ' ' + opt;
    resolve(query);
  }
}

const queryDirector = (table, { conditions, order, limit }) => {
  const query = new QueryBuilder(table);
  if (conditions) query.where(conditions);
  if (order) query.order(order);
  if (limit) query.limit(limit);
  return query;
};

// Usage

const main = async () => {
  const query = await queryDirector('cities', {
    conditions: { country: 10, type: 1 },
    order: 'population',
    limit: 10,
  });
  console.log(query);
};

main();
