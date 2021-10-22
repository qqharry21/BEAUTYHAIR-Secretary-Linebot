/** @format */

var mysql2 = require('mysql2');

const db = mysql2.createConnection({
  user: 'b4fc5f71b5dd95',
  host: 'us-cdbr-east-04.cleardb.com',
  password: '7ead9883',
  database: 'heroku_7a65dc3b032abd6',
  multipleStatements: true,
});

const pool = mysql2.createPool({
  user: 'b4fc5f71b5dd95',
  host: 'us-cdbr-east-04.cleardb.com',
  password: '7ead9883',
  database: 'heroku_7a65dc3b032abd6',
  multipleStatements: true,
});

var query = function (sql, options, callback) {
  console.log(sql, options, callback);
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }
  pool.getConnection(function (err, conn) {
    if (err) {
      callback(err, null, null);
    } else {
      conn.query(sql, options, function (err, results, fields) {
        // callback
        callback(err, results, fields);
      });
      // release connection。
      // 要注意的是，connection 的釋放需要在此 release，而不能在 callback 中 release
      conn.release();
    }
  });
};

mysql: module.exports = db;
module.exports = query;
