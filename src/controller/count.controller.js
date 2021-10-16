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

//* sum
let countTotal = 0;
//* LIST
/** 相關預約List */
let countList = [];
/** 相關預約List的Content */
let countListContent = [];
/** 詳細內容的List */
let nodeContent = [];

function init_count(replyToken) {
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
              label: '今天',
              data: 'today',
              displayText: '今天',
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

function cancelCount(replyToken) {
  resetCountOrder();
  // 結束流程
  PROCESS_MANAGER.resetProcess();
  return client.replyMessage(replyToken, {
    type: 'text',
    text: '結束-更改預約流程',
  });
}

function handleToday(replyToken) {
  resetCountOrder();
  const sqlSelect = 'SELECT * FROM `order` WHERE `date` = ? ORDER BY `time` ASC, `endTime` ASC';
  db.query(sqlSelect, [moment().format('YYYY-MM-DD')], (err, result) => {
    if (err) {
      console.log('err', err);
      resetCountOrder();
      PROCESS_MANAGER.resetProcess();
      return client.replyMessage(replyToken, [{ type: 'text', text: '發生錯誤，請通知管理員' }]);
    } else {
      if (result.length <= 1) {
        //單筆
        return client.replyMessage(replyToken, {
          type: 'flex',
          altText: '詳細時程',
          contents: {
            type: 'bubble',
            size: 'mega',
            header: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: '日期',
                      color: '#111111',
                      size: 'sm',
                    },
                    {
                      type: 'text',
                      text: moment().format('YYYY-MM-DD'),
                      color: '#ffffff',
                      size: 'xl',
                      flex: 4,
                      weight: 'bold',
                    },
                  ],
                },
              ],
              paddingAll: '20px',
              backgroundColor: '#4E8FDE',
              spacing: 'md',
              height: '85px',
              paddingTop: '22px',
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: `總計：${result.length} 人`,
                  color: '#b7b7b7',
                  size: 'xs',
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: `${result[0].time}`,
                      size: 'sm',
                      gravity: 'center',
                      weight: 'bold',
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
                          borderColor: '#EF454D',
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
                      text: `${result[0].name}(${result[0].subject}) -- ${result[0].endTime}分鐘`,
                      gravity: 'center',
                      flex: 5,
                      size: 'sm',
                      align: 'start',
                      weight: 'bold',
                    },
                  ],
                  spacing: 'lg',
                  cornerRadius: '30px',
                  margin: 'xl',
                },
                {
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
                              width: '2px',
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
                      flex: 5,
                      size: 'xs',
                      color: '#AAAAAA',
                    },
                  ],
                  spacing: 'lg',
                  height: '20px',
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: '休息',
                      gravity: 'center',
                      size: 'sm',
                      color: '#AAAAAA',
                      align: 'center',
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
                          width: '12px',
                          height: '12px',
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
                      text: '無預約',
                      gravity: 'center',
                      flex: 5,
                      size: 'sm',
                      color: '#AAAAAA',
                    },
                  ],
                  spacing: 'lg',
                  cornerRadius: '30px',
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
                    label: '結束',
                    data: 'finish',
                    displayText: '結束查詢',
                  },
                  style: 'primary',
                  color: '#4E8FDE',
                },
              ],
              spacing: 'xs',
            },
          },
        });
      } else {
        //多筆
        let now = HELPER.diffTime(moment().format('YYYY-MM-DD'), result[0].time);
        let minValue = 0;
        for (let i = 0; i < result.length; i++) {
          let temp = HELPER.diffTime(moment().format('YYYY-MM-DD'), result[i].time);
          if (now > temp) {
            now = temp;
            minValue = i;
          }
        }
        result.forEach(function (item, index) {
          if (index == 0) {
            //第一筆
            nodeContent.push({
              type: 'text',
              text: `總計：${result.length} 人`,
              color: '#b7b7b7',
              size: 'xs',
            }); //總計人數
            nodeContent.push({
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: `${item.time}`,
                  size: 'sm',
                  gravity: 'center',
                  weight: index == minValue && now < 150 ? 'bold' : 'regular',
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
                      borderColor: index == minValue && now < 150 ? '#EF454D' : '#4E8FDE',
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
                  text: `${item.name}(${item.subject}) -- ${item.endTime}分鐘`,
                  gravity: 'center',
                  flex: 5,
                  size: 'sm',
                  align: 'start',
                  weight: index == minValue && now < 150 ? 'bold' : 'regular',
                },
              ],
              spacing: 'lg',
              cornerRadius: '30px',
              margin: 'lg',
            }); //第一筆-節點
            nodeContent.push({
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
                          width: '2px',
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
                  flex: 5,
                  size: 'xs',
                },
              ],
              spacing: 'lg',
              height: '20px',
            }); //流空格-區間線
          } else if (index == result.length - 1) {
            //最後
            nodeContent.push({
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: `${item.time}`,
                  size: 'sm',
                  gravity: 'center',
                  weight: index == minValue && now < 150 ? 'bold' : 'regular',
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
                      borderColor: index == minValue && now < 150 ? '#EF454D' : '#4E8FDE',
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
                  text: `${item.name}(${item.subject}) -- ${item.endTime}分鐘`,
                  gravity: 'center',
                  flex: 5,
                  size: 'sm',
                  align: 'start',
                  weight: index == minValue && now < 150 ? 'bold' : 'regular',
                },
              ],
              spacing: 'lg',
              cornerRadius: '30px',
            }); //最後一筆-節點
            nodeContent.push({
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
                          width: '2px',
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
                  flex: 5,
                  size: 'xs',
                },
              ],
              spacing: 'lg',
              height: '20px',
            }); //流空格-區間線
            nodeContent.push({
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '休息',
                  gravity: 'center',
                  size: 'sm',
                  color: '#AAAAAA',
                  align: 'center',
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
                      width: '12px',
                      height: '12px',
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
                  text: '無預約',
                  gravity: 'center',
                  flex: 5,
                  size: 'sm',
                  color: '#AAAAAA',
                },
              ],
              spacing: 'lg',
              cornerRadius: '30px',
            }); //end 節點
          } else {
            //其他筆
            let pre = result[index - 1];
            if (pre.time == item.time) {
              //與上一筆同時間
              nodeContent.push({
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: ' ',
                    size: 'sm',
                    gravity: 'center',
                    weight: index == minValue && now < 150 ? 'bold' : 'regular',
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
                        borderColor: index == minValue && now < 150 ? '#EF454D' : '#4E8FDE',
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
                    text: `${item.name}(${item.subject}) -- ${item.endTime}分鐘`,
                    gravity: 'center',
                    flex: 5,
                    size: 'sm',
                    align: 'start',
                    weight: index == minValue && now < 150 ? 'bold' : 'regular',
                  },
                ],
                spacing: 'lg',
                cornerRadius: '30px',
              }); //當前-節點
            } else {
              nodeContent.push({
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: `${item.time}`,
                    size: 'sm',
                    gravity: 'center',
                    weight: index == minValue && now < 150 ? 'bold' : 'regular',
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
                        borderColor: index == minValue && now < 150 ? '#EF454D' : '#4E8FDE',
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
                    text: `${item.name}(${item.subject}) -- ${item.endTime}分鐘`,
                    gravity: 'center',
                    flex: 5,
                    size: 'sm',
                    align: 'start',
                    weight: index == minValue && now < 150 ? 'bold' : 'regular',
                  },
                ],
                spacing: 'lg',
                cornerRadius: '30px',
              }); //當前-節點
            }
            nodeContent.push({
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
                          width: '2px',
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
                  flex: 5,
                  size: 'xs',
                },
              ],
              spacing: 'lg',
              height: '20px',
            }); //流空格-區間線
          }
        });
        return client.replyMessage(replyToken, {
          type: 'flex',
          altText: '詳細時程',
          contents: {
            type: 'bubble',
            size: 'mega',
            header: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: '日期',
                      color: '#111111',
                      size: 'md',
                    },
                    {
                      type: 'text',
                      text: moment().format('YYYY-MM-DD'),
                      color: '#ffffff',
                      size: 'xl',
                      flex: 4,
                      weight: 'bold',
                    },
                  ],
                },
              ],
              paddingAll: '20px',
              backgroundColor: '#4E8FDE',
              spacing: 'md',
              height: '85px',
              paddingTop: '22px',
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: nodeContent,
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
                    displayText: '結束查詢',
                  },
                  style: 'primary',
                  color: '#4E8FDE',
                },
              ],
              spacing: 'xs',
            },
          },
        });
      }
    }
  });
}

