/** @format */

const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET'],
});
const PROCESS_MANAGER = require('../manager/processManager');
const countController = require('../controller/count.controller');

function execute(replyToken) {
  PROCESS_MANAGER.setProcess('count');
  countController.resetCountOrder();
  return client.replyMessage(replyToken, {
    type: 'template',
    altText: '查詢人數選單',
    template: {
      type: 'confirm',
      text: '是否要進入查詢人數流程?',
      actions: [
        {
          label: '是',
          type: 'postback',
          displayText: '我要查詢人數',
          data: 'start',
        },
        {
          label: '否',
          type: 'postback',
          data: 'cancel',
        },
      ],
    },
  });
}
module.exports = { execute };
