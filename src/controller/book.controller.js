/** @format */

const moment = require('moment');
const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET'],
});
const query = require('../config/config');
const HELPER = require('../helper/commonFunction');
const PROCESS_MANAGER = require('../manager/processManager');

//* STATUS
/** name input status */
let status = false;
/** subject input status */
let subjectStatus_book = false;
//* DATA
let name = '';
let date = '';
let time = '';
let endTime = '';
let subject = '';
//* OBJECT
let order = { name: '', date: '', time: '', endTime: '', subject: '' };
//* FUNCTION

/** 確認-預約
 * @return
 * @description
 */
function init_book(replyToken) {
  setStatus(true);
  return client.replyMessage(replyToken, [
    {
      type: 'text',
      text: '請輸入客戶姓名(至少兩個字)',
    },
  ]);
}

/** 取消-預約
 * @return
 * @description
 */
function cancelBook(replyToken) {
  resetOrder();
  // 結束流程
  PROCESS_MANAGER.resetProcess();
  return client.replyMessage(replyToken, {
    type: 'text',
    text: '結束-預約流程',
  });
}

/** 預約流程中，更改客戶姓名
 * @return
 * @description
 */
function modifyName(replyToken) {
  // 清空姓名
  setName('');
  // 輸入姓名狀態=>true
  setStatus(true);
  return client.replyMessage(replyToken, [
    {
      type: 'text',
      text: '請重新填寫客戶姓名(格式為b/xx)',
    },
  ]);
}

/** 處理姓名輸入
 * @param text 輸入字串
 * 確認=>存入後，跳出日期選單,
 * 更改=>跳出"請重新輸入姓名"
 */
function handleName(replyToken, text) {
  setStatus(false);
  if (text.length > 1) {
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
              data: 'modifyName',
            },
          ],
        },
      })
      .then(() => {
        // 存入客戶姓名
        setName(text);
      });
  } else {
    resetOrder();
    PROCESS_MANAGER.resetProcess();
    return client.replyMessage(replyToken, {
      type: 'text',
      text: '名字輸入太短，至少兩個字，請重新點選該功能!',
    });
  }
}

/** 處理日期輸入
 * @param postback 選擇的日期.
 * @description
 * 確認=>存入後，跳出時間選單,
 * 更改=>清空日期，跳出日期選單
 */
function handleDate(replyToken, postback) {
  // 有選擇日期 且 未存下選擇的日期時
  if (postback.params.date && getDate() == '') {
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
              initial: '10:00',
              data: 'confirmDate',
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
        // 存入日期
        setDate(postback.params.date);
      });
  }
}

/** 處理時間輸入
 * 確認=>存入後，跳出所需時間選單,
 * 更改=>清空時間，跳出時間選單
 */
function handleTime(replyToken, postback) {
  // 有選擇時間 且 未存下選擇的時間時
  if (postback.params.time && getTime() == '') {
    let timeChange = HELPER.timeChange(postback.params.time);
    return client
      .replyMessage(replyToken, {
        type: 'template',
        altText: '請確認時間',
        template: {
          type: 'buttons',
          title: '預約時間為『' + timeChange + '』',
          text: '請確認時間',
          actions: [
            {
              label: '確認',
              type: 'postback',
              data: 'confirmTime',
            },
            {
              label: '修改時間',
              type: 'datetimepicker',
              mode: 'time',
              initial: '10:00',
              data: 'confirmDate',
            },
          ],
        },
      })
      .then(() => {
        // 存入時間
        setTime(postback.params.time);
      });
  }
}

/** 處理所需時間
 * 確認=>跳出確認日期時間選單
 */
function handleEndTime(replyToken) {
  return client.replyMessage(replyToken, {
    type: 'template',
    altText: '選擇大約需花費時間',
    template: {
      type: 'buttons',
      title: '選擇大約需花費時間',
      text: '請確認時間區間',
      actions: [
        {
          label: '30分鐘',
          type: 'postback',
          displayText: '30分鐘',
          data: 'endTime30',
        },
        {
          label: '60分鐘',
          type: 'postback',
          displayText: '60分鐘',
          data: 'endTime60',
        },
        {
          label: '90分鐘',
          type: 'postback',
          displayText: '90分鐘',
          data: 'endTime90',
        },
        {
          label: '120分鐘',
          type: 'postback',
          displayText: '120分鐘',
          data: 'endTime120',
        },
      ],
    },
  });
}