function handleCurrentWeek(replyToken) {
  resetCountOrder();
  const sqlSelect =
    'SELECT `date`, count(1) AS count FROM `order` WHERE `date` > date_format(?, "%Y-%m-%d") AND `date` < date_format(?, "%Y-%m-%d") GROUP BY year(`date`), month(`date`), day(`date`) ORDER BY year(`date`) ASC, month(`date`) ASC, day(`date`) ASC;';
  db.query(
    sqlSelect,
    [
      moment().startOf('isoWeek').format('YYYY-MM-DD'),
      moment().endOf('isoWeek').format('YYYY-MM-DD'),
    ],
    (err, result) => {
      if (err) {
        resetCountOrder();
        PROCESS_MANAGER.resetProcess();
        return client.replyMessage(replyToken, [{ type: 'text', text: '發生錯誤，請通知管理員' }]);
      } else {
        if (result.length > 0) {
          result.forEach(function (item, index) {
            countList.push(item);
            countTotal += item.count;
            countListContent.push({
              type: 'box',
              layout: 'baseline',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: item.date,
                  color: '#333333',
                  size: 'lg',
                  flex: 4,
                  weight: 'bold',
                  action: {
                    type: 'postback',
                    data: `date#${item.date}`,
                    displayText: `查看${item.date}明細`,
                  },
                },
                {
                  type: 'text',
                  wrap: true,
                  size: 'lg',
                  flex: 1,
                  align: 'end',
                  color: '#4E8FDE',
                  weight: 'bold',
                  text: `${item.count}`,
                  offsetStart: '20px',
                },
                {
                  type: 'text',
                  text: '人',
                  flex: 1,
                  align: 'end',
                  size: 'lg',
                },
              ],
            });
          });
          return client.replyMessage(replyToken, {
            type: 'flex',
            altText: '當週人數統計',
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
                        type: 'text',
                        text: '查詢當週人數',
                        color: '#4E8FDE',
                        size: 'xxl',
                        weight: 'bold',
                        flex: 3,
                      },
                      {
                        type: 'text',
                        text: `共${countTotal}人`,
                        flex: 1,
                        align: 'end',
                        gravity: 'center',
                        size: 'md',
                      },
                    ],
                  },
                  {
                    type: 'text',
                    text: '點選左邊日期可察看明細',
                    color: '#AAAAAA',
                    size: 'md',
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    margin: 'lg',
                    spacing: 'sm',
                    contents: countListContent,
                  },
                  {
                    type: 'separator',
                    margin: 'xl',
                  },
                ],
              },
              footer: {
                type: 'box',
                layout: 'horizontal',
                spacing: 'md',
                contents: [
                  {
                    type: 'button',
                    action: {
                      type: 'postback',
                      label: '更換範圍',
                      data: 'change',
                    },
                    style: 'link',
                    height: 'sm',
                    color: '#4E8FDE',
                    flex: 4,
                  },
                  {
                    type: 'button',
                    style: 'primary',
                    height: 'sm',
                    action: {
                      type: 'postback',
                      label: '結束',
                      data: 'finish',
                      displayText: '結束查詢',
                    },
                    color: '#4E8FDE',
                    flex: 2,
                  },
                ],
              },
            },
          });
        } else {
          resetCountOrder();
          PROCESS_MANAGER.resetProcess();
          return client.replyMessage(replyToken, {
            type: 'text',
            text: '當週目前無預約!',
          });
        }
      }
    }
  );
}

