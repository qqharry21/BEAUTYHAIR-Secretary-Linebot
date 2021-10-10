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
      if (postback.data.match('^endTime[0-9]')) {
        const range = postback.data.split('endTime').pop();
        switch (range) {
          case '30':
            bookController.setEndTime('30分鐘');
            return bookController.handleDateTime(replyToken, postback);
          case '60':
            bookController.setEndTime('60分鐘');
            return bookController.handleDateTime(replyToken, postback);
          case '90':
            bookController.setEndTime('90分鐘');
            return bookController.handleDateTime(replyToken, postback);
          case '120':
            bookController.setEndTime('120分鐘');
            return bookController.handleDateTime(replyToken, postback);
        }
      } else {
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
          case 'subject':
            bookController.setSubjectStatus_Book(true);
            return bookController.handleSubject(replyToken);
          case 'submit':
            return bookController.submitBook(replyToken);
        }
      }
    case 'COUNT':
      break;
    case 'MODIFY':
      // ? 是否為選擇預約List狀態
      if (postback.data.match('^choose[0-9]') && modifyController.getChosenStatus()) {
        const index = postback.data.split('choose').pop();
        return modifyController.choose(replyToken, index);
      } else if (postback.data.match('^endTime[0-9]')) {
        const range = postback.data.split('endTime').pop();
        switch (range) {
          case '30':
            modifyController.setNewEndTime('30分鐘');
            return modifyController.confirmModify(replyToken);
          case '60':
            modifyController.setNewEndTime('60分鐘');
            return modifyController.confirmModify(replyToken);
          case '90':
            modifyController.setNewEndTime('90分鐘');
            return modifyController.confirmModify(replyToken);
          case '120':
            modifyController.setNewEndTime('120分鐘');
            return modifyController.confirmModify(replyToken);
        }
      } else {
        switch (postback.data) {
          case 'modify':
            return modifyController.modify(replyToken);
          case 'cancel':
            return modifyController.cancelModify(replyToken);
          case 'modifyName':
            return modifyController.modify_modifyName(replyToken);
          case 'confirm':
            return modifyController.confirmModify(replyToken);
          case 'modifyDate':
            modifyController.setNewDate('');
            return modifyController.modifyDate(replyToken, postback);
          case 'modifyTime':
            modifyController.setNewTime('');
            return modifyController.modifyTime(replyToken, postback);
          case 'modifyEndTime':
            return modifyController.modifyEndTime(replyToken);
          case 'modifySubject':
            return modifyController.modifySubject(replyToken);
          case 'submitModify':
            return modifyController.submitModify(replyToken);
        }
      }
    // 非功能流程中，則跳出此訊息
    default:
      return client.replyMessage(replyToken, { type: 'text', text: '非功能流程中，無效指令' });
  }
}

module.exports = {
  execute,
};
