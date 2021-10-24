/** @format */

//* IMPORT
const line = require('@line/bot-sdk');
const client = new line.Client({
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET'],
});
const fs = require('fs');
const path = require('path');
//* SERVICE
const BOOK_SERVICE = require('../service/book.service');
const COUNT_SERVICE = require('../service/count.service');
const SHOW_SERVICE = require('../service/show.service');
const SEARCH_SERVICE = require('../service/search.service');
const MODIFY_SERVICE = require('../service/modify.service');
const CANCEL_SERVICE = require('../service/cancel.service');
//* CONTROLLER
const bookController = require('../controller/book.controller');
const countController = require('../controller/count.controller');
const showController = require('../controller/show.controller');
const searchController = require('../controller/search.controller');
const modifyController = require('../controller/modify.controller');
const cancelController = require('../controller/cancel.controller');
//* PROCESS
const PROCESS_MANAGER = require('../manager/processManager');
//* FUNCTION
/** 處理文字 */
function handleText(message, replyToken, source, process) {
  const text = message.text;
  // ? 若狀態不為空，則判斷為哪個PROCESS
  if (process != '') {
    switch (process) {
      case 'BOOK':
        // ? 是否為名字輸入狀態
        if (bookController.getStatus()) {
          // ? 是否符合名字格式
          if (text.match('^[\u4e00-\u9fa5a-zA-Z.*]+$')) {
            console.log('match book');
            return bookController.handleName(replyToken, text.split('b/').pop());
          } else {
            bookController.resetOrder();
            return handleErrorInput(replyToken);
          }
        }
        //? 是否為項目輸入狀態
        else if (bookController.getSubjectStatus_Book()) {
          //? 是否符合項目格式
          if (['修剪新品', '洗/染', '剪髮', '返修', '其他'].some(item => item == text)) {
            bookController.setSubjectStatus_Book(false);
            bookController.setSubject(text);
            return bookController.confirmBook(replyToken);
          } else {
            bookController.resetOrder();
            return handleErrorInput(replyToken);
          }
        } else {
          bookController.resetOrder();
          return handleErrorInput(replyToken);
        }
      case 'COUNT':
        countController.resetCountOrder();
        return handleErrorInput(replyToken);
      case 'SHOW':
        if (showController.getStatus()) {
          if (text.match('^[\u4e00-\u9fa5a-zA-Z.*]+$')) {
            console.log('match show');
            return showController.handleName(replyToken, text.split('s/').pop());
          } else {
            showController.resetShowOrder();
            return handleErrorInput(replyToken);
          }
        } else {
          showController.resetShowOrder();
          return handleErrorInput(replyToken);
        }
      case 'SEARCH':
        searchController.resetSearchOrder();
        return handleErrorInput(replyToken);
      case 'MODIFY':
        //? 是否為名字輸入狀態
        if (modifyController.getStatus()) {
          //? 是否符合名字格式
          if (text.match('^[\u4e00-\u9fa5a-zA-Z.*]+$')) {
            console.log('match modify');
            return modifyController.handleName(replyToken, text.split('m/').pop());
          } else {
            modifyController.resetNewOrder();
            return handleErrorInput(replyToken);
          }
        }
        //? 是否為更改名字輸入狀態
        else if (modifyController.getNameStatus()) {
          //? 是否符合更改名字格式
          if (text.match('^[\u4e00-\u9fa5a-zA-Z.*]+$')) {
            console.log('match modifyName');
            return modifyController.handleModifyName(replyToken, text.split('b/').pop());
          } else {
            modifyController.resetNewOrder();
            return handleErrorInput(replyToken);
          }
        }
        //? 是否為更改項目輸入狀態
        else if (modifyController.getSubjectStatus_Modify()) {
          //? 是否符合項目格式
          if (['修剪新品', '洗/染', '剪髮', '返修', '其他'].some(item => item == text)) {
            modifyController.setSubjectStatus_Modify(false);
            modifyController.setNewSubject(text);
            return modifyController.confirmModify(replyToken);
          } else {
            modifyController.resetNewOrder();
            return handleErrorInput(replyToken);
          }
        } else {
          modifyController.resetNewOrder();
          return handleErrorInput(replyToken);
        }
      case 'CANCEL':
        //? 是否為名字輸入狀態
        if (cancelController.getStatus()) {
          //? 是否符合名字格式
          if (text.match('^[\u4e00-\u9fa5a-zA-Z.*]+$')) {
            console.log('match cancel');
            return cancelController.handleName(replyToken, text.split('c/').pop());
          } else {
            cancelController.resetCancelOrder();
            return handleErrorInput(replyToken);
          }
        } else {
          cancelController.resetCancelOrder();
          return handleErrorInput(replyToken);
        }
    }
  } else {
    switch (text) {
      //* 預約 Book
      case '預約':
      case '新增預約':
      case '新增':
        return BOOK_SERVICE.execute(replyToken);
      //* 統計 count
      case '查詢人數':
        return COUNT_SERVICE.execute(replyToken);
      //* 查詢 search
      case '查詢時段':
        return SEARCH_SERVICE.execute(replyToken);
      //* 修改 modify
      case '修改預約':
        return MODIFY_SERVICE.execute(replyToken);
      //* 取消 cancel
      case '取消預約':
        return CANCEL_SERVICE.execute(replyToken);
      //* 檢視 show
      case '查詢預約':
        return SHOW_SERVICE.execute(replyToken);
      //* 其他無效指令
      default:
        console.log(`Echo message to ${replyToken}: ${text}`);
        return client.replyMessage(replyToken, {
          type: 'text',
          text: '無效指令',
        });
    }
  }
}

