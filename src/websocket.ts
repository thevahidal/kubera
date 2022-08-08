import dotenv from 'dotenv';
import * as API from 'kucoin-node-sdk';

import config, { kucoin as kucoinConfig } from './config';

dotenv.config();

API.init(kucoinConfig);

// ws demo
export const datafeed = new API.websocket.Datafeed();

// close callback
datafeed.onClose(() => {
  console.log('ws closed, status ', datafeed.trustConnected);
});

// connect
datafeed.connectSocket();

// subscribe
const topic = `/spotMarket/tradeOrders`;
const callbackId = datafeed.subscribe(topic, (message: any) => {
  if (message.topic === topic) {
    console.log(message.data);
  }
});

console.log(`subscribe id: ${callbackId}`);
// setTimeout(() => {
//   // unsubscribe
//   datafeed.unsubscribe(topic, callbackId);
//   console.log(`unsubscribed: ${topic} ${callbackId}`);  
// }, 5000);