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
/** 輸入名字狀態 - modify */
let status = false;
/** 選取預約的狀態 */
let chosenStatus = false;
/** 輸入更改後的名字狀態 */
let nameStatus = false;
/** 選取更改subject時的狀態 */
let subjectStatus_modify = false;
//* LIST
/** 相關預約List */
let modifyList = [];
/** 相關預約List的Content */
let modifyListContent = [];
let modifyListPageContent = [];
//* OBJECT
/** 更改的預約資料 */
let newOrder = {
  mid: '',
  newName: '',
  newDate: '',
  newTime: '',
  newEndTime: '',
  newSubject: '',
};
//* FUNCTION
/** 確認-更改預約
 * @description 請輸入預約的客戶姓名
 */
function init_modify(replyToken) {
  setStatus(true);
  return client.replyMessage(replyToken, [
    {
      type: 'text',
      text: '請輸入客戶姓名(可複製以下格式)',
    },
    {
      type: 'text',
      text: 'm/',
    },
  ]);
}

/** 取消-更改預約
 * @description 取消更改預約流程
 */
function cancelModify(replyToken) {
  resetNewOrder();
  // 結束流程
  PROCESS_MANAGER.resetProcess();
  return client.replyMessage(replyToken, {
    type: 'text',
    text: '結束-更改預約流程',
  });
}

/** 清空資料
 * @description 所有參數回復初始值
 */