/** 確認日期與時間
 * 確認=>存入後，跳出項目選單
 */
function handleDateTime(replyToken, postback) {
  if (getDate() != '' && getTime() != '') {
    return client.replyMessage(replyToken, {
      type: 'template',
      altText: '預約日期&時間',
      template: {
        type: 'buttons',
        title: '預約日期&時間',
        text:
          '『' +
          getDate() +
          ' ' +
          HELPER.timeChange(getTime()) +
          '』, 所需時間『' +
          getEndTime() +
          '分鐘』',
        actions: [
          {
            label: '下一步',
            type: 'postback',
            data: 'subject',
          },
        ],
      },
    });
  }
}

/** 處理項目 */
function handleSubject(replyToken) {
  return client.replyMessage(replyToken, {
    type: 'text',
    text: '請選擇服務項目',
    quickReply: {
      items: [
        {
          type: 'action',
          imageUrl: 'https://img.icons8.com/office/50/000000/new.png',
          action: {
            label: '修剪新品',
            type: 'message',
            text: '修剪新品',
          },
        },
        {
          type: 'action',
          imageUrl: 'https://img.icons8.com/offices/50/000000/hair-washing-sink.png',
          action: {
            label: '洗/染',
            type: 'message',
            text: '洗/染',
          },
        },
        {
          type: 'action',
          imageUrl: 'https://img.icons8.com/color/48/000000/hairdresser.png',
          action: {
            label: '剪髮',
            type: 'message',
            text: '剪髮',
          },
        },
        {
          type: 'action',
          imageUrl: 'https://img.icons8.com/offices/50/000000/barber-chair.png',
          action: {
            label: '返修',
            type: 'message',
            text: '返修',
          },
        },
        {
          type: 'action',
          imageUrl:
            'https://img.icons8.com/external-those-icons-lineal-color-those-icons/24/000000/external-barber-barber-shop-those-icons-lineal-color-those-icons.png',
          action: {
            label: '其他',
            type: 'message',
            text: '其他',
          },
        },
      ],
    },
  });
}

/** 確認完整預約 */
function confirmBook(replyToken) {
  return client.replyMessage(replyToken, {
    type: 'flex',
    altText: '確認預約內容',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '確認預約內容是否正確?',
            weight: 'bold',
            size: 'xl',
            margin: 'none',
            color: '#FF8C00',
            decoration: 'none',
            align: 'start',
            gravity: 'center',
          },
          {
            type: 'separator',
            margin: 'xxl',
          },
          {
            type: 'text',
            text: '預約明細',
            size: 'xs',
            color: '#aaaaaa',
            wrap: true,
            margin: 'md',
            align: 'center',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'md',
            spacing: 'sm',
            contents: [
              // Name
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '客戶姓名',
                    size: 'sm',
                    color: '#555555',
                    flex: 0,
                    weight: 'bold',
                    gravity: 'center',
                  },
                  {
                    type: 'text',
                    text: getName(),
                    size: 'lg',
                    color: '#111111',
                    align: 'end',
                    weight: 'bold',
                    gravity: 'center',
                  },
                ],
              },
              // Date
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '預約日期',
                    size: 'sm',
                    color: '#555555',
                    flex: 0,
                    weight: 'bold',
                    gravity: 'center',
                  },
                  {
                    type: 'text',
                    text: getDate(),
                    size: 'lg',
                    color: '#111111',
                    align: 'end',
                    weight: 'bold',
                    gravity: 'center',
                  },
                ],
              },
              // Time
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '預約時間',
                    size: 'sm',
                    color: '#555555',
                    flex: 0,
                    weight: 'bold',
                    gravity: 'center',
                  },
                  {
                    type: 'text',
                    text: HELPER.timeChange(getTime()),
                    size: 'lg',
                    color: '#111111',
                    align: 'end',
                    weight: 'bold',
                    gravity: 'center',
                  },
                ],
              },
              // EndTime
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '服務時長',
                    size: 'sm',
                    color: '#555555',
                    flex: 0,
                    weight: 'bold',
                    gravity: 'center',
                  },
                  {
                    type: 'text',
                    text: getEndTime() + '分鐘',
                    size: 'lg',
                    color: '#111111',
                    align: 'end',
                    weight: 'bold',
                    gravity: 'center',
                  },
                ],
              },
              // Subject
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '服務項目',
                    size: 'sm',
                    color: '#555555',
                    flex: 0,
                    weight: 'bold',
                    gravity: 'center',
                  },
                  {
                    type: 'text',
                    text: getSubject(),
                    size: 'lg',
                    color: '#111111',
                    align: 'end',
                    weight: 'bold',
                    gravity: 'center',
                  },
                ],
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'button',
            action: {
              type: 'postback',
              label: '確認',
              displayText: '送出預約',
              data: 'check',
            },
            color: '#FF8C00',
          },
          {
            type: 'button',
            action: {
              type: 'postback',
              label: '取消',
              displayText: '取消預約',
              data: 'cancel',
            },
            color: '#FF8C00',
          },
        ],
      },
      styles: {
        footer: {
          separator: true,
        },
      },
    },
  });
}

