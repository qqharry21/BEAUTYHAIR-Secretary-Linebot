/** @format */

const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET'],
});
const PROCESS_MANAGER = require('../function/processManager');
const bookController = require('../controller/book.controller');
function execute(replyToken) {
  PROCESS_MANAGER.setProcess('book');
  bookController.setOrder('', '', '', '', '');
  return client.replyMessage(replyToken, {
    type: 'template',
    altText: '預約選單',
    template: {
      type: 'confirm',
      text: '是否要新增預約?',
      actions: [
        {
          label: '預約',
          type: 'postback',
          displayText: '我要預約',
          data: 'book',
        },
        {
          label: '否',
          type: 'postback',
          displayText: '取消預約',
          data: 'cancelBook',
        },
      ],
    },
  });
}
module.exports = { execute };
