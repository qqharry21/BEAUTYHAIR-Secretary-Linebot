/** @format */
const axios = require('axios');

/** 輸入名字狀態 - modify */
let status = false;

/** 更改客戶姓名 */
let modifyName = '';

/** 所有相關 */
let modifyList = [];

/** 欲更改的預約資料 */
let data = {
  selectName: '',
  selectDate: '',
  selectTime: '',
  selectEndTime: '',
  selectSubject: '',
};

/** 確認-更改預約 */
function modify(replyToken) {
  setStatus(true);
  return client.replyMessage(replyToken, {
    type: 'text',
    text: '請輸入欲更改預約的客戶姓名(格式為m/xx)',
  });
}

/** 取消-更改預約 */
function cancelModify(replyToken) {
  // 結束流程
  PROCESS_MANAGER.resetProcess();
  resetOrder();
  return client.replyMessage(replyToken, {
    type: 'text',
    text: '取消更改預約流程',
  });
}

function handleName(replyToken, text) {

}

/** 設置名字輸入狀態 */
function setStatus(process) {
  status = process;
}

/** 抓取名字輸入狀態 */
function getStatus() {
  return status;
}

/** 設置查詢名字 */
function setModifyName(name) {
  modifyName = name;
}

/** 抓取查詢名字 */
function getModifyName() {
  return modifyName;
}

/** 向資料庫抓取所有相關預約 */
async function getModifyList() {
  const res = await axios.get('');
}

/** 選擇該欲更改的預約 */
// function handleSelect() {}

module.exports = {
  handleName,
  modify,
  cancelModify,
  setStatus,
  getStatus,
  setModifyName,
  getModifyName,
  getModifyList,
  // handleSelect,
};
