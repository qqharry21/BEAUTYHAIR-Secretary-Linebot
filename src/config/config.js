/** @format */

var mysql2 = require('mysql2');

const db = mysql2.createConnection({
  user: 'b4fc5f71b5dd95',
  host: 'us-cdbr-east-04.cleardb.com',
  password: '7ead9883',
  database: 'heroku_7a65dc3b032abd6',
  multipleStatements: true,
});

mysql: module.exports = db;
