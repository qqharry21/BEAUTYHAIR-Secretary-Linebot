/** @format */

const moment = require('moment');
const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET'],
});
const db = require('../config/config');
const PROCESS_MANAGER = require('../manager/processManager');
//* LIST
/** 相關預約List */
let searchList = [];
/** 相關預約List的Content */
let searchListContent = [];
//* DATA
/** 查找範圍 */
let searchDate = '';
let start_time = '';
let end_time = '';

function init_search(replyToken) {
  return client.replyMessage(replyToken, {
    type: 'flex',
    altText: '請選擇日期',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '請輸入日期',
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
                type: 'button',
                action: {
                  label: '選擇日期',
                  type: 'datetimepicker',
                  mode: 'date',
                  data: 'searchDate',
                },
                color: '#AAAAAA',
                style: 'primary',
              },
            ],
          },
        ],
      },
    },
  });
}

function cancelSearch(replyToken) {
  resetSearchOrder();
  // 結束流程
  PROCESS_MANAGER.resetProcess();
  return client.replyMessage(replyToken, {
    type: 'text',
    text: '結束-查詢是否有預約流程',
  });
}

function handleDate(replyToken, date) {
  searchDate = date;
  return client.replyMessage(replyToken, {
    type: 'flex',
    altText: '請選擇起始時間',
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '日期',
            color: '#FFFFFF',
          },
          {
            type: 'text',
            text: searchDate,
            color: '#ffffff',
            size: 'xl',
            flex: 3,
            weight: 'bold',
            align: 'start',
          },
        ],
        paddingAll: '20px',
        backgroundColor: '#AAAAAA',
        spacing: 'none',
        height: '85px',
        paddingTop: '22px',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: '起始時間',
                align: 'center',
                color: '#AAAAAA',
              },
              {
                type: 'text',
                text: ' ',
                align: 'center',
              },
              {
                type: 'text',
                text: '結束時間',
                align: 'center',
                color: '#AAAAAA',
              },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: '未填寫',
                align: 'center',
                color: '#111111',
                weight: 'bold',
                size: 'sm',
              },
              {
                type: 'text',
                text: '~',
                align: 'center',
              },
              {
                type: 'text',
                text: '未填寫',
                align: 'center',
                weight: 'bold',
                color: '#111111',
                size: 'sm',
              },
            ],
            margin: 'lg',
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              label: '選擇起始時間',
              type: 'datetimepicker',
              mode: 'time',
              initial: '10:00',
              data: 'startTime',
            },
            style: 'primary',
            color: '#AAAAAA',
          },
        ],
      },
      styles: {
        header: {
          backgroundColor: '#AAAAAA',
        },
      },
    },
  });
}

function handleStartTime(replyToken, time) {
  start_time = time;
  return client.replyMessage(replyToken, {
    type: 'flex',
    altText: '請選擇結束時間',
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '日期',
            color: '#FFFFFF',
          },
          {
            type: 'text',
            text: searchDate,
            color: '#ffffff',
            size: 'xl',
            flex: 3,
            weight: 'bold',
            align: 'start',
          },
        ],
        paddingAll: '20px',
        backgroundColor: '#AAAAAA',
        spacing: 'none',
        height: '85px',
        paddingTop: '22px',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: '起始時間',
                align: 'center',
                color: '#AAAAAA',
              },
              {
                type: 'text',
                text: ' ',
                align: 'center',
              },
              {
                type: 'text',
                text: '結束時間',
                align: 'center',
                color: '#AAAAAA',
              },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: start_time,
                align: 'center',
                color: '#111111',
                weight: 'bold',
                size: 'sm',
              },
              {
                type: 'text',
                text: '~',
                align: 'center',
              },
              {
                type: 'text',
                text: '未填寫',
                align: 'center',
                weight: 'bold',
                color: '#111111',
                size: 'sm',
              },
            ],
            margin: 'lg',
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              label: '選擇結束時間',
              type: 'datetimepicker',
              mode: 'time',
              initial: '18:00',
              data: 'endTime',
            },
            style: 'primary',
            color: '#AAAAAA',
          },
        ],
      },
      styles: {
        header: {
          backgroundColor: '#AAAAAA',
        },
      },
    },
  });
}

