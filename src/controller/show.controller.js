/** @format */

const moment = require('moment');
const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET'],
});
const db = require('../config/config');
const HELPER = require('../helper/function/commonFunction');
const PROCESS_MANAGER = require('../manager/processManager');
//* STATUS
/** 輸入名字狀態 - show */
let status = false;
/** 選取預約的狀態 */
let chosenStatus = false;
//* SUM
let showTotal = 0;
//* LIST
/** 相關預約List */
let showList = [];
/** 相關預約List的Content */
let showListContent = [];
/** 詳細內容的List */
let nodeContent = [];

function init_show(replyToken) {
  return client.replyMessage(replyToken, {
    type: 'flex',
    altText: '查詢條件列表',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '請選擇查詢條件',
          },
          {
            type: 'separator',
            margin: 'xl',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'button',
                    action: {
                      type: 'postback',
                      label: '依客戶姓名',
                      data: 'searchName',
                    },
                    color: '#9E4751',
                    style: 'primary',
                  },
                  {
                    type: 'button',
                    action: {
                      type: 'postback',
                      label: '依預約日期',
                      data: 'searchDate',
                    },
                    color: '#9E4751',
                    style: 'primary',
                  },
                ],
                spacing: 'xl',
              },
            ],
          },
        ],
      },
    },
  });
}

function cancelShow(replyToken) {
  resetShowOrder();
  // 結束流程
  PROCESS_MANAGER.resetProcess();
  return client.replyMessage(replyToken, {
    type: 'text',
    text: '結束-查詢條件流程',
  });
}

function searchName(replyToken) {
  setStatus(true);
  return client.replyMessage(replyToken, [
    {
      type: 'text',
      text: '請輸入客戶姓名(格式為s/xx)',
    },
  ]);
}
function searchDate(replyToken) {}

