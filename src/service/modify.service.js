/** @format */

const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET'],
});
const PROCESS_MANAGER = require('../manager/processManager');
const modifyController = require('../controller/modify.controller');

/** Modify init */
function execute(replyToken) {
  PROCESS_MANAGER.setProcess('modify');
  modifyController.resetNewOrder();
  return client.replyMessage(replyToken, {
    type: 'template',
    altText: '更改預約選單',
    template: {
      type: 'confirm',
      text: '是否要進入更改預約流程?',
      actions: [
        {
          label: '是',
          type: 'postback',
          displayText: '我要更改預約',
          data: 'modify',
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
