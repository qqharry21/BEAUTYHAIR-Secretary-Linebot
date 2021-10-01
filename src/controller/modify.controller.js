/** @format */

/** 輸入名字狀態 - modify */
let status = false;

/** 更改客戶姓名 */
let modifyName = '';

/** 原預約資料 */
let selectName = '';
let selectDate = '';
let selectTime = '';
let selectEndTime = '';
let selectSubject = '';

/** 設置名字輸入狀態 */
function setStatus(process) {
  status = process;
}

/** 抓取名字輸入狀態 */
function getStatus() {
  return status;
}

/** 設置查詢名字 */
function setmodifyName(name) {
  modifyName = name;
}

/** 抓取查詢名字 */
function getmodifyName() {
  return modifyName;
}

/** 設置查找範圍 */
function setmodifyRange(range) {
  modifyRange = range;
}

/** 抓取查找範圍 */
function getmodifyRange() {
  return modifyRange;
}

module.exports = {
  setStatus,
  getStatus,
  setmodifyName,
  getmodifyName,
  setmodifyRange,
  getmodifyRange,
};
