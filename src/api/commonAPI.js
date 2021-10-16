/** @format */
const db = require('../config/config');
function checkIsTimeConflict(time) {
  const sqlSelect =
    'SELECT `id`, `name`, `date`, `time`, `endTime`, `subject` FROM `order` WHERE `name` = ? ORDER BY ABS( DATEDIFF( `date`, NOW() ) ) ,`create_time` DESC';
}

/** 向資料庫抓取所有相關預約
 * @description 向DB索取資料
 * @return 抓取到的資料/false
 */
function fetchModifyList(text) {
  const sqlSelect =
    'SELECT `id`, `name`, `date`, `time`, `endTime`, `subject` FROM `order` WHERE `name` = ? ORDER BY ABS( DATEDIFF( `date`, NOW() ) ) ,`create_time` DESC';
  db.query(sqlSelect, [text], (err, result) => {
    if (result) {
      return result;
    } else {
      console.log('fetch error', err);
      return false;
    }
  });
}

function insertBookData(name, date, time, endTime, subject) {
  const sqlSelect =
    'INSERT INTO `order` (`name`, `date`, `time`, `endTime`, `subject`) VALUES (?, ?, ?, ?, ?)';
  db.query(sqlSelect, [name, date, time, endTime, subject], (err, result) => {
    if (err) {
      return '';
    } else {
      return 'success';
    }
  });
}

module.exports = { fetchModifyList, checkIsTimeConflict, insertBookData };