function resetNewOrder() {
  setStatus(false);
  setChosenStatus(false);
  setNameStatus(false);
  setSubjectStatus_Modify(false);
  resetModifyList();
  resetModifyListContent();
  setNewName('');
  setNewDate('');
  setNewTime('');
  setNewEndTime('');
  setNewSubject('');
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
    text = text.split('*', 1).shift();
    const sqlSelect =
      'SELECT `id`, `name`, `date`, `time`, `endTime`, `subject` FROM `order` WHERE `name` LIKE CONCAT("%", ?, "%") AND `date` > NOW() ORDER BY ABS( DATEDIFF( `date`, NOW() ) ) ,`create_time` DESC';
    query(sqlSelect, [text], (err, result) => {
      //? 是否有抓到相符資料
      if (result.length > 0) {
        //? 是否小於等於10筆
        if (result.length <= 10) {
          result.forEach(function (item, index) {
            modifyList.push(item);
            modifyListContent.push({
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
                    color: '#87e8de',
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
                    color: '#87e8de',
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
                  contents: modifyListContent,
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
            modifyListPageContent.push({
              type: 'button',
              flex: 2,
              style: i % 2 == 0 ? 'primary' : 'link',
              color: '#87e8de',
              action: {
                type: 'postback',
                label: '第' + (i + 1) + '頁',
                data: `moreModifyPage${i + 1}`,
              },
            });
          //塞值去陣列
          result.forEach(function (item, index) {
            modifyList.push(item);
            if (index != 0 && index % 10 == 0) {
              modifyListContent.push({
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
                      color: '#87e8de',
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
                  contents: modifyListPageContent,
                },
              });
              modifyListContent.push({
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
                      color: '#87e8de',
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
                      color: '#87e8de',
                      style: 'primary',
                    },
                  ],
                },
              });
            } else {
              modifyListContent.push({
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
                      color: '#87e8de',
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
                      color: '#87e8de',
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
                  contents: modifyListContent.slice(0, 11),
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
            resetNewOrder();
            PROCESS_MANAGER.resetProcess();
          });
      }
    });
  } else {
    resetNewOrder();
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
function moreModifyPage(replyToken, page) {
  if (modifyList.length - 0 + (page - 1) * 11 > 11) {
    return client
      .replyMessage(replyToken, [
        {
          type: 'flex',
          altText: '該客戶相關預約列表',
          contents: {
            type: 'carousel',
            contents: modifyListContent.slice(0 + (page - 1) * 11, 11 + (page - 1) * 11),
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
            contents: modifyListContent.slice(0 + (page - 1) * 11, modifyList.length),
          },
        },
      ])
      .then(() => {
        setChosenStatus(true);
      });
  }
}

/** 選擇預約後
 * @from modifyList
 * @param index Array 位置
 * @return message
 * @description 選擇欲更改的預約內容
 */
function choose(replyToken, index) {
  // 防止再次點選其他預約選項
  setChosenStatus(false);
  // 將該筆存下至Object
  setNewOrder(
    modifyList[index].id,
    modifyList[index].name,
    modifyList[index].date,
    modifyList[index].time,
    modifyList[index].endTime,
    modifyList[index].subject
  );
  return client.replyMessage(replyToken, [
    {
      type: 'flex',
      altText: '請選擇欲更改內容',
      contents: {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: getNewName(),
              weight: 'bold',
              size: 'xxl',
              color: '#87e8de',
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
                      text: getNewDate() + ' / ' + HELPER.timeChange(getNewTime()),
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
                      text: getNewEndTime() + '分鐘' + ' / ' + getNewSubject(),
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
              type: 'text',
              text: '請選擇欲更改內容',
              align: 'center',
              size: 'sm',
              offsetTop: '6px',
              color: '#aaaaaa',
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
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                type: 'postback',
                label: '客戶姓名',
                data: 'modifyName',
                displayText: '更改客戶姓名',
              },
              color: '#87e8de',
            },
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                label: '預約日期',
                type: 'datetimepicker',
                mode: 'date',
                initial: moment().format('YYYY-MM-DD'),
                max: moment().add(6, 'months').format('YYYY-MM-DD'),
                min: moment().format('YYYY-MM-DD'),
                data: 'modifyDate',
              },
              color: '#87e8de',
            },
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                label: '預約時間',
                type: 'datetimepicker',
                mode: 'time',
                initial: '10:00',
                data: 'modifyTime',
              },
              color: '#87e8de',
            },
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                type: 'postback',
                label: '服務時程',
                data: 'modifyEndTime',
                displayText: '更改服務時程',
              },
              color: '#87e8de',
            },
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                type: 'postback',
                label: '服務項目',
                data: 'modifySubject',
                displayText: '更改服務項目',
              },
              color: '#87e8de',
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

/** 重新輸入名字
 * @return message
 * @description 請重新填寫客戶姓名
 */
function modify_modifyName(replyToken) {
  setNameStatus(true);
  return client.replyMessage(replyToken, [
    {
      type: 'text',
      text: '請重新填寫客戶姓名(格式為b/xx)',
    },
  ]);
}

/** 處理更改後的客戶姓名
 * @param text 更改後的客戶姓名
 * @description 確認名字是否正確
 */
function handleModifyName(replyToken, text) {
  // 取消modify輸入名字狀態
  setNameStatus(false);
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
              label: '確認',
              type: 'postback',
              data: 'confirm',
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
        setNewName(text);
      });
  } else {
    resetNewOrder();
    PROCESS_MANAGER.resetProcess();
    return client.replyMessage(replyToken, {
      type: 'text',
      text: '名字輸入太短，至少兩個字，請重新點選該功能!',
    });
  }
}

/** 處理更改後的預約日期
 * @param postback 選擇更改的預約日期
 * @description 確認日期是否正確
 */
function modifyDate(replyToken, postback) {
  //? 有選擇日期 且 未存下選擇的日期時
  if (postback.params.date && getNewDate() == '') {
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
              label: '確認',
              type: 'postback',
              data: 'confirm',
            },
            {
              label: '修改',
              type: 'datetimepicker',
              mode: 'date',
              initial: moment().format('YYYY-MM-DD'),
              max: moment().add(6, 'months').format('YYYY-MM-DD'),
              min: moment().format('YYYY-MM-DD'),
              data: 'modifyDate',
            },
          ],
        },
      })
      .then(() => {
        // 存入日期
        setNewDate(postback.params.date);
      });
  }
}

