/** @format */

const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET'],
});
// * SERVICE
const BOOK_SERVICE = require('../service/book.service');
const COUNT_SERVICE = require('../service/count.service');
const SHOW_SERVICE = require('../service/show.service');
const SEARCH_SERVICE = require('../service/search.service');
const MODIFY_SERVICE = require('../service/modify.service');
const CANCEL_SERVICE = require('../service/cancel.service');

// * CONTROLLER
const bookController = require('../controller/book.controller');
const countController = require('../controller/count.controller');
const showController = require('../controller/show.controller');
const searchController = require('../controller/search.controller');
const modifyController = require('../controller/modify.controller');
const cancelController = require('../controller/cancel.controller');

// * PROCESS
const PROCESS_MANAGER = require('../function/processManager');

/** 處理文字 */
function handleText(message, replyToken, source, process) {
  const text = message.text;
  const order = bookController.getOrder();
  console.log('order from text', order);
  // # getStatus()

  // const cancelStatus = cancelController.getStatus();
  // ? 若狀態不為空，則判斷為哪個PROCESS
  if (process != '') {
    switch (process) {
      case 'BOOK':
        // ? 是否為名字輸入狀態
        if (bookController.getStatus()) {
          // ? 是否符合名字格式
          if (text.match('^b/[\u4e00-\u9fa5a-zA-Z]+$')) {
            console.log('match book');
            return bookController.handleName(replyToken, text, status, false);
          } else {
            return handleErrorInput(replyToken);
          }
        } else {
          return handleErrorInput(replyToken);
        }
      case 'COUNT':
        break;
      case 'SHOW':
        break;
      case 'SEARCH':
        // ? 是否為名字輸入狀態
        if (searchController.getStatus()) {
          // ? 是否符合名字格式
          if (text.match('^s/[\u4e00-\u9fa5a-zA-Z]+$')) {
            console.log('match search');
            // return searchController.handleName(replyToken, text, status, false);
            break;
          } else {
            return handleErrorInput(replyToken);
          }
        } else {
          return handleErrorInput(replyToken);
        }
      case 'MODIFY':
        // ? 是否為名字輸入狀態
        if (modifyController.getStatus()) {
          // ? 是否符合名字格式
          if (text.match('^m/[\u4e00-\u9fa5a-zA-Z]+$')) {
            console.log('match modify');
            // return modifyController.handleName(replyToken, text, status, false);
            break;
          } else {
            return handleErrorInput(replyToken);
          }
        } else {
          return handleErrorInput(replyToken);
        }
      case 'CANCEL':
        // ? 是否為名字輸入狀態
        if (cancelController.getStatus()) {
          // ? 是否符合名字格式
          if (text.match('^c/[\u4e00-\u9fa5a-zA-Z]+$')) {
            console.log('match cancel');
            // return cancelController.handleName(replyToken, text, status, false);
            break;
          } else {
            return handleErrorInput(replyToken);
          }
        } else {
          return handleErrorInput(replyToken);
        }
    }
  } else {
    switch (text) {
      // * 預約
      case '預約':
      case '新增預約':
      case '新增':
        return BOOK_SERVICE.execute(replyToken);
      case '查詢人數':
        return COUNT_SERVICE.execute(replyToken);
      case '查詢指定客戶':
        return SEARCH_SERVICE.execute(replyToken);
      case '修改預約':
        return MODIFY_SERVICE.execute(replyToken);
      case '取消預約':
        return CANCEL_SERVICE.execute(replyToken);
      case '檢視預約':
        return SHOW_SERVICE.execute(replyToken);
      case '檢視':
        return client.replyMessage(replyToken, {
          type: 'flex',
          altText: 'this is a flex message',
          contents: {
            type: 'bubble',
            hero: {
              type: 'image',
              url: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_1_cafe.png',
              size: 'full',
              aspectRatio: '20:13',
              aspectMode: 'cover',
              // action: {
              //   type: 'uri',
              //   uri: 'http://linecorp.com/',
              // },
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '陳泉豪',
                  weight: 'bold',
                  size: 'xl',
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
                          text: '時間',
                          color: '#aaaaaa',
                          size: 'sm',
                          flex: 2,
                        },
                        {
                          type: 'text',
                          text: '10:00 - 23:00',
                          wrap: true,
                          color: '#666666',
                          size: 'sm',
                          flex: 5,
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
                          text: '服務內容',
                          color: '#aaaaaa',
                          size: 'sm',
                          flex: 2,
                        },
                        {
                          type: 'text',
                          text: 'Miraina Tower, 4-1-6 Shinjuku, Tokyo',
                          wrap: true,
                          color: '#666666',
                          size: 'sm',
                          flex: 5,
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
              spacing: 'sm',
              contents: [
                {
                  type: 'button',
                  style: 'link',
                  height: 'sm',
                  action: {
                    type: 'postback',
                    label: '確認',
                    data: 'success',
                    displayText: '預約成功',
                  },
                },
                {
                  type: 'button',
                  style: 'link',
                  height: 'sm',
                  action: {
                    type: 'postback',
                    label: '更改',
                    data: 'modify',
                    displayText: '更改內容',
                  },
                },
                {
                  type: 'button',
                  style: 'link',
                  height: 'sm',
                  action: {
                    type: 'postback',
                    label: '取消',
                    data: 'cancel',
                    displayText: '取消預約',
                  },
                },
                {
                  type: 'spacer',
                  size: 'sm',
                },
              ],
              flex: 0,
            },
          },
        });
      case '服務內容':
        return client.replyMessage(replyToken, {
          type: 'flex',
          altText: 'this is a flex message',
          contents: {
            type: 'text',
            text: '請選擇服務項目',
            quickReply: {
              items: [
                {
                  type: 'action',
                  imageUrl: 'https://img.icons8.com/office/50/000000/new.png',
                  action: {
                    label: '修剪新品',
                    type: 'postback',
                    text: '修剪新品',
                  },
                },
                {
                  type: 'action',
                  imageUrl: 'https://img.icons8.com/offices/50/000000/hair-washing-sink.png',
                  action: {
                    label: '洗/染',
                    type: 'postback',
                    text: '洗/染',
                  },
                },
                {
                  type: 'action',
                  imageUrl: 'https://img.icons8.com/color/48/000000/hairdresser.png',
                  action: {
                    label: '剪髮',
                    type: 'postback',
                    text: '剪髮',
                  },
                },
                {
                  type: 'action',
                  imageUrl: 'https://img.icons8.com/offices/50/000000/barber-chair.png',
                  action: {
                    label: '返修',
                    type: 'postback',
                    text: '返修',
                  },
                },
                {
                  type: 'action',
                  imageUrl:
                    'https://img.icons8.com/external-those-icons-lineal-color-those-icons/24/000000/external-barber-barber-shop-those-icons-lineal-color-those-icons.png',
                  action: {
                    label: '其他',
                    type: 'postback',
                    text: '其他',
                  },
                },
                {
                  type: 'action',
                  action: {
                    type: 'location',
                    label: 'Send location',
                  },
                },
              ],
            },
          },
        });
      default:
        console.log(`Echo message to ${replyToken}: ${text}`);
        // let status = bookController.getStatus();
        // if (status) {
        //   /* setStatus(false) 寫入resetOrder() */
        //   // bookController.setStatus(false);
        //   bookController.resetOrder();
        //   return handleErrorInput(true, replyToken);
        // } else if (cancelStatus) {
        //   cancelController.resetCancelOrder();
        //   return handleErrorInput(false, replyToken);
        // } else {
        const echo = {
          type: 'text',
          text: text,
        };
        return client.replyMessage(replyToken, echo);
      // }
    }
  }
}

