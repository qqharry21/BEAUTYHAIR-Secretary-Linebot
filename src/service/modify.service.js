/** @format */

const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET'],
});
const PROCESS_MANAGER = require('../function/processManager');
const modifyController = require('../controller/modify.controller');
function execute(replyToken) {
  PROCESS_MANAGER.setProcess('modify');
  // bookController.setOrder('', '', '', '', '');
  return client.replyMessage(replyToken, {
    type: 'template',
    altText: '更改預約選單',
    template: {
      type: 'confirm',
      text: '是否要更改預約?',
      actions: [
        {
          label: '更改',
          type: 'postback',
          data: 'modify',
        },
        {
          label: '否',
          type: 'postback',
          data: 'cancelBook',
        },
      ],
    },
  });
}
module.exports = { execute };