function handleNextWeek(replyToken) {
  resetCountOrder();
  const sqlSelect =
    'SELECT `date`, count(1) AS count FROM `order` WHERE `date` > date_format(?, "%Y-%m-%d") AND `date` < date_format(?, "%Y-%m-%d") GROUP BY year(`date`), month(`date`), day(`date`) ORDER BY year(`date`) ASC, month(`date`) ASC, day(`date`) ASC;';
  db.query(
    sqlSelect,
    [
      moment().startOf('isoWeek').add(7, 'days').format('YYYY-MM-DD'),
      moment().endOf('isoWeek').add(7, 'days').format('YYYY-MM-DD'),
    ],
    (err, result) => {
      if (err) {
        resetCountOrder();
        PROCESS_MANAGER.resetProcess();
        return client.replyMessage(replyToken, [{ type: 'text', text: '發生錯誤，請通知管理員' }]);
      } else {
        if (result.length > 0) {
          result.forEach(function (item, index) {
            countList.push(item);
            countTotal += item.count;
            countListContent.push({
              type: 'box',
              layout: 'baseline',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: item.date,
                  color: '#333333',
                  size: 'lg',
                  flex: 4,
                  weight: 'bold',
                  action: {
                    type: 'postback',
                    data: `date#${item.date}`,
                    displayText: `查看${item.date}明細`,
                  },
                },
                {
                  type: 'text',
                  wrap: true,
                  size: 'lg',
                  flex: 1,
                  align: 'end',
                  color: '#4E8FDE',
                  weight: 'bold',
                  text: `${item.count}`,
                  offsetStart: '20px',
                },
                {
                  type: 'text',
                  text: '人',
                  flex: 1,
                  align: 'end',
                  size: 'lg',
                },
              ],
            });
          });
          return client.replyMessage(replyToken, {
            type: 'flex',
            altText: '下週人數統計',
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
                        type: 'text',
                        text: '查詢下週人數',
                        color: '#4E8FDE',
                        size: 'xxl',
                        weight: 'bold',
                        flex: 3,
                      },
                      {
                        type: 'text',
                        text: `共${countTotal}人`,
                        flex: 1,
                        align: 'end',
                        gravity: 'center',
                        size: 'md',
                      },
                    ],
                  },
                  {
                    type: 'text',
                    text: '點選左邊日期可察看明細',
                    color: '#AAAAAA',
                    size: 'md',
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    margin: 'lg',
                    spacing: 'sm',
                    contents: countListContent,
                  },
                  {
                    type: 'separator',
                    margin: 'xl',
                  },
                ],
              },
              footer: {
                type: 'box',
                layout: 'horizontal',
                spacing: 'md',
                contents: [
                  {
                    type: 'button',
                    action: {
                      type: 'postback',
                      label: '更換範圍',
                      data: 'change',
                    },
                    style: 'link',
                    height: 'sm',
                    color: '#4E8FDE',
                    flex: 4,
                  },
                  {
                    type: 'button',
                    style: 'primary',
                    height: 'sm',
                    action: {
                      type: 'postback',
                      label: '結束',
                      data: 'finish',
                      displayText: '結束查詢',
                    },
                    color: '#4E8FDE',
                    flex: 2,
                  },
                ],
              },
            },
          });
        } else {
          resetCountOrder();
          PROCESS_MANAGER.resetProcess();
          return client.replyMessage(replyToken, {
            type: 'text',
            text: '下週目前無預約!',
          });
        }
      }
    }
  );
}