// * Error Input
function handleErrorInput(replyToken) {
  return client.replyMessage(replyToken, {
    type: 'text',
    text: '格式錯誤，請重新點選功能',
  });
}

function handleImage(message, replyToken) {
  let getContent;
  console.log('image message', message);
  if (message.contentProvider.type === 'line') {
    const downloadPath = path.join(process.cwd(), 'public', 'downloaded', `${message.id}.jpg`);

    getContent = downloadContent(message.id, downloadPath).then(downloadPath => {
      return {
        originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
        previewImageUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
      };
    });
  } else if (message.contentProvider.type === 'external') {
    getContent = Promise.resolve(message.contentProvider);
  }

  return getContent.then(({ originalContentUrl, previewImageUrl }) => {
    return client.replyMessage(replyToken, {
      type: 'image',
      originalContentUrl,
      previewImageUrl,
    });
  });
}

function handleVideo(message, replyToken) {
  let getContent;
  if (message.contentProvider.type === 'line') {
    const downloadPath = path.join(process.cwd(), 'public', 'downloaded', `${message.id}.mp4`);

    getContent = downloadContent(message.id, downloadPath).then(downloadPath => {
      return {
        originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
        previewImageUrl: lineImgURL,
      };
    });
  } else if (message.contentProvider.type === 'external') {
    getContent = Promise.resolve(message.contentProvider);
  }

  return getContent.then(({ originalContentUrl, previewImageUrl }) => {
    return client.replyMessage(replyToken, {
      type: 'video',
      originalContentUrl,
      previewImageUrl,
    });
  });
}

function handleAudio(message, replyToken) {
  let getContent;
  if (message.contentProvider.type === 'line') {
    const downloadPath = path.join(process.cwd(), 'public', 'downloaded', `${message.id}.m4a`);

    getContent = downloadContent(message.id, downloadPath).then(downloadPath => {
      return {
        originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
      };
    });
  } else {
    getContent = Promise.resolve(message.contentProvider);
  }

  return getContent.then(({ originalContentUrl }) => {
    return client.replyMessage(replyToken, {
      type: 'audio',
      originalContentUrl,
      duration: message.duration,
    });
  });
}

function handleLocation(message, replyToken) {
  return client.replyMessage(replyToken, {
    type: 'location',
    title: message.title,
    address: message.address,
    latitude: message.latitude,
    longitude: message.longitude,
  });
}

function handleSticker(message, replyToken) {
  return client.replyMessage(replyToken, {
    type: 'sticker',
    packageId: message.packageId,
    stickerId: message.stickerId,
  });
}

module.exports = {
  handleText,
  handleImage,
  handleVideo,
  handleAudio,
  handleLocation,
  handleSticker,
};
