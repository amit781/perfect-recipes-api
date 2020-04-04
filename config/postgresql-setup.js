const knex = require('knex');
// const keys = require('./keys');

// connect to postgresql
const db = knex({
  client: 'pg',
  connection: {
    connectionString : process.env.DATABASE_URL,
    ssl: true
  }
});

module.exports = { db: db }