/** 送交，存入DB
 * @return
 * @description
 */
function submitBook(replyToken) {
  const sqlSelect =
    'INSERT INTO `order` (`name`, `date`, `time`, `endTime`, `subject`) VALUES (?, ?, ?, ?, ?)';
  query(sqlSelect, [name, date, time, endTime, subject], (err, result) => {
    if (err) {
      resetOrder();
      PROCESS_MANAGER.resetProcess();
      return client.replyMessage(replyToken, [
        { type: 'text', text: '預約中...' },
        { type: 'text', text: '發生錯誤，請通知管理員' },
      ]);
    } else {
      setOrder(name, date, time, endTime, subject);
      resetOrder();
      PROCESS_MANAGER.resetProcess();
      return client.replyMessage(replyToken, [
        { type: 'text', text: '預約中...' },
        {
          type: 'flex',
          altText: '預約成功',
          contents: {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'image',
                      url: 'https://img.icons8.com/cotton/48/000000/checkmark.png',
                      size: 'xs',
                      position: 'relative',
                      align: 'start',
                    },
                    {
                      type: 'text',
                      text: '預約成功',
                      weight: 'bold',
                      size: '32px',
                      margin: 'none',
                      color: '#1DB446',
                      decoration: 'none',
                      align: 'start',
                      gravity: 'center',
                    },
                  ],
                },
                {
                  type: 'separator',
                  margin: 'xxl',
                },
                {
                  type: 'text',
                  text: '預約明細',
                  size: 'xs',
                  color: '#aaaaaa',
                  wrap: true,
                  margin: 'md',
                  align: 'center',
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  margin: 'md',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'box',
                      layout: 'horizontal',
                      contents: [
                        {
                          type: 'text',
                          text: '客戶姓名',
                          size: 'sm',
                          color: '#555555',
                          flex: 0,
                          weight: 'bold',
                          gravity: 'center',
                        },
                        {
                          type: 'text',
                          text: order.name,
                          size: 'lg',
                          color: '#111111',
                          align: 'end',
                          weight: 'bold',
                          gravity: 'center',
                        },
                      ],
                    },
                    {
                      type: 'box',
                      layout: 'horizontal',
                      contents: [
                        {
                          type: 'text',
                          text: '預約日期',
                          size: 'sm',
                          color: '#555555',
                          flex: 0,
                          weight: 'bold',
                          gravity: 'center',
                        },
                        {
                          type: 'text',
                          text: order.date,
                          size: 'lg',
                          color: '#111111',
                          align: 'end',
                          weight: 'bold',
                          gravity: 'center',
                        },
                      ],
                    },
                    {
                      type: 'box',
                      layout: 'horizontal',
                      contents: [
                        {
                          type: 'text',
                          text: '預約時間',
                          size: 'sm',
                          color: '#555555',
                          flex: 0,
                          weight: 'bold',
                          gravity: 'center',
                        },
                        {
                          type: 'text',
                          text: HELPER.timeChange(order.time),
                          size: 'lg',
                          color: '#111111',
                          align: 'end',
                          weight: 'bold',
                          gravity: 'center',
                        },
                      ],
                    },
                    {
                      type: 'box',
                      layout: 'horizontal',
                      contents: [
                        {
                          type: 'text',
                          text: '服務時長',
                          size: 'sm',
                          color: '#555555',
                          flex: 0,
                          weight: 'bold',
                          gravity: 'center',
                        },
                        {
                          type: 'text',
                          text: order.endTime,
                          size: 'lg',
                          color: '#111111',
                          align: 'end',
                          weight: 'bold',
                          gravity: 'center',
                        },
                      ],
                    },
                    {
                      type: 'box',
                      layout: 'horizontal',
                      contents: [
                        {
                          type: 'text',
                          text: '服務項目',
                          size: 'sm',
                          color: '#555555',
                          flex: 0,
                          weight: 'bold',
                          gravity: 'center',
                        },
                        {
                          type: 'text',
                          text: order.subject,
                          size: 'lg',
                          color: '#111111',
                          align: 'end',
                          weight: 'bold',
                          gravity: 'center',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            styles: {
              footer: {
                separator: true,
              },
            },
          },
        },
      ]);
    }
  });
}

