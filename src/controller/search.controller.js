/** @format */

const moment = require('moment');
const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET'],
});
const db = require('../config/config');
const HELPER = require('../helper/function/commonFunction');
const PROCESS_MANAGER = require('../manager/processManager');

/** 輸入名字狀態 - search */
let status = false;

/** 指定客戶姓名 */
let searchName = '';

/** 查找範圍 */
let searchRange = ''; //before、after、all

/** 設置名字輸入狀態 */
function setStatus(process) {
  status = process;
}

/** 抓取名字輸入狀態 */
function getStatus() {
  return status;
}

/** 設置查詢名字 */
function setSearchName(data) {
  searchName = name;
}

/** 抓取查詢名字 */
function getSearchName() {
  return searchName;
}

/** 設置查找範圍 */
function setSearchRange(data) {
  searchRange = data;
}

/** 抓取查找範圍 */
function getSearchRange() {
  return searchRange;
}

module.exports = {
  setStatus,
  getStatus,
  setSearchName,
  getSearchName,
  setSearchRange,
  getSearchRange,
};