function handleName(replyToken, text) {
  setStatus(false);
  if (text.length > 1) {
    const sqlSelect = 'SELECT DISTINCT `name` FROM `order` WHERE `name` LIKE CONCAT("%", ?, "%")';

    db.query(sqlSelect, [text], (err, result) => {
      if (err) {
        resetShowOrder();
        PROCESS_MANAGER.resetProcess();
        return client.replyMessage(replyToken, { type: 'text', text: '發生錯誤，請通知管理員' });
      } else if (result.length == 0) {
        return client
          .replyMessage(replyToken, {
            type: 'text',
            text: '未找到類似客戶的姓名，請重新點選該功能!',
          })
          .then(() => {
            resetShowOrder();
            PROCESS_MANAGER.resetProcess();
          });
      } else if (result.length == 1) {
        //只找到一個客戶
        const sqlSelect2 = 'SELECT `date`, `time`, `subject` FROM `order` WHERE `name` = ?';
        db.query(sqlSelect2, [result[0].name], (error, res) => {
          if (error) {
            resetShowOrder();
            PROCESS_MANAGER.resetProcess();
            return client.replyMessage(replyToken, {
              type: 'text',
              text: '發生錯誤，請通知管理員',
            });
          } else {
            if (res.length == 1) {
              showListContent.push({
                type: 'text',
                text: `預約次數：${showTotal}筆`,
                color: '#b7b7b7',
                size: 'xs',
              });
              showListContent.push({
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: item.date,
                    size: 'sm',
                    gravity: 'center',
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'filler',
                      },
                      {
                        type: 'box',
                        layout: 'vertical',
                        contents: [],
                        cornerRadius: '30px',
                        height: '12px',
                        width: '12px',
                        borderColor: '#9E4751',
                        borderWidth: '2px',
                      },
                      {
                        type: 'filler',
                      },
                    ],
                    flex: 0,
                  },
                  {
                    type: 'text',
                    text: `${HELPER.timeChange(item.time)} --${item.subject}`,
                    gravity: 'center',
                    flex: 2,
                    size: 'sm',
                    align: 'start',
                    weight: 'bold',
                  },
                ],
                spacing: 'lg',
                cornerRadius: '30px',
                margin: 'lg',
              });
            } else {
              showListContent.push({
                type: 'text',
                text: `預約次數：${showTotal}筆`,
                color: '#b7b7b7',
                size: 'xs',
              });
              res.forEach(function (item, index) {
                if (index == res.length - 1) {
                  //最後一筆節點
                  showListContent.push({
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'text',
                        text: item.date,
                        size: 'sm',
                        gravity: 'center',
                      },
                      {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                          {
                            type: 'filler',
                          },
                          {
                            type: 'box',
                            layout: 'vertical',
                            contents: [],
                            cornerRadius: '30px',
                            height: '12px',
                            width: '12px',
                            borderColor: '#9E4751',
                            borderWidth: '2px',
                          },
                          {
                            type: 'filler',
                          },
                        ],
                        flex: 0,
                      },
                      {
                        type: 'text',
                        text: `${HELPER.timeChange(item.time)} --${item.subject}`,
                        gravity: 'center',
                        flex: 2,
                        size: 'sm',
                        align: 'start',
                        weight: 'bold',
                      },
                    ],
                    spacing: 'lg',
                    cornerRadius: '30px',
                    margin: 'lg',
                  });
                } else {
                  //節點
                  showListContent.push({
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'text',
                        text: item.date,
                        size: 'sm',
                        gravity: 'center',
                      },
                      {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                          {
                            type: 'filler',
                          },
                          {
                            type: 'box',
                            layout: 'vertical',
                            contents: [],
                            cornerRadius: '30px',
                            height: '12px',
                            width: '12px',
                            borderColor: '#9E4751',
                            borderWidth: '2px',
                          },
                          {
                            type: 'filler',
                          },
                        ],
                        flex: 0,
                      },
                      {
                        type: 'text',
                        text: `${HELPER.timeChange(item.time)} --${item.subject}`,
                        gravity: 'center',
                        flex: 2,
                        size: 'sm',
                        align: 'start',
                        weight: 'bold',
                      },
                    ],
                    spacing: 'lg',
                    cornerRadius: '30px',
                    margin: 'lg',
                  });
                  //區間線
                  showListContent.push({
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'box',
                        layout: 'baseline',
                        contents: [
                          {
                            type: 'filler',
                          },
                        ],
                        flex: 1,
                      },
                      {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                          {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                              {
                                type: 'filler',
                              },
                              {
                                type: 'box',
                                layout: 'vertical',
                                contents: [],
                                width: '1.5px',
                                backgroundColor: '#9E4751',
                              },
                              {
                                type: 'filler',
                              },
                            ],
                            flex: 1,
                          },
                        ],
                        width: '12px',
                      },
                      {
                        type: 'text',
                        text: ' ',
                        gravity: 'center',
                        flex: 2,
                        size: 'xs',
                        color: '#8c8c8c',
                      },
                    ],
                    spacing: 'lg',
                    height: '20px',
                  });
                }
              });
            }
            return client.replyMessage(replyToken, {
              type: 'flex',
              altText: '查詢結果',
              contents: {
                type: 'bubble',
                size: 'mega',
                header: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'box',
                      layout: 'horizontal',
                      contents: [
                        {
                          type: 'text',
                          text: '客戶姓名',
                          size: 'md',
                          flex: 1,
                          gravity: 'center',
                          offsetStart: '35px',
                          color: '#AAAAAA',
                        },
                        {
                          type: 'text',
                          text: result[0].name,
                          color: '#ffffff',
                          size: '3xl',
                          flex: 3,
                          weight: 'bold',
                          align: 'center',
                        },
                      ],
                      flex: 2,
                      spacing: 'none',
                    },
                  ],
                  paddingAll: '20px',
                  backgroundColor: '#9E4751',
                  spacing: 'md',
                  height: '85px',
                  paddingTop: '22px',
                },
                body: {
                  type: 'box',
                  layout: 'vertical',
                  contents: showListContent,
                },
                footer: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'button',
                      action: {
                        type: 'postback',
                        label: '結束',
                        data: 'finish',
                      },
                      style: 'primary',
                      color: '#9E4751',
                    },
                  ],
                  spacing: 'xs',
                },
              },
            });
          }
        });
      } else {
        return client
          .replyMessage(replyToken, {
            type: 'flex',
            altText: '選擇類似客戶列表',
            contents: {
              type: 'carousel',
              contents: [
                {
                  type: 'bubble',
                  size: 'nano',
                  header: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        color: '#ffffff',
                        align: 'start',
                        size: 'xs',
                        gravity: 'center',
                        text: '客戶姓名',
                      },
                      {
                        type: 'text',
                        text: '陳全豪',
                        color: '#ffffff',
                        align: 'end',
                        size: 'xl',
                        gravity: 'center',
                        margin: 'lg',
                        weight: 'bold',
                      },
                    ],
                    backgroundColor: '#9E4751',
                    paddingTop: '19px',
                    paddingAll: '12px',
                    paddingBottom: '16px',
                  },
                  body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'button',
                        action: {
                          type: 'postback',
                          label: '選擇',
                          data: 'hello',
                        },
                        color: '#9E4751',
                      },
                    ],
                    spacing: 'md',
                    paddingAll: '12px',
                  },
                  styles: {
                    footer: {
                      separator: false,
                    },
                  },
                },
              ],
            },
          })
          .then(() => {
            setChosenStatus(true);
          });
        //找到多個類似姓名的客戶
      }
    });
  } else {
    resetShowOrder();
    PROCESS_MANAGER.resetProcess();
    return client.replyMessage(replyToken, {
      type: 'text',
      text: '名字輸入太短，至少兩個字，請重新點選該功能!',
    });
  }
}

function change(replyToken) {
  resetShowOrder();
  return client.replyMessage(replyToken, {
    type: 'flex',
    altText: '日期區間選擇列表',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '請選擇日期區間',
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'horizontal',
        spacing: 'lg',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'postback',
              label: '當天',
              data: 'today',
              displayText: '當天',
            },
            color: '#4E8FDE',
          },
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'postback',
              label: '當周',
              data: 'currentWeek',
              displayText: '計算當週',
            },
            color: '#4E8FDE',
          },
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'postback',
              label: '隔周',
              data: 'nextWeek',
              displayText: '計算隔週',
            },
            color: '#4E8FDE',
          },
        ],
        flex: 0,
      },
    },
  });
}

/** 設置輸入名字流程 */
function setStatus(process) {
  status = process;
}

function getStatus() {
  return status;
}

/** 清空資料
 * @description 所有參數回復初始值
 */
function resetShowOrder() {
  resetShowList();
  showTotal = 0;
}

function resetShowList() {
  showList = [];
  showListContent = [];
  nodeContent = [];
}

function finish(replyToken) {
  resetShowOrder();
  // 結束流程
  PROCESS_MANAGER.resetProcess();
  return client.replyMessage(replyToken, {
    type: 'text',
    text: '結束-查詢人數流程',
  });
}

module.exports = {
  init_show,
  cancelShow,
  resetShowOrder,
  resetShowList,
  searchName,
  searchDate,
  setStatus,
  getStatus,
  change,
  finish,
  handleName,
};
