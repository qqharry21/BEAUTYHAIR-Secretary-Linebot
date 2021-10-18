/** @format */

const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET'],
});
const bookController = require('../controller/book.controller');
const modifyController = require('../controller/modify.controller');
const cancelController = require('../controller/cancel.controller');
const countController = require('../controller/count.controller');
const showController = require('../controller/show.controller');
const PROCESS_MANAGER = require('../manager/processManager');

function execute(replyToken, postback, process) {
  // 判斷是否為功能流程中
  switch (process) {
    case 'BOOK':
      //? 是否為選擇endTime時程狀態
      if (postback.data.match('^endTime[0-9]')) {
        const range = postback.data.split('endTime').pop();
        switch (range) {
          case '30':
            bookController.setEndTime(range);
            return bookController.handleDateTime(replyToken, postback);
          case '60':
            bookController.setEndTime(range);
            return bookController.handleDateTime(replyToken, postback);
          case '90':
            bookController.setEndTime(range);
            return bookController.handleDateTime(replyToken, postback);
          case '120':
            bookController.setEndTime(range);
            return bookController.handleDateTime(replyToken, postback);
        }
      }
      //? 為book流程中的postback
      else {
        switch (postback.data) {
          case 'start':
            return bookController.init_book(replyToken);
          case 'cancel':
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
          case 'check':
            return bookController.checkIsTimeConflict(replyToken);
          case 'submit':
            return bookController.submitBook(replyToken);
        }
      }
    case 'MODIFY':
      //? 是否為選擇預約List狀態
      if (postback.data.match('^choose[0-9]') && modifyController.getChosenStatus()) {
        const index = postback.data.split('choose').pop();
        return modifyController.choose(replyToken, index);
      }
      //? 是否為選擇endTime時程狀態
      else if (postback.data.match('^endTime[0-9]')) {
        const range = postback.data.split('endTime').pop();
        switch (range) {
          case '30':
            modifyController.setNewEndTime(range);
            return modifyController.confirmModify(replyToken);
          case '60':
            modifyController.setNewEndTime(range);
            return modifyController.confirmModify(replyToken);
          case '90':
            modifyController.setNewEndTime(range);
            return modifyController.confirmModify(replyToken);
          case '120':
            modifyController.setNewEndTime(range);
            return modifyController.confirmModify(replyToken);
        }
      }
      //? 是否選擇其他頁數
      else if (postback.data.match('^moreModifyPage[0-9]') && modifyController.getChosenStatus()) {
        const page = postback.data.split('moreModifyPage').pop();
        return modifyController.moreModifyPage(replyToken, page);
      }
      //? 為modify流程中的postback
      else {
        switch (postback.data) {
          case 'start':
            return modifyController.init_modify(replyToken);
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
          case 'check':
            return modifyController.checkIsTimeConflict(replyToken);
          case 'submit':
            return modifyController.submitModify(replyToken);
        }
      }
    case 'CANCEL':
      //? 是否為選擇預約List狀態
      if (postback.data.match('^choose[0-9]') && cancelController.getChosenStatus()) {
        const index = postback.data.split('choose').pop();
        return cancelController.choose(replyToken, index);
      }
      //? 是否選擇其他頁
      else if (postback.data.match('^moreCancelPage[0-9]') && cancelController.getChosenStatus()) {
        const page = postback.data.split('moreCancelPage').pop();
        return cancelController.moreCancelPage(replyToken, page);
      } else {
        switch (postback.data) {
          case 'start':
            return cancelController.init_cancel(replyToken);
          case 'cancel':
            return cancelController.cancel(replyToken);
          case 'change':
            return cancelController.change(replyToken);
          case 'submit':
            return cancelController.submitCancel(replyToken);
        }
      }
    case 'COUNT':
      if (postback.data.match('^date#\\d{4}-\\d{2}-\\d{2}')) {
        const date = postback.data.split('date#').pop();
        return countController.showBooks(replyToken, date);
      } else {
        switch (postback.data) {
          case 'start':
            return countController.init_count(replyToken);
          case 'cancel':
            return countController.cancelCount(replyToken);
          case 'today':
            return countController.handleToday(replyToken);
          case 'currentWeek':
            return countController.handleCurrentWeek(replyToken);
          case 'nextWeek':
            return countController.handleNextWeek(replyToken);
          case 'change':
            return countController.change(replyToken);
          case 'finish':
            return countController.finish(replyToken);
        }
      }
    case 'SHOW':
      if (
        postback.data.match('^choose[\u4e00-\u9fa5a-zA-Z]+$') &&
        showController.getChosenStatus()
      ) {
        const name = postback.data.split('choose').pop();
        return showController.choose(replyToken, name);
      } else {
        switch (postback.data) {
          case 'start':
            return showController.init_show(replyToken);
          case 'cancel':
            return showController.cancelShow(replyToken);
          case 'searchName':
            return showController.searchName(replyToken);
          case 'searchDate':
            return showController.searchDate(replyToken);
          case 'day':
            return showController.handleDay(replyToken, postback.params.date);
          case 'startDate':
            return showController.handleStartDate(replyToken, postback.params.date);
          case 'endDate':
            return showController.handleEndDate(replyToken, postback.params.date);
          case 'search':
            return showController.searchRange(replyToken, postback.params.date);
          case 'finish':
            return showController.finish(replyToken);
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
