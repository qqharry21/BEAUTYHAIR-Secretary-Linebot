/** @format */

const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET'],
});
const query = require('../config/config');
const HELPER = require('../helper/commonFunction');
const PROCESS_MANAGER = require('../manager/processManager');

//* STATUS
/** 輸入名字狀態 - cancel */
let status = false;
/** 選取預約的狀態 */
let chosenStatus = false;
//* LIST
/** 相關預約List */
let cancelList = [];
/** 相關預約List的Content */
let cancelListContent = [];
let cancelListPageContent = [];
//* OBJECT
/** 取消的預約資料 */
let cancelOrder = {
  cid: '',
  cancelName: '',
  cancelDate: '',
  cancelTime: '',
  cancelEndTime: '',
  cancelSubject: '',
};
//* FUNCTION
/** 確認-取消預約
 * @description 請輸入預約的客戶姓名
 */
function init_cancel(replyToken) {
  setStatus(true);
  return client.replyMessage(replyToken, [
    {
      type: 'text',
      text: '請輸入客戶姓名(可複製以下格式)',
    },
    {
      type: 'text',
      text: 'c/',
    },
  ]);
}

function cancel(replyToken) {
  resetCancelOrder();
  // 結束流程
  PROCESS_MANAGER.resetProcess();
  return client.replyMessage(replyToken, {
    type: 'text',
    text: '結束-取消預約流程',
  });
}

/** 處理姓名輸入
 * @param text 輸入字串
 * @description
 * 有資料=>選取其中一筆 ; 無資料=>跳出無資料訊息
 */