function handleEndTime(replyToken, time) {
  end_time = time;
  return client.replyMessage(replyToken, {
    type: 'flex',
    altText: '請確認查詢範圍',
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '日期',
            color: '#FFFFFF',
          },
          {
            type: 'text',
            text: searchDate,
            color: '#ffffff',
            size: 'xl',
            flex: 3,
            weight: 'bold',
            align: 'start',
          },
        ],
        paddingAll: '20px',
        backgroundColor: '#AAAAAA',
        spacing: 'none',
        height: '85px',
        paddingTop: '22px',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: '起始時間',
                align: 'center',
                color: '#AAAAAA',
              },
              {
                type: 'text',
                text: ' ',
                align: 'center',
              },
              {
                type: 'text',
                text: '結束時間',
                align: 'center',
                color: '#AAAAAA',
              },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: start_time,
                align: 'center',
                color: '#111111',
                weight: 'bold',
                size: 'sm',
              },
              {
                type: 'text',
                text: '~',
                align: 'center',
              },
              {
                type: 'text',
                text: end_time,
                align: 'center',
                weight: 'bold',
                color: '#111111',
                size: 'sm',
              },
            ],
            margin: 'lg',
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'postback',
              label: '查詢',
              data: 'search',
            },
            style: 'primary',
            color: '#AAAAAA',
          },
        ],
      },
      styles: {
        header: {
          backgroundColor: '#AAAAAA',
        },
      },
    },
  });
}
function search(replyToken) {
  const sqlSelect =
    'SELECT * FROM `order` WHERE `date` = ? and `time` >= ? and `time` <= ? ORDER BY `time`';
  db.query(sqlSelect, [searchDate, start_time, end_time], (err, result) => {
    if (err) {
      console.log(err);
      resetSearchOrder();
      PROCESS_MANAGER.resetProcess();
      return client.replyMessage(replyToken, { type: 'text', text: '發生錯誤，請通知管理員' });
    } else {
      if (result.length < 1) {
        return client
          .replyMessage(replyToken, {
            type: 'text',
            text: '目前無預約，請重新點選該功能!',
          })
          .then(() => {
            resetSearchOrder();
            PROCESS_MANAGER.resetProcess();
          });
      } else {
        searchList = result;
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
                  type: 'text',
                  text: '日期',
                  color: '#FFFFFF',
                },
                {
                  type: 'text',
                  text: searchDate,
                  color: '#ffffff',
                  size: 'xl',
                  flex: 3,
                  weight: 'bold',
                  align: 'start',
                },
              ],
              paddingAll: '20px',
              backgroundColor: '#AAAAAA',
              spacing: 'none',
              height: '85px',
              paddingTop: '22px',
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: `當天有${result.length}筆預約`,
                  size: '3xl',
                  weight: 'bold',
                  align: 'center',
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
                    label: '檢視預約',
                    data: 'show',
                    displayText: '我要檢視預約',
                  },
                  color: '#AAAAAA',
                  style: 'link',
                },
                {
                  type: 'button',
                  action: {
                    type: 'postback',
                    label: '結束',
                    data: 'finish',
                  },
                  style: 'primary',
                  color: '#AAAAAA',
                },
              ],
              spacing: 'md',
            },
          },
        });
      }
    }
  });
}
function show(replyToken) {
  if (searchList.length == 1) {
    searchListContent.push({
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'text',
          text: `${searchList[0].time}`,
          size: 'xs',
          gravity: 'center',
          flex: 1,
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
              borderColor: '#AAAAAA',
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
          text: `${searchList[0].name} --${searchList[0].subject}`,
          gravity: 'center',
          flex: 3,
          size: 'sm',
          align: 'start',
        },
      ],
      spacing: 'lg',
      cornerRadius: '30px',
      margin: 'lg',
    });
    return client.replyMessage(replyToken, {
      type: 'flex',
      altText: '查詢結果',
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '查找日期範圍',
              color: '#FFFFFF',
              offsetStart: '7px',
            },
            {
              type: 'box',
              layout: 'baseline',
              contents: [
                {
                  type: 'text',
                  text: start_time,
                  color: '#ffffff',
                  size: 'lg',
                  flex: 3,
                  weight: 'bold',
                  align: 'center',
                },
                {
                  type: 'text',
                  text: '~',
                  color: '#ffffff',
                  size: 'xl',
                  flex: 1,
                  weight: 'bold',
                  align: 'center',
                },
                {
                  type: 'text',
                  text: end_time,
                  color: '#ffffff',
                  size: 'lg',
                  flex: 3,
                  weight: 'bold',
                  align: 'center',
                },
              ],
            },
          ],
          paddingAll: '20px',
          backgroundColor: '#AAAAAA',
          spacing: 'none',
          height: '85px',
          paddingTop: '22px',
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: searchListContent,
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
              color: '#AAAAAA',
            },
          ],
          spacing: 'xs',
        },
      },
    });
  } else {
    searchListContent.push({
      type: 'text',
      text: `總計：${searchList.length} 筆`,
      color: '#b7b7b7',
      size: 'xs',
    });
    searchList.forEach(function (item, index) {
      if (index == 0) {
        searchListContent.push({
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: `${searchList[0].time}`,
              size: 'xs',
              gravity: 'center',
              flex: 1,
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
                  borderColor: '#AAAAAA',
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
              text: `${item.time}  ${item.name} --${item.subject}`,
              gravity: 'center',
              flex: 3,
              size: 'sm',
              align: 'start',
            },
          ],
          spacing: 'lg',
          cornerRadius: '30px',
          margin: 'lg',
        });
        searchListContent.push({
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
                      backgroundColor: '#AAAAAA',
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
              flex: 3,
              size: 'xs',
              color: '#8c8c8c',
            },
          ],
          spacing: 'lg',
          height: '20px',
        });
      } else if (index == searchList.length - 1) {
        searchListContent.push({
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: `${searchList[0].time}`,
              size: 'xs',
              gravity: 'center',
              flex: 1,
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
                  borderColor: '#AAAAAA',
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
              text: `${item.time}  ${item.name} --${item.subject}`,
              gravity: 'center',
              flex: 3,
              size: 'sm',
              align: 'start',
            },
          ],
          spacing: 'lg',
          cornerRadius: '30px',
        });
      } else {
        searchListContent.push({
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: `${searchList[0].time}`,
              size: 'xs',
              gravity: 'center',
              flex: 1,
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
                  borderColor: '#AAAAAA',
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
              text: `${item.time}  ${item.name} --${item.subject}`,
              gravity: 'center',
              flex: 3,
              size: 'sm',
              align: 'start',
            },
          ],
          spacing: 'lg',
          cornerRadius: '30px',
        });
        searchListContent.push({
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
                      backgroundColor: '#AAAAAA',
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
              flex: 3,
              size: 'xs',
              color: '#8c8c8c',
            },
          ],
          spacing: 'lg',
          height: '20px',
        });
      }
    });
    return client.replyMessage(replyToken, {
      type: 'flex',
      altText: '查詢結果',
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '查詢時間範圍',
              color: '#FFFFFF',
              offsetStart: '7px',
            },
            {
              type: 'box',
              layout: 'baseline',
              contents: [
                {
                  type: 'text',
                  text: start_time,
                  color: '#ffffff',
                  size: 'lg',
                  flex: 3,
                  weight: 'bold',
                  align: 'center',
                },
                {
                  type: 'text',
                  text: '~',
                  color: '#ffffff',
                  size: 'xl',
                  flex: 1,
                  weight: 'bold',
                  align: 'center',
                },
                {
                  type: 'text',
                  text: end_time,
                  color: '#ffffff',
                  size: 'lg',
                  flex: 3,
                  weight: 'bold',
                  align: 'center',
                },
              ],
            },
          ],
          paddingAll: '20px',
          backgroundColor: '#AAAAAA',
          spacing: 'none',
          height: '85px',
          paddingTop: '22px',
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: searchListContent,
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
              color: '#AAAAAA',
            },
          ],
          spacing: 'xs',
        },
      },
    });
  }
}
/** 清空資料
 * @description 所有參數回復初始值
 */
function resetSearchOrder() {
  resetSearchList();
  searchDate = '';
  start_time = '';
  end_date = '';
}
function resetSearchList() {
  searchList = [];
  searchListContent = [];
}
function finish(replyToken) {
  resetSearchOrder();
  // 結束流程
  PROCESS_MANAGER.resetProcess();
  return client.replyMessage(replyToken, {
    type: 'text',
    text: '結束-查詢時段流程',
  });
}
module.exports = {
  init_search,
  cancelSearch,
  handleDate,
  handleStartTime,
  handleEndTime,
  search,
  resetSearchOrder,
  resetSearchList,
  show,
  finish,
};
