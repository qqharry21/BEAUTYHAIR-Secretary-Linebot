/** @format */

'use strict';

const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
const config = {
  channelAccessToken:
    '1fbsDsWXQUm2i2kQ2Tvox3Rxm75lZK5qk0NDNh2PllERfHX1GK0cqCptdVIvnCYb3T8WJCadbC7BgJtYTCkDNsnvljVRTZqa2mm7MST6TOtlDgtGI56g7XoeAG92Cqd9vooeulnc3N1JaiOGPSHSKgdB04t89/1O/w1cDnyilFU=',
  channelSecret: 'bd987adc7c9eb33f7ee378060e018687',
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create a echoing text message
  const echo = { type: 'text', text: event.message.text };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