function handleName(replyToken, text) {
  setStatus(false);
  //? 客戶姓名是否輸入大於兩個字
  if (text.length > 1) {
    const sqlSelect =
      'SELECT `id`, `name`, `date`, `time`, `endTime`, `subject` FROM `order` WHERE `name` LIKE CONCAT(?, "%") AND `date` > NOW() ORDER BY ABS( DATEDIFF( `date`, NOW() ) ) ,`create_time` DESC';
    query(sqlSelect, [text], (err, result) => {
      //? 是否有抓到相符資料
      if (result.length > 0) {
        //? 是否小於等於10筆
        if (result.length <= 10) {
          result.forEach(function (item, index) {
            cancelList.push(item);
            cancelListContent.push({
              type: 'bubble',
              body: {
                type: 'box',
                layout: 'vertical',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: `預約明細-${index + 1}`,
                    wrap: true,
                    weight: 'bold',
                    size: 'xxl',
                    color: '#B387DE',
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
                            text: item.name,
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
                            text: item.date,
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
                            text: HELPER.timeChange(item.time),
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
                            text: item.endTime + '分鐘',
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
                            text: item.subject,
                            size: 'lg',
                            color: '#111111',
                            align: 'end',
                            weight: 'bold',
                            gravity: 'center',
                          },
                        ],
                      },
                    ],
                    spacing: 'sm',
                    margin: 'md',
                  },
                ],
              },
              footer: {
                type: 'box',
                layout: 'vertical',
                spacing: 'sm',
                contents: [
                  {
                    type: 'button',
                    action: {
                      type: 'postback',
                      label: '選擇',
                      data: `choose${index}`,
                    },
                    color: '#B387DE',
                    style: 'primary',
                  },
                ],
              },
            });
          });
          return client
            .replyMessage(replyToken, [
              {
                type: 'flex',
                altText: '該客戶相關預約列表',
                contents: {
                  type: 'carousel',
                  contents: cancelListContent,
                },
              },
            ])
            .then(() => {
              setChosenStatus(true);
            });
        } else {
          let page = parseInt(result.length / 10) + 1;
          //page button
          for (let i = 0; i < page; i++)
            cancelListPageContent.push({
              type: 'button',
              flex: 2,
              style: i % 2 == 0 ? 'primary' : 'link',
              color: '#B387DE',
              action: {
                type: 'postback',
                label: '第' + (i + 1) + '頁',
                data: `moreCancelPage${i + 1}`,
              },
            });
          //塞值去陣列
          result.forEach(function (item, index) {
            cancelList.push(item);
            if (index != 0 && index % 10 == 0) {
              cancelListContent.push({
                type: 'bubble',
                body: {
                  type: 'box',
                  layout: 'vertical',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'text',
                      text: 'See More',
                      wrap: true,
                      weight: 'bold',
                      size: 'xxl',
                      color: '#B387DE',
                      align: 'center',
                    },
                    {
                      type: 'text',
                      text: '總共' + (result.length + 1) + '幾筆',
                      wrap: true,
                      weight: 'bold',
                      size: 'lg',
                      flex: 0,
                      align: 'center',
                    },
                    {
                      type: 'text',
                      text: '10筆為一頁，請選擇檢視指定頁數',
                      wrap: true,
                      size: 'xxs',
                      margin: 'md',
                      color: '#111111',
                      flex: 0,
                      align: 'center',
                    },
                    {
                      type: 'separator',
                      margin: 'xxl',
                    },
                  ],
                },
                footer: {
                  type: 'box',
                  layout: 'vertical',
                  spacing: 'sm',
                  contents: cancelListPageContent,
                },
              });
              cancelListContent.push({
                type: 'bubble',
                body: {
                  type: 'box',
                  layout: 'vertical',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'text',
                      text: `預約明細-${index + 1}`,
                      wrap: true,
                      weight: 'bold',
                      size: 'xxl',
                      color: '#B387DE',
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
                              text: item.name,
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
                              text: item.date,
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
                              text: HELPER.timeChange(item.time),
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
                              text: item.endTime + '分鐘',
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
                              text: item.subject,
                              size: 'lg',
                              color: '#111111',
                              align: 'end',
                              weight: 'bold',
                              gravity: 'center',
                            },
                          ],
                        },
                      ],
                      spacing: 'sm',
                      margin: 'md',
                    },
                  ],
                },
                footer: {
                  type: 'box',
                  layout: 'vertical',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'button',
                      action: {
                        type: 'postback',
                        label: '選擇',
                        data: `choose${index}`,
                      },
                      color: '#B387DE',
                      style: 'primary',
                    },
                  ],
                },
              });
            } else {
              cancelListContent.push({
                type: 'bubble',
                body: {
                  type: 'box',
                  layout: 'vertical',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'text',
                      text: `預約明細-${index + 1}`,
                      wrap: true,
                      weight: 'bold',
                      size: 'xxl',
                      color: '#B387DE',
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
                              text: item.name,
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
                              text: item.date,
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
                              text: HELPER.timeChange(item.time),
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
                              text: item.endTime + '分鐘',
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
                              text: item.subject,
                              size: 'lg',
                              color: '#111111',
                              align: 'end',
                              weight: 'bold',
                              gravity: 'center',
                            },
                          ],
                        },
                      ],
                      spacing: 'sm',
                      margin: 'md',
                    },
                  ],
                },
                footer: {
                  type: 'box',
                  layout: 'vertical',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'button',
                      action: {
                        type: 'postback',
                        label: '選擇',
                        data: `choose${index}`,
                      },
                      color: '#B387DE',
                      style: 'primary',
                    },
                  ],
                },
              });
            }
          });
          return client
            .replyMessage(replyToken, [
              {
                type: 'flex',
                altText: '該客戶相關預約列表',
                contents: {
                  type: 'carousel',
                  contents: cancelListContent.slice(0, 11),
                },
              },
            ])
            .then(() => {
              setChosenStatus(true);
            });
        }
      } else {
        return client
          .replyMessage(replyToken, {
            type: 'text',
            text: '未找到該客戶的預約，請重新點選該功能!',
          })
          .then(() => {
            resetCancelOrder();
            PROCESS_MANAGER.resetProcess();
          });
      }
    });
  } else {
    resetCancelOrder();
    PROCESS_MANAGER.resetProcess();
    return client.replyMessage(replyToken, {
      type: 'text',
      text: '名字輸入太短，至少兩個字，請重新點選該功能!',
    });
  }
}

/** 多筆相符客戶
 * @param page 總頁數
 */
