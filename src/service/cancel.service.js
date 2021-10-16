/** @format */

const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET'],
});
const PROCESS_MANAGER = require('../manager/processManager');
const cancelController = require('../controller/cancel.controller');

function execute(replyToken) {
  PROCESS_MANAGER.setProcess('cancel');
  cancelController.resetCancelOrder();
  return client.replyMessage(replyToken, {
    type: 'template',
    altText: '取消預約選單',
    template: {
      type: 'confirm',
      text: '是否要進入取消預約流程?',
      actions: [
        {
          label: '是',
          type: 'postback',
          displayText: '我要取消預約',
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