/** 處理更改後的預約時間
 * @param postback 選擇更改的預約時間
 * @description 確認時間是否正確
 */
function modifyTime(replyToken, postback) {
  // 有選擇時間 且 未存下選擇的時間時
  if (postback.params.time && getNewTime() == '') {
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
              data: 'confirm',
            },
            {
              label: '修改',
              type: 'datetimepicker',
              mode: 'time',
              initial: '10:00',
              data: 'modifyTime',
            },
          ],
        },
      })
      .then(() => {
        // 存入時間
        setNewTime(postback.params.time);
      });
  }
}

/** 選擇欲更改的服務時程
 * @description 選擇服務時程
 */
function modifyEndTime(replyToken) {
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

/** 選擇欲更改的服務項目
 * @description 選擇項目
 */
function modifySubject(replyToken) {
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

/** 確認更改內容
 * @return
 * @description 可再點選其他欲更改項目
 */
function confirmModify(replyToken) {
  return client.replyMessage(replyToken, [
    {
      type: 'flex',
      altText: '請確認更改內容',
      contents: {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '請確認更改內容',
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
                      text: getNewName(),
                      weight: 'bold',
                      size: 'xxl',
                      color: '#87e8de',
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
                      text: getNewDate() + ' / ' + getNewTime(),
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
                      text: getNewEndTime() + '分鐘' + ' / ' + getNewSubject(),
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
              type: 'text',
              text: '請選擇欲更改內容',
              align: 'center',
              size: 'sm',
              offsetTop: '6px',
              color: '#aaaaaa',
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
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                type: 'postback',
                label: '客戶姓名',
                data: 'modifyName',
                displayText: '更改客戶姓名',
              },
              color: '#87e8de',
            },
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                label: '預約日期',
                type: 'datetimepicker',
                mode: 'date',
                initial: moment().format('YYYY-MM-DD'),
                max: moment().add(6, 'months').format('YYYY-MM-DD'),
                min: moment().format('YYYY-MM-DD'),
                data: 'modifyDate',
              },
              color: '#87e8de',
            },
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                label: '預約時間',
                type: 'datetimepicker',
                mode: 'time',
                initial: '10:00',
                data: 'modifyTime',
              },
              color: '#87e8de',
            },
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                type: 'postback',
                label: '服務時程',
                data: 'modifyEndTime',
                displayText: '更改服務時程',
              },
              color: '#87e8de',
            },
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                type: 'postback',
                label: '服務項目',
                data: 'modifySubject',
                displayText: '更改服務項目',
              },
              color: '#87e8de',
            },
            {
              type: 'button',
              action: {
                type: 'postback',
                label: '確認更改',
                data: 'check',
              },
              style: 'primary',
              height: 'sm',
              color: '#111111',
            },
          ],
          flex: 0,
        },
      },
    },
  ]);
}

/** 送交，存入DB
 * @return
 * @description
 */
