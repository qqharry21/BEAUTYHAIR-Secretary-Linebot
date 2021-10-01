/** @format */

const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET'],
});
let cancelOrder = {
  name: '',
  status: false,
  data: {
    name: '',
    date: '',
    time: '',
    endDate: '',
    subject: '',
  },
};

function getStatus() {
  return cancelOrder.status;
}

// * 資料清空
function resetCancelOrder() {
  cancelOrder.name = '';
  cancelOrder.status = false;
  cancelOrder.data.name = '';
  cancelOrder.data.date = '';
  cancelOrder.data.time = '';
  cancelOrder.data.endDate = '';
  cancelOrder.data.subject = '';
}

function setStatus(data) {
  cancelOrder.status = data;
}

module.exports = { cancelOrder, getStatus, setStatus, resetCancelOrder };
