/** @format */

'use strict';
const https = require('https');
const fs = require('fs');
const line = require('@line/bot-sdk');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

//./ngrok authtoken 1yR6gzVzm5ap3A8VViWMB5v2B8f_6ALZByubepQLWKcMaTp1x
//ngrok http 3000

// https://beautyhair-secretary-linebot.herokuapp.com/callback
// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET'],
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
const app = express();
const MESSAGE_EVENT = require('./src/event/message.event');
const POSTBACK_SERVICE = require('./src/event/postback.event');
const PROCESS_MANAGER = require('./src/manager/processManager');
// * PYTHON
// const spawn = require('child_process').spawn;
// const pythonProcess = spawn('python', ['./hello.py']);
// pythonProcess.stdout.on('data', data => {
//   console.log(`${data}`);
// });

// const richMenu = require('./richMenu');
// * post rich menu
// client
//   .createRichMenu(richMenu)
//   .then(richMenuId => console.log(richMenuId))
//   .catch(err => console.error(err));
// * post rich menu image
// client
//   .setRichMenuImage(
//     'richmenu-b3d135dab7fb8d8f840e733c182d195c',
//     fs.createReadStream('./public/richMenu.png')
//   )
//   .then(res => console.log(res))
//   .catch(err => console.error(err));

app.get('/', (_req, res) => {
  res.sendStatus(200);
});

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }
  Promise.all(req.body.events.map(handleEvent))
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
});

/** 處理 all event */
function handleEvent(event) {
  const process = PROCESS_MANAGER.getProcess();
  console.log('process', process);
  const replyToken = event.replyToken;
  switch (event.type) {
    //* message event
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return MESSAGE_EVENT.handleText(message, replyToken, event.source, process);
        case 'image':
          return MESSAGE_EVENT.handleImage(message, replyToken);
        case 'video':
          return MESSAGE_EVENT.handleVideo(message, replyToken);
        case 'audio':
          return MESSAGE_EVENT.handleAudio(message, replyToken);
        case 'location':
          return MESSAGE_EVENT.handleLocation(message, replyToken, event.source);
        case 'sticker':
          return handleSticker(message, replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }
    //* follow event
    case 'follow':
      console.log(`Followed this bot: ${JSON.stringify(event)}`);
      return client.replyMessage(replyToken, {
        type: 'text',
        text: 'Got followed event',
      });
    //* unfollow event
    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);
    //* postback event
    case 'postback':
      const postback = event.postback;
      return POSTBACK_SERVICE.execute(replyToken, postback, process);
    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