function submitModify(replyToken) {
  const sqlSelect =
    'UPDATE `order` SET `name` = ? , `date` = ? , `time` = ? , `endTime` = ? , `subject` = ? WHERE `id` = ?';
  query(
    sqlSelect,
    [
      newOrder.newName,
      newOrder.newDate,
      newOrder.newTime,
      newOrder.newEndTime,
      newOrder.newSubject,
      newOrder.mid,
    ],
    (err, result) => {
      if (err) {
        resetNewOrder();
        PROCESS_MANAGER.resetProcess();
        return client.replyMessage(replyToken, [
          { type: 'text', text: '更改中...' },
          { type: 'text', text: '發生錯誤，請通知管理員' },
        ]);
      } else {
        PROCESS_MANAGER.resetProcess();
        return client.replyMessage(replyToken, [
          { type: 'text', text: '更改中...' },
          {
            type: 'flex',
            altText: '成功更改',
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
                        text: '更改成功',
                        weight: 'bold',
                        size: '32px',
                        margin: 'none',
                        color: '#87e8de',
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
                            text: newOrder.newName,
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
                            text: newOrder.newDate,
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
                            text: HELPER.timeChange(newOrder.newTime),
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
                            text: newOrder.newEndTime + '分鐘',
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
                            text: newOrder.newSubject,
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
    }
  );
}

/** 檢查是否有同時段客戶 */
function checkIsTimeConflict(replyToken) {
  const sqlSelect = 'SELECT * FROM `order` WHERE `date`= ? AND `time` LIKE CONCAT( ?, "%")';
  query(sqlSelect, [getNewDate(), getNewTime()], (err, result) => {
    if (result.length > 0) {
      return client.replyMessage(replyToken, {
        type: 'template',
        altText: '同時段已有' + result.length + '個客戶',
        template: {
          type: 'confirm',
          text: '同時段已有' + result.length + '個客戶，是否要繼續更改?',
          actions: [
            {
              label: '更改',
              type: 'postback',
              data: 'submit',
            },
            {
              label: '取消更改',
              type: 'postback',
              data: 'cancel',
            },
          ],
        },
      });
    } else {
      submitModify(replyToken);
    }
  });
}

/** 設置名字輸入狀態
 * @true 允許輸入m/xx
 * @false 不允許輸入m/xx
 */
function setStatus(process) {
  status = process;
}

/** 抓取名字輸入狀態 */
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

/** 設置選擇欲更改預約的狀態
 * @true 允許輸入b/xx
 * @false 不允許輸入b/xx
 */
function setNameStatus(process) {
  nameStatus = process;
}

/** 抓取選擇欲更改預約的狀態 */
function getNameStatus() {
  return nameStatus;
}

/** 設置項目流程 */
function setSubjectStatus_Modify(process) {
  subjectStatus_modify = process;
}

function getSubjectStatus_Modify() {
  return subjectStatus_modify;
}

/** 設置該欲更改的客戶姓名 */
function setNewName(data) {
  newOrder.newName = data;
}

function getNewName() {
  return newOrder.newName;
}

function setNewDate(data) {
  newOrder.newDate = data;
}

function getNewDate() {
  return newOrder.newDate;
}

function setNewTime(data) {
  newOrder.newTime = data;
}

function getNewTime() {
  return newOrder.newTime;
}

function setNewEndTime(data) {
  newOrder.newEndTime = data;
}

function getNewEndTime() {
  return newOrder.newEndTime;
}

function setNewSubject(data) {
  newOrder.newSubject = data;
}

function getNewSubject() {
  return newOrder.newSubject;
}

function setNewOrder(id, name, date, time, endTime, subject) {
  newOrder.mid = id;
  setNewName(name);
  setNewDate(date);
  setNewTime(time);
  setNewEndTime(endTime);
  setNewSubject(subject);
}

function setSelectStatus(process) {
  selectStatus = process;
}

function getSelectStatus() {
  return selectStatus;
}

function resetModifyList() {
  modifyList = [];
}

function resetModifyListContent() {
  modifyListContent = [];
  modifyListPageContent = [];
}

module.exports = {
  handleName,
  init_modify,
  cancelModify,
  moreModifyPage,
  choose,
  modify_modifyName,
  modifyDate,
  modifyTime,
  modifyEndTime,
  modifySubject,
  handleModifyName,
  checkIsTimeConflict,
  setStatus,
  getStatus,
  setChosenStatus,
  getChosenStatus,
  setNameStatus,
  getNameStatus,
  getNewName,
  setNewName,
  getNewDate,
  setNewDate,
  getNewTime,
  setNewTime,
  getNewEndTime,
  setNewEndTime,
  getNewSubject,
  setNewSubject,
  setSubjectStatus_Modify,
  getSubjectStatus_Modify,
  setNewOrder,
  resetNewOrder,
  resetModifyList,
  resetModifyListContent,
  setSelectStatus,
  getSelectStatus,
  confirmModify,
  submitModify,
};
