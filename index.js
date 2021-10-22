/** @format */

'use strict';
const line = require('@line/bot-sdk');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

// create LINE SDK config from env variables
const config = {
  channelAccessToken:
    '1fbsDsWXQUm2i2kQ2Tvox3Rxm75lZK5qk0NDNh2PllERfHX1GK0cqCptdVIvnCYb3T8WJCadbC7BgJtYTCkDNsnvljVRTZqa2mm7MST6TOtlDgtGI56g7XoeAG92Cqd9vooeulnc3N1JaiOGPSHSKgdB04t89/1O/w1cDnyilFU=',
  channelSecret: 'bd987adc7c9eb33f7ee378060e018687',
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
const app = express();
const MESSAGE_EVENT = require('./src/event/message.event');
const POSTBACK_SERVICE = require('./src/event/postback.event');
const PROCESS_MANAGER = require('./src/manager/processManager');

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
          return MESSAGE_EVENT.handleSticker(message, replyToken);
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