/** 處理錯誤指令、格式*/
function handleErrorInput(replyToken) {
  PROCESS_MANAGER.resetProcess();
  return client.replyMessage(replyToken, {
    type: 'text',
    text: '格式錯誤，請重新點選功能',
  });
}

function handleImage(message, replyToken) {
  let getContent;
  console.log('image message', message);
  PROCESS_MANAGER.resetProcess();
  if (message.contentProvider.type === 'line') {
    const downloadPath = path.join(process.cwd(), 'public', 'download', `${message.id}.jpg`);
    getContent = downloadContent(message.id, downloadPath).then(downloadPath => {
      return {
        originalContentUrl:
          'https://d3d2-2001-b400-e274-2de4-c99a-3678-f2a-41d4.ngrok.io' +
          '/download/' +
          path.basename(downloadPath),
        previewImageUrl:
          'https://d3d2-2001-b400-e274-2de4-c99a-3678-f2a-41d4.ngrok.io' +
          '/download/' +
          path.basename(downloadPath),
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
  PROCESS_MANAGER.resetProcess();
  if (message.contentProvider.type === 'line') {
    const downloadPath = path.join(process.cwd(), 'public', 'downloaded', `${message.id}.mp4`);

    getContent = downloadContent(message.id, downloadPath).then(downloadPath => {
      return {
        originalContentUrl:
          'https://d3d2-2001-b400-e274-2de4-c99a-3678-f2a-41d4.ngrok.io' +
          '/downloaded/' +
          path.basename(downloadPath),
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
  PROCESS_MANAGER.resetProcess();
  if (message.contentProvider.type === 'line') {
    const downloadPath = path.join(process.cwd(), 'public', 'downloaded', `${message.id}.m4a`);

    getContent = downloadContent(message.id, downloadPath).then(downloadPath => {
      return {
        originalContentUrl:
          'https://d3d2-2001-b400-e274-2de4-c99a-3678-f2a-41d4.ngrok.io' +
          '/downloaded/' +
          path.basename(downloadPath),
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
  PROCESS_MANAGER.resetProcess();
  return client.replyMessage(replyToken, {
    type: 'location',
    title: message.title,
    address: message.address,
    latitude: message.latitude,
    longitude: message.longitude,
  });
}

function handleSticker(message, replyToken) {
  if (message.stickerResourceType == 'STATIC') {
    PROCESS_MANAGER.resetProcess();
    return client.replyMessage(replyToken, {
      type: 'sticker',
      packageId: message.packageId,
      stickerId: message.stickerId,
    });
  } else {
    handleErrorInput(replyToken);
  }
}

//參考至https://ithelp.ithome.com.tw/articles/10219503
function downloadContent(messageId, downloadPath) {
  return client.getMessageContent(messageId).then(
    stream =>
      new Promise((resolve, reject) => {
        const writable = fs.createWriteStream(downloadPath);
        stream.pipe(writable);
        stream.on('end', () => resolve(downloadPath));
        stream.on('error', reject);
      })
  );
}
module.exports = {
  handleText,
  handleImage,
  handleVideo,
  handleAudio,
  handleLocation,
  handleSticker,
};