function checkIsTimeConflict(replyToken) {
  const sqlSelect = 'SELECT * FROM `order` WHERE `date`= ? AND `time` LIKE CONCAT( ?, "%")';
  query(sqlSelect, [date, time], (err, result) => {
    if (result.length > 0) {
      return client.replyMessage(replyToken, {
        type: 'template',
        altText: '同時段已有' + result.length + '個客戶',
        template: {
          type: 'confirm',
          text: '同時段已有' + result.length + '個客戶，是否要繼續預約?',
          actions: [
            {
              label: '繼續',
              type: 'postback',
              data: 'submit',
            },
            {
              label: '取消預約',
              type: 'postback',
              data: 'cancel',
            },
          ],
        },
      });
    } else {
      submitBook(replyToken);
    }
  });
}

/** 資料清空
 * @return
 * @description
 */
function resetOrder() {
  setStatus(false);
  setSubjectStatus_Book(false);
  setName('');
  setDate('');
  setTime('');
  setEndTime('');
  setSubject('');
}
/**
 * @return
 * @description
 * */
function setOrder(name, date, time, endTime, subject) {
  order.name = name;
  order.date = date;
  order.time = time;
  order.endTime = endTime;
  order.subject = subject;
}

/** 設置輸入名字流程 */
function setStatus(process) {
  status = process;
}

function getStatus() {
  return status;
}

/** 設置項目流程 */
function setSubjectStatus_Book(process) {
  subjectStatus_book = process;
}

function getSubjectStatus_Book() {
  return subjectStatus_book;
}

function getName() {
  return name;
}

function setName(data) {
  name = data;
}

function getDate() {
  return date;
}

function setDate(data) {
  date = data;
}

function getTime() {
  return time;
}

function setTime(data) {
  time = data;
}

function getEndTime() {
  return endTime;
}

function setEndTime(data) {
  endTime = data;
}

function getSubject() {
  return subject;
}

function setSubject(data) {
  subject = data;
}

module.exports = {
  handleName,
  handleDate,
  handleTime,
  handleDateTime,
  handleSubject,
  handleEndTime,
  confirmBook,
  submitBook,
  checkIsTimeConflict,
  init_book,
  cancelBook,
  modifyName,
  resetOrder,
  setOrder,
  getStatus,
  setStatus,
  getSubjectStatus_Book,
  setSubjectStatus_Book,
  getName,
  setName,
  getDate,
  setDate,
  getTime,
  setTime,
  getEndTime,
  setEndTime,
  getSubject,
  setSubject,
};