function moreCancelPage(replyToken, page) {
  if (cancelList.length - 0 + (page - 1) * 11 > 11) {
    return client
      .replyMessage(replyToken, [
        {
          type: 'flex',
          altText: '該客戶相關預約列表',
          contents: {
            type: 'carousel',
            contents: cancelListContent.slice(0 + (page - 1) * 11, 11 + (page - 1) * 11),
          },
        },
      ])
      .then(() => {
        setChosenStatus(true);
      });
  } else {
    return client
      .replyMessage(replyToken, [
        {
          type: 'flex',
          altText: '該客戶相關預約列表',
          contents: {
            type: 'carousel',
            contents: cancelListContent.slice(0 + (page - 1) * 11, cancelList.length),
          },
        },
      ])
      .then(() => {
        setChosenStatus(true);
      });
  }
}

/** 選擇預約後
 * @from cancelList
 * @param index Array 位置
 * @return message
 * @description 選擇欲取消的預約內容
 */
function choose(replyToken, index) {
  // 防止再次點選其他預約選項
  setChosenStatus(false);
  // 將該筆存下至Object
  setCancelOrder(
    cancelList[index].id,
    cancelList[index].name,
    cancelList[index].date,
    cancelList[index].time,
    cancelList[index].endTime,
    cancelList[index].subject
  );
  return client.replyMessage(replyToken, [
    {
      type: 'flex',
      altText: '請確認欲取消預約內容',
      contents: {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '請確認欲取消預約內容',
            },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'lg',
              spacing: 'sm',
              contents: [
                {
                  type: 'box',
                  layout: 'baseline',
                  contents: [
                    {
                      type: 'text',
                      text: '客戶姓名',
                      color: '#333333',
                      size: 'sm',
                      flex: 2,
                      weight: 'bold',
                    },
                    {
                      type: 'text',
                      text: getCancelName(),
                      weight: 'bold',
                      size: 'xxl',
                      color: '#B387DE',
                      flex: 3,
                      align: 'end',
                    },
                  ],
                },
                {
                  type: 'box',
                  layout: 'baseline',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'text',
                      text: '日期 / 時間',
                      color: '#333333',
                      size: 'sm',
                      flex: 2,
                      weight: 'bold',
                    },
                    {
                      type: 'text',
                      text: getCancelDate() + ' / ' + HELPER.timeChange(getCancelTime()),
                      wrap: true,
                      size: 'md',
                      flex: 5,
                      align: 'end',
                      color: '#111111',
                      weight: 'bold',
                    },
                  ],
                },
                {
                  type: 'box',
                  layout: 'baseline',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'text',
                      text: '服務時程 / 項目',
                      color: '#333333',
                      size: 'sm',
                      flex: 2,
                      weight: 'bold',
                    },
                    {
                      type: 'text',
                      text: getCancelEndTime() + '分鐘' + ' / ' + getCancelSubject(),
                      wrap: true,
                      color: '#111111',
                      size: 'md',
                      flex: 3,
                      align: 'end',
                      weight: 'bold',
                    },
                  ],
                },
              ],
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
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              action: {
                type: 'postback',
                label: '更換',
                data: 'change',
              },
              style: 'primary',
              height: 'sm',
              color: '#B387DE',
            },
            {
              type: 'button',
              action: {
                type: 'postback',
                label: '取消',
                data: 'cancel',
              },
              style: 'link',
              height: 'sm',
              color: '#B387DE',
            },
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                type: 'postback',
                label: '確定取消',
                data: 'submit',
                displayText: '確認取消',
              },
              color: '#B387DE',
              flex: 2,
            },
          ],
          flex: 0,
        },
      },
    },
  ]);
  // .then(() => {
  //   setSelectStatus(true);
  // });
}

/** 更換預約*/
function change(replyToken) {
  if (cancelList.length < 10) {
    return client
      .replyMessage(replyToken, [
        {
          type: 'flex',
          altText: '該客戶相關預約列表',
          contents: {
            type: 'carousel',
            contents: cancelListContent,
          },
        },
      ])
      .then(() => {
        setChosenStatus(true);
      });
  } else {
    return client
      .replyMessage(replyToken, [
        {
          type: 'flex',
          altText: '該客戶相關預約列表',
          contents: {
            type: 'carousel',
            contents: cancelListContent.slice(0, 11),
          },
        },
      ])
      .then(() => {
        setChosenStatus(true);
      });
  }
}

