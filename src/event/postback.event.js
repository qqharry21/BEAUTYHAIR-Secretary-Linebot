/** @format */

const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET'],
});
// const BOOK_SERVICE = require('./book.service');
const bookController = require('../controller/book.controller');
const modifyController = require('../controller/modify.controller');
const PROCESS_MANAGER = require('../function/processManager');

function execute(replyToken, postback, process) {
  // 判斷是否為功能流程中
  switch (process) {
    case 'BOOK':
      switch (postback.data) {
        case 'book':
          return bookController.book(replyToken);
        case 'cancelBook':
          return bookController.cancelBook(replyToken);
        case 'confirmName':
          // 完成姓名=>進入日期流程
          bookController.setDate('');
          return bookController.handleDate(replyToken, postback);
        case 'modifyName':
          return bookController.modifyName(replyToken);
        case 'confirmDate':
          // 完成日期輸入=>進入時間流程
          bookController.setTime('');
          return bookController.handleTime(replyToken, postback);
        case 'confirmTime':
          return bookController.handleEndTime(replyToken);
        case 'endTime30':
          bookController.setEndTime('30分鐘');
          return bookController.handleDateTime(replyToken, postback);
        case 'endTime60':
          bookController.setEndTime('60分鐘');
          return bookController.handleDateTime(replyToken, postback);
        case 'endTime90':
          bookController.setEndTime('90分鐘');
          return bookController.handleDateTime(replyToken, postback);
        case 'endTime120':
          bookController.setEndTime('120分鐘');
          return bookController.handleDateTime(replyToken, postback);
        case 'subject':
          bookController.setSubjectStatus(true);
          return bookController.handleSubject(replyToken);
        case 'submit':
          return bookController.submit(replyToken);
      }
    case 'COUNT':
      break;
    case 'MODIFY':
      switch (postback.data) {
        case 'modify':
          return modifyController.modify(replyToken);
        case 'cancel':
          return modifyController.cancelModify(replyToken);
      }
    // 非功能流程中，則跳出此訊息
    default:
      return client.replyMessage(replyToken, { type: 'text', text: '非功能流程中，無效指令' });
  }
}

module.exports = {
  execute,
};
