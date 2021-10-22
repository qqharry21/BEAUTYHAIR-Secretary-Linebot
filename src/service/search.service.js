/** @format */

const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET'],
});
const PROCESS_MANAGER = require('../manager/processManager');
const searchController = require('../controller/search.controller');

function execute(replyToken) {
  PROCESS_MANAGER.setProcess('search');
  searchController.resetSearchOrder();
  return client.replyMessage(replyToken, {
    type: 'template',
    altText: '查詢時段選單',
    template: {
      type: 'confirm',
      text: '是否要進入查詢時段流程?',
      actions: [
        {
          label: '是',
          type: 'postback',
          displayText: '我要查詢時段',
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
