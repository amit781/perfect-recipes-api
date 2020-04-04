const knex = require('knex');
const keys = require('./keys');

// connect to postgresql
const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : keys.postgresql.user,
    password : keys.postgresql.password,
    database : 'recipes'
  }
});

module.exports = { db: db }
