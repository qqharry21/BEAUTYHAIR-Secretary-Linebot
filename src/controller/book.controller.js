/** @format */

const moment = require('moment');
const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET'],
});

let order = {
  name: '123',
  date: '',
  time: '',
  endDate: '',
  subject: '123',
};
// book status
let status = false;

// * 確認姓名，確認=>存下使用者輸入，修改
function handleName(replyToken, text, bookStatus, error) {
  status = false;
  if (!error && bookStatus) {
    text = text.split('b/').pop();
    return client
      .replyMessage(replyToken, {
        type: 'template',
        altText: '確認客戶姓名',
        template: {
          type: 'buttons',
          title: '客戶姓名為『' + text + '』',
          text: '請確認名字是否相符',
          actions: [
            {
              label: '確認，並選擇日期',
              type: 'datetimepicker',
              mode: 'date',
              initial: moment().format('YYYY-MM-DD'),
              max: moment().add(6, 'months').format('YYYY-MM-DD'),
              min: moment().format('YYYY-MM-DD'),
              data: 'confirmName',
            },
            {
              label: '修改',
              type: 'postback',
              data: 'modify',
            },
          ],
        },
      })
      .then(() => {
        // ? 存入客戶姓名
        order.name = text.split('b/').pop();
        console.log('handle Name', order);
      });
  } else {
    // ? 重設客戶姓名
    this.resetOrder();
    status = true;
    return client
      .replyMessage(replyToken, {
        type: 'text',
        text: '格式錯誤，請重新預約',
      })
      .then(() => {
        status = false;
      });
    // this.setOrder(true, false, false, false, false);
    // return client.replyMessage(replyToken, {
    //   type: 'text',
    //   text: '錯誤指令，請重新預約',
    // });
  }
}
// * 確認日期，確認=>存下使用者輸入，修改
function handleDate(replyToken, bookStatus, postback) {
  console.log('confirmName postback', postback);
  status = false;
  if (postback.params.date && bookStatus) {
    return client
      .replyMessage(replyToken, {
        type: 'template',
        altText: '請確認日期',
        template: {
          type: 'buttons',
          title: '預約日期為『' + postback.params.date + '』',
          text: '請確認日期',
          actions: [
            {
              label: '確認，並選擇時間',
              type: 'datetimepicker',
              mode: 'time',
              initial: moment().format('hh:mm'),
              max: moment().add(12, 'h').format('hh:mm'),
              min: moment().format('hh:mm'),
              data: 'successDate',
            },
            {
              label: '修改日期',
              type: 'datetimepicker',
              mode: 'date',
              initial: moment().format('YYYY-MM-DD'),
              max: moment().add(6, 'months').format('YYYY-MM-DD'),
              min: moment().format('YYYY-MM-DD'),
              data: 'confirmName',
            },
          ],
        },
      })
      .then(() => {
        // ? 存入日期
        order.date = postback.params.date;
        console.log('handle Date', order);
      });
  } else {
    this.setOrder(true, false, false, false, false);
    status = true;
    return client.replyMessage(replyToken, {
      type: 'text',
      text: '格式錯誤，請重新輸入客戶姓名',
    });
  }
}
// * 確認時間，確認=>存下使用者輸入，修改
function handleTime(replyToken, bookStatus, postback) {
  console.log('handle time postback', postback);
  status = false;
  if (postback.params.date && bookStatus) {
    return client
      .replyMessage(replyToken, {
        type: 'template',
        altText: '請確認時間',
        template: {
          type: 'buttons',
          title: '預約時間為『' + postback.params.date + '』',
          text: '請確認時間',
          actions: [
            {
              label: '確認',
              type: 'postback',
              data: 'successTime',
            },
            {
              label: '修改時間',
              type: 'datetimepicker',
              mode: 'time',
              initial: moment().format('hh:mm'),
              max: moment().add(12, 'h').format('hh:mm'),
              min: moment().format('hh:mm'),
              data: 'successDate',
            },
          ],
        },
      })
      .then(() => {
        // ? 存入時間
        order.time = postback.params.date;
        console.log('handle Time', order);
      });
  } else {
    this.setOrder(true, true, false, false, false);
    status = true;
    return client.replyMessage(replyToken, {
      type: 'text',
      text: '格式錯誤，請重新輸入客戶姓名',
    });
  }
}
// * 資料清空
function resetOrder() {
  status = false;
  order.name = '';
  order.date = '';
  order.time = '';
  order.endDate = '';
  order.subject = '';
}

function setStatus(process) {
  status = process;
}

function setOrder(name, date, time, end, subject) {
  if (name) {
    order.name = '';
  }
  if (date) {
    order.date = '';
  }
  if (time) {
    order.time = '';
  }
  if (end) {
    order.end = '';
  }
  if (subject) {
    order.subject = '';
  }
}

function getOrder() {
  return order;
}

function getStatus() {
  return status;
}

module.exports = {
  handleName,
  handleDate,
  handleTime,
  resetOrder,
  setStatus,
  setOrder,
  getOrder,
  getStatus,
  order,
  status,
};