function change(replyToken) {
  resetCountOrder();
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

function showBooks(replyToken, date) {
  const sqlSelect = 'SELECT * FROM `order` WHERE `date` = ? ORDER BY `time` ASC, `endTime` ASC';
  db.query(sqlSelect, [date], (err, result) => {
    if (err) {
      console.log('err', err);
      resetCountOrder();
      PROCESS_MANAGER.resetProcess();
      return client.replyMessage(replyToken, [{ type: 'text', text: '發生錯誤，請通知管理員' }]);
    } else {
      if (result.length <= 1) {
        //單筆
        return client.replyMessage(replyToken, {
          type: 'flex',
          altText: '詳細時程',
          contents: {
            type: 'bubble',
            size: 'mega',
            header: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: '日期',
                      color: '#111111',
                      size: 'sm',
                    },
                    {
                      type: 'text',
                      text: date,
                      color: '#ffffff',
                      size: 'xl',
                      flex: 4,
                      weight: 'bold',
                    },
                  ],
                },
              ],
              paddingAll: '20px',
              backgroundColor: '#4E8FDE',
              spacing: 'md',
              height: '85px',
              paddingTop: '22px',
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: `總計：${result.length} 人`,
                  color: '#b7b7b7',
                  size: 'xs',
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: `${result[0].time}`,
                      size: 'sm',
                      gravity: 'center',
                      weight: 'bold',
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
                          borderColor: '#EF454D',
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
                      text: `${result[0].name}(${result[0].subject}) -- ${result[0].endTime}分鐘`,
                      gravity: 'center',
                      flex: 5,
                      size: 'sm',
                      align: 'start',
                      weight: 'bold',
                    },
                  ],
                  spacing: 'lg',
                  cornerRadius: '30px',
                  margin: 'xl',
                },
                {
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
                              width: '2px',
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
                      flex: 5,
                      size: 'xs',
                      color: '#AAAAAA',
                    },
                  ],
                  spacing: 'lg',
                  height: '20px',
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: '休息',
                      gravity: 'center',
                      size: 'sm',
                      color: '#AAAAAA',
                      align: 'center',
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
                          width: '12px',
                          height: '12px',
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
                      text: '無預約',
                      gravity: 'center',
                      flex: 5,
                      size: 'sm',
                      color: '#AAAAAA',
                    },
                  ],
                  spacing: 'lg',
                  cornerRadius: '30px',
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
                    label: '結束',
                    data: 'finish',
                    displayText: '結束查詢',
                  },
                  style: 'primary',
                  color: '#4E8FDE',
                },
              ],
              spacing: 'xs',
            },
          },
        });
      } else {
        //多筆
        let now = HELPER.diffTime(date, result[0].time);
        let minValue = 0;
        for (let i = 0; i < result.length; i++) {
          let temp = HELPER.diffTime(date, result[i].time);
          if (now > temp) {
            now = temp;
            minValue = i;
          }
        }
        result.forEach(function (item, index) {
          if (index == 0) {
            //第一筆
            nodeContent.push({
              type: 'text',
              text: `總計：${result.length} 人`,
              color: '#b7b7b7',
              size: 'xs',
            }); //總計人數
            nodeContent.push({
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: `${item.time}`,
                  size: 'sm',
                  gravity: 'center',
                  weight: index == minValue && now < 150 ? 'bold' : 'regular',
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
                      borderColor: index == minValue && now < 150 ? '#EF454D' : '#4E8FDE',
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
                  text: `${item.name}(${item.subject}) -- ${item.endTime}分鐘`,
                  gravity: 'center',
                  flex: 5,
                  size: 'sm',
                  align: 'start',
                  weight: index == minValue && now < 150 ? 'bold' : 'regular',
                },
              ],
              spacing: 'lg',
              cornerRadius: '30px',
              margin: 'lg',
            }); //第一筆-節點
            nodeContent.push({
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
                          width: '2px',
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
                  flex: 5,
                  size: 'xs',
                },
              ],
              spacing: 'lg',
              height: '20px',
            }); //流空格-區間線
          } else if (index == result.length - 1) {
            //最後
            nodeContent.push({
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: `${item.time}`,
                  size: 'sm',
                  gravity: 'center',
                  weight: index == minValue && now < 150 ? 'bold' : 'regular',
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
                      borderColor: index == minValue && now < 150 ? '#EF454D' : '#4E8FDE',
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
                  text: `${item.name}(${item.subject}) -- ${item.endTime}分鐘`,
                  gravity: 'center',
                  flex: 5,
                  size: 'sm',
                  align: 'start',
                  weight: index == minValue && now < 150 ? 'bold' : 'regular',
                },
              ],
              spacing: 'lg',
              cornerRadius: '30px',
            }); //最後一筆-節點
            nodeContent.push({
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
                          width: '2px',
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
                  flex: 5,
                  size: 'xs',
                },
              ],
              spacing: 'lg',
              height: '20px',
            }); //流空格-區間線
            nodeContent.push({
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '休息',
                  gravity: 'center',
                  size: 'sm',
                  color: '#AAAAAA',
                  align: 'center',
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
                      width: '12px',
                      height: '12px',
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
                  text: '無預約',
                  gravity: 'center',
                  flex: 5,
                  size: 'sm',
                  color: '#AAAAAA',
                },
              ],
              spacing: 'lg',
              cornerRadius: '30px',
            }); //end 節點
          } else {
            //其他筆
            let pre = result[index - 1];
            if (pre.time == item.time) {
              //與上一筆同時間
              nodeContent.push({
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: ' ',
                    size: 'sm',
                    gravity: 'center',
                    weight: index == minValue && now < 150 ? 'bold' : 'regular',
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
                        borderColor: index == minValue && now < 150 ? '#EF454D' : '#4E8FDE',
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
                    text: `${item.name}(${item.subject}) -- ${item.endTime}分鐘`,
                    gravity: 'center',
                    flex: 5,
                    size: 'sm',
                    align: 'start',
                    weight: index == minValue && now < 150 ? 'bold' : 'regular',
                  },
                ],
                spacing: 'lg',
                cornerRadius: '30px',
              }); //當前-節點
            } else {
              nodeContent.push({
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: `${item.time}`,
                    size: 'sm',
                    gravity: 'center',
                    weight: index == minValue && now < 150 ? 'bold' : 'regular',
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
                        borderColor: index == minValue && now < 150 ? '#EF454D' : '#4E8FDE',
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
                    text: `${item.name}(${item.subject}) -- ${item.endTime}分鐘`,
                    gravity: 'center',
                    flex: 5,
                    size: 'sm',
                    align: 'start',
                    weight: index == minValue && now < 150 ? 'bold' : 'regular',
                  },
                ],
                spacing: 'lg',
                cornerRadius: '30px',
              }); //當前-節點
            }
            nodeContent.push({
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
                          width: '2px',
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
                  flex: 5,
                  size: 'xs',
                },
              ],
              spacing: 'lg',
              height: '20px',
            }); //流空格-區間線
          }
        });
        return client.replyMessage(replyToken, {
          type: 'flex',
          altText: '詳細時程',
          contents: {
            type: 'bubble',
            size: 'mega',
            header: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: '日期',
                      color: '#111111',
                      size: 'md',
                    },
                    {
                      type: 'text',
                      text: date,
                      color: '#ffffff',
                      size: 'xl',
                      flex: 4,
                      weight: 'bold',
                    },
                  ],
                },
              ],
              paddingAll: '20px',
              backgroundColor: '#4E8FDE',
              spacing: 'md',
              height: '85px',
              paddingTop: '22px',
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: nodeContent,
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
                    displayText: '結束查詢',
                  },
                  style: 'primary',
                  color: '#4E8FDE',
                },
              ],
              spacing: 'xs',
            },
          },
        });
      }
    }
  });
}

/** 清空資料
 * @description 所有參數回復初始值
 */
function resetCountOrder() {
  resetCountList();
  countTotal = 0;
}

function resetCountList() {
  countList = [];
  countListContent = [];
  nodeContent = [];
}

function finish(replyToken) {
  resetCountOrder();
  // 結束流程
  PROCESS_MANAGER.resetProcess();
  return client.replyMessage(replyToken, {
    type: 'text',
    text: '結束-查詢人數流程',
  });
}

module.exports = {
  init_count,
  cancelCount,
  resetCountOrder,
  resetCountList,
  handleToday,
  handleCurrentWeek,
  handleNextWeek,
  showBooks,
  change,
  finish,
};
