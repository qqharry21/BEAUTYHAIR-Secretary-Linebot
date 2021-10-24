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
/** 輸入名字狀態 - show */
let status = false;
/** 查詢預約的狀態 */
let chosenStatus = false;
//* SUM
let showTotal = 0;
//* LIST
/** 相關預約List */
let showList = [];
/** 相關預約List的Content */
let showListContent = [];
//* DATA
let start_date = '';
let end_date = '';
let isSame = false;
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
                      displayText: '依客戶姓名查詢',
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
                      displayText: '依預約日期查詢',
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
      text: '請輸入客戶姓名(可複製以下格式)',
    },
    {
      type: 'text',
      text: 's/',
    },
  ]);
}
function searchDate(replyToken) {
  return client.replyMessage(replyToken, {
    type: 'flex',
    altText: '請選擇查找方式',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '請選擇查找方式',
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
                      type: 'datetimepicker',
                      label: '指定日期',
                      data: 'day',
                      mode: 'date',
                    },
                    color: '#9E4751',
                    style: 'primary',
                  },
                  {
                    type: 'button',
                    action: {
                      type: 'datetimepicker',
                      label: '日期區間',
                      data: 'startDate',
                      mode: 'date',
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

function handleName(replyToken, text) {
  setStatus(false);
  if (text.length > 1) {
    text = text.split('*', 1).shift();
    const sqlSelect = 'SELECT DISTINCT `name` FROM `order` WHERE `name` LIKE CONCAT("%", ?, "%")';

    query(sqlSelect, [text], (err, result) => {
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
        const sqlSelect2 =
          'SELECT `date`, `time`, `subject` FROM `order` WHERE `name` = ? ORDER BY `date` ASC, `time` ASC';
        query(sqlSelect2, [result[0].name], (error, res) => {
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
                text: `預約次數：${res.length}筆`,
                color: '#b7b7b7',
                size: 'xs',
              });
              showListContent.push({
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: res[0].date,
                    size: 'xs',
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
                    text: `${HELPER.timeChange(res[0].time)} --${res[0].subject}`,
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
              showTotal = res.length;
              showListContent.push({
                type: 'text',
                text: `預約次數：${showTotal}筆`,
                color: '#b7b7b7',
                size: 'xs',
              });
              res.forEach(function (item, index) {
                if (index == 0) {
                  //節點
                  showListContent.push({
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'text',
                        text: item.date,
                        size: 'xs',
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
                } else if (index == res.length - 1) {
                  //最後一筆節點
                  showListContent.push({
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'text',
                        text: item.date,
                        size: 'xs',
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
                        size: 'xs',
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
                        // {
                        //   type: 'text',
                        //   text: '客戶姓名',
                        //   size: 'md',
                        //   flex: 1,
                        //   gravity: 'center',
                        //   offsetStart: '35px',
                        //   color: '#AAAAAA',
                        // },
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
                        displayText: '結束查詢',
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
        //找到多個類似姓名的客戶
        result.forEach(function (item, index) {
          showList.push({
            type: 'bubble',
            size: 'micro',
            header: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '請選擇客戶',
                },
              ],
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '客戶姓名',
                  align: 'center',
                  color: '#AAAAAA',
                  size: 'sm',
                },
                {
                  type: 'text',
                  text: item.name,
                  align: 'center',
                  size: 'xxl',
                  weight: 'bold',
                  color: '#9E4751',
                },
                {
                  type: 'separator',
                  margin: 'xl',
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
                    label: '選擇',
                    data: `choose${item.name}`,
                  },
                  color: '#9E4751',
                  style: 'primary',
                },
              ],
            },
          });
        });
        return client
          .replyMessage(replyToken, {
            type: 'flex',
            altText: '選擇類似客戶列表',
            contents: {
              type: 'carousel',
              contents: showList,
            },
          })
          .then(() => {
            setChosenStatus(true);
          });
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

function choose(replyToken, name) {
  setChosenStatus(false);
  console.log('name', name);
  const sqlSelect =
    'SELECT `date`, `time`, `subject` FROM `order` WHERE `name` = ? ORDER BY `date` ASC, `time` ASC';
  query(sqlSelect, [name], (err, result) => {
    if (err) {
      resetShowOrder();
      PROCESS_MANAGER.resetProcess();
      return client.replyMessage(replyToken, {
        type: 'text',
        text: '發生錯誤，請通知管理員',
      });
    } else {
      console.log('res', result);
      if (result.length == 1) {
        showListContent.push({
          type: 'text',
          text: `預約次數：${result.length}筆`,
          color: '#b7b7b7',
          size: 'xs',
        });
        showListContent.push({
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: result[0].date,
              size: 'xs',
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
              text: `${HELPER.timeChange(result[0].time)} --${result[0].subject}`,
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
        showTotal = result.length;
        showListContent.push({
          type: 'text',
          text: `預約次數：${showTotal}筆`,
          color: '#b7b7b7',
          size: 'xs',
        });
        result.forEach(function (item, index) {
          if (index == 0) {
            //節點
            showListContent.push({
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: item.date,
                  size: 'xs',
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
          } else if (index == result.length - 1) {
            //最後一筆節點
            showListContent.push({
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: item.date,
                  size: 'xs',
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
                  size: 'xs',
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
                    text: name,
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
                  displayText: '結束查詢',
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
}

function handleDay(replyToken, date) {
  const sqlSelect = 'SELECT * FROM `order` WHERE `date` = ? ORDER BY `time`';
  query(sqlSelect, [date], (err, result) => {
    if (err) {
      console.log(err);
      resetShowOrder();
      PROCESS_MANAGER.resetProcess();
      return client.replyMessage(replyToken, { type: 'text', text: '發生錯誤，請通知管理員' });
    } else {
      if (result.length < 1) {
        return client
          .replyMessage(replyToken, {
            type: 'text',
            text: '當天無預約，請重新點選該功能!',
          })
          .then(() => {
            resetShowOrder();
            PROCESS_MANAGER.resetProcess();
          });
      } else {
        showListContent.push({
          type: 'text',
          text: `總計：${result.length} 筆`,
          color: '#b7b7b7',
          size: 'xs',
        });
        result.forEach(function (item, index) {
          if (index != 0) {
            if (result[index - 1].time == item.time) {
              isSame = true;
            } else {
              isSame = false;
            }
          }
          if (index == 0) {
            showListContent.push({
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: item.time,
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
                  text: `${item.name} --${item.subject}`,
                  gravity: 'center',
                  flex: 5,
                  size: 'sm',
                  align: 'start',
                },
              ],
              spacing: 'lg',
              cornerRadius: '30px',
              margin: 'lg',
            });
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
                  flex: 5,
                  size: 'xs',
                  color: '#8c8c8c',
                },
              ],
              spacing: 'lg',
              height: '20px',
            });
          } else if (index == result.length - 1) {
            showListContent.push({
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: isSame ? ' ' : item.time,
                  size: 'sm',
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
                  text: `${item.name} --${item.subject}`,
                  gravity: 'center',
                  flex: 5,
                  size: 'sm',
                  align: 'start',
                  weight: 'regular',
                },
              ],
              spacing: 'lg',
              cornerRadius: '30px',
            });
          } else {
            showListContent.push({
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: isSame ? ' ' : item.time,
                  size: 'sm',
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
                  text: `${item.name} --${item.subject}`,
                  gravity: 'center',
                  flex: 5,
                  size: 'sm',
                  align: 'start',
                  weight: 'regular',
                },
              ],
              spacing: 'lg',
              cornerRadius: '30px',
            });
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
                  flex: 5,
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
                  text: date,
                  color: '#ffffff',
                  size: 'xl',
                  flex: 3,
                  weight: 'bold',
                  align: 'start',
                },
              ],
              paddingAll: '20px',
              backgroundColor: '#9E4751',
              spacing: 'none',
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
    }
  });
}

function handleStartDate(replyToken, date) {
  start_date = date;
  return client.replyMessage(replyToken, {
    type: 'flex',
    altText: '請選擇結束日期',
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'baseline',
        contents: [
          {
            type: 'text',
            text: '日期範圍',
            color: '#ffffff',
            weight: 'bold',
            size: 'lg',
          },
        ],
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
                text: '起始日期',
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
                text: '結束日期',
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
                text: start_date,
                align: 'center',
                color: '#9E4751',
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
                text: ' ',
                align: 'center',
                weight: 'bold',
                color: '#9E4751',
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
              type: 'datetimepicker',
              label: '選擇結束日期',
              data: 'endDate',
              mode: 'date',
              min: start_date,
            },
            style: 'primary',
            color: '#9E4751',
          },
        ],
      },
      styles: {
        header: {
          backgroundColor: '#9E4751',
        },
      },
    },
  });
}

function handleEndDate(replyToken, date) {
  end_date = date;
  return client.replyMessage(replyToken, {
    type: 'flex',
    altText: '請選擇結束日期',
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'baseline',
        contents: [
          {
            type: 'text',
            text: '日期範圍',
            color: '#ffffff',
            weight: 'bold',
            size: 'lg',
          },
        ],
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
                text: '起始日期',
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
                text: '結束日期',
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
                text: start_date,
                align: 'center',
                color: '#9E4751',
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
                text: end_date,
                align: 'center',
                weight: 'bold',
                color: '#9E4751',
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
            color: '#9E4751',
          },
        ],
      },
      styles: {
        header: {
          backgroundColor: '#9E4751',
        },
      },
    },
  });
}

function searchRange(replyToken) {
  resetShowList();
  const sqlSelect =
    'SELECT * FROM `order` WHERE `date` >= ? AND `date` <= ? ORDER BY `date` ASC, `time` ASC';
  query(sqlSelect, [start_date, end_date], (err, result) => {
    if (err) {
      resetShowOrder();
      PROCESS_MANAGER.resetProcess();
      return client.replyMessage(replyToken, [{ type: 'text', text: '發生錯誤，請通知管理員' }]);
    } else {
      showListContent.push({
        type: 'text',
        text: `總計：${result.length} 筆`,
        color: '#b7b7b7',
        size: 'xs',
      });
      result.forEach(function (item, index) {
        if (index == 0) {
          showListContent.push({
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: item.date.split('-', 2).pop() + '/' + item.date.split('-', 3).pop(),
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
                flex: 3,
                size: 'xs',
                color: '#8c8c8c',
              },
            ],
            spacing: 'lg',
            height: '20px',
          });
        } else if (index == result.length - 1) {
          showListContent.push({
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: item.date.split('-', 2).pop() + '/' + item.date.split('-', 3).pop(),
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
          showListContent.push({
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: item.date.split('-', 2).pop() + '/' + item.date.split('-', 3).pop(),
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
          size: 'giga',
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
                    text: start_date,
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
                    text: end_date,
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
            backgroundColor: '#9E4751',
            spacing: 'none',
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
            layout: 'horizontal',
            contents: [
              {
                type: 'button',
                action: {
                  type: 'postback',
                  label: '繼續查詢',
                  data: 'continue',
                },
                style: 'link',
                color: '#9E4751',
              },
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
}

/** 清空資料
 * @description 所有參數回復初始值
 */
function resetShowOrder() {
  setStatus(false);
  setChosenStatus(false);
  resetShowList();
  showTotal = 0;
  start_date = '';
  end_date = '';
  isSame = false;
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
    text: '結束-查詢條件流程',
  });
}

/** 設置輸入名字流程 */
function setStatus(process) {
  status = process;
}

function getStatus() {
  return status;
}

/** 設置選擇欲更改預約的狀態
 * @true 已抓取List
 * @false 抓取List發生錯誤
 */
function setChosenStatus(process) {
  chosenStatus = process;
}

/** 抓取選擇欲更改預約的狀態 */
function getChosenStatus() {
  return chosenStatus;
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
  setChosenStatus,
  getChosenStatus,
  choose,
  handleStartDate,
  handleEndDate,
  handleDay,
  searchRange,
  finish,
  handleName,
};