/** 確認取消*/
function submitCancel(replyToken) {
  const sqlSelect = 'DELETE FROM `order` WHERE `id` = ?';
  query(sqlSelect, [cancelOrder.cid], (err, result) => {
    if (err) {
      resetCancelOrder();
      PROCESS_MANAGER.resetProcess();
      return client.replyMessage(replyToken, [
        { type: 'text', text: '取消中...' },
        { type: 'text', text: '發生錯誤，請通知管理員' },
      ]);
    } else {
      PROCESS_MANAGER.resetProcess();
      return client.replyMessage(replyToken, [
        { type: 'text', text: '取消中...' },
        {
          type: 'flex',
          altText: '成功取消預約',
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
                      url: 'https://img.icons8.com/cotton/64/000000/cancel--v1.png',
                      size: 'xs',
                      position: 'relative',
                      align: 'start',
                      flex: 1,
                    },
                    {
                      type: 'text',
                      text: '成功取消預約',
                      weight: 'bold',
                      size: 'xxl',
                      margin: 'none',
                      color: '#B387DE',
                      decoration: 'none',
                      align: 'end',
                      gravity: 'center',
                      flex: 4,
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
                          text: getCancelName(),
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
                          text: getCancelDate(),
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
                          text: HELPER.timeChange(getCancelTime()),
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
                          text: getCancelEndTime() + '分鐘',
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
                          text: getCancelSubject(),
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
          },
        },
      ]);
    }
  });
}

/** 清空資料
 * @description 所有參數回復初始值
 */
function resetCancelOrder() {
  setStatus(false);
  setChosenStatus(false);
  resetCancelList();
  setCancelName('');
  setCancelDate('');
  setCancelTime('');
  setCancelEndTime('');
  setCancelSubject('');
}

/** 設置名字輸入狀態
 * @true 允許輸入c/xx
 * @false 不允許輸入c/xx
 */
function setStatus(process) {
  status = process;
}

/** 抓取名字輸入狀態 */
function getStatus() {
  return status;
}

/** 設置選擇欲取消預約的狀態
 * @true 已抓取List
 * @false 抓取List發生錯誤
 */
function setChosenStatus(process) {
  chosenStatus = process;
}

/** 抓取選擇欲取消預約的狀態 */
function getChosenStatus() {
  return chosenStatus;
}

function setCancelOrder(id, name, date, time, endTime, subject) {
  cancelOrder.cid = id;
  setCancelName(name);
  setCancelDate(date);
  setCancelTime(time);
  setCancelEndTime(endTime);
  setCancelSubject(subject);
}

/** 設置該欲取消的客戶姓名 */
function setCancelName(data) {
  cancelOrder.cancelName = data;
}

function getCancelName() {
  return cancelOrder.cancelName;
}

function setCancelDate(data) {
  cancelOrder.cancelDate = data;
}

function getCancelDate() {
  return cancelOrder.cancelDate;
}

function setCancelTime(data) {
  cancelOrder.cancelTime = data;
}

function getCancelTime() {
  return cancelOrder.cancelTime;
}

function setCancelEndTime(data) {
  cancelOrder.cancelEndTime = data;
}

function getCancelEndTime() {
  return cancelOrder.cancelEndTime;
}

function setCancelSubject(data) {
  cancelOrder.cancelSubject = data;
}

function getCancelSubject() {
  return cancelOrder.cancelSubject;
}

function resetCancelList() {
  cancelList = [];
  cancelListContent = [];
  cancelListPageContent = [];
}

module.exports = {
  cancelOrder,
  init_cancel,
  cancel,
  handleName,
  moreCancelPage,
  choose,
  change,
  submitCancel,
  setStatus,
  getStatus,
  setChosenStatus,
  getChosenStatus,
  setCancelOrder,
  setCancelName,
  getCancelName,
  setCancelDate,
  getCancelDate,
  setCancelTime,
  getCancelTime,
  setCancelEndTime,
  getCancelEndTime,
  setCancelSubject,
  getCancelSubject,
  resetCancelOrder,
  resetCancelList,
};
