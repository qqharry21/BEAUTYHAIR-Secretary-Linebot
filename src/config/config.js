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

// CREATE TABLE `order` (
//   `id` int NOT NULL AUTO_INCREMENT,
//   `name` varchar(45) NOT NULL,
//   `date` date NOT NULL,
//   `time` varchar(45) NOT NULL,
//   `endTime` varchar(45) DEFAULT NULL,
//   `subject` varchar(45) DEFAULT NULL,
//   `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
//   `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//   PRIMARY KEY (`id`)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3
