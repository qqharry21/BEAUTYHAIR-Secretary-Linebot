/** @format */

const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET'],
});
// const BOOK_SERVICE = require('./book.service');
const bookController = require('../controller/book.controller');

function book(replyToken) {
  bookController.setStatus(true);
  return client.replyMessage(replyToken, [
    {
      type: 'text',
      text: '請輸入客戶姓名',
    },
  ]);
}
function time(replyToken, postback) {
  return client.replyMessage(replyToken, {
    type: 'text',
    text: '預約時間:' + postback.params.datetime,
  });
}
function cancel(replyToken) {
  bookController.setStatus(false);
  return client.replyMessage(replyToken, {
    type: 'text',
    text: '取消預約',
  });
}
function modify(replyToken) {
  bookController.setOrder(true, false, false, false, false);
  bookController.setStatus(true);
  return client.replyMessage(replyToken, [
    {
      type: 'text',
      text: '請重新填寫客戶姓名',
    },
  ]);
}
function modifyName(replyToken) {
  return client.replyMessage(replyToken, [
    {
      type: 'text',
      text: '請重新填寫客戶姓名',
    },
  ]);
}
function modifyDate(replyToken) {
  return client.replyMessage(replyToken, [
    {
      type: 'text',
      text: '請重新填寫客戶姓名',
    },
  ]);
}
// function confirmName (replyToken, postback) {
//   return BOOK_SERVICE.handleDate(replyToken, true, postback);
// },
module.exports = {
  book,
  time,
  cancel,
  modify,
  modifyName,
  modifyDate,
  // confirmName
};
