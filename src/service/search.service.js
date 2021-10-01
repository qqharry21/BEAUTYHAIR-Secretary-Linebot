/** @format */

const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET'],
});
function execute(replyToken) {
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
          data: 'book',
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
