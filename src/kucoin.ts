import * as API from 'kucoin-node-sdk';
import dotenv from 'dotenv';

import { kucoin as kucoinConfig } from './config';

dotenv.config();

API.init(kucoinConfig);

export const getTicker = (symbol: string) => {
  try {
    console.log('getTicker', symbol);
    return API.rest.Market.Symbols.getTicker(symbol);
  } catch (error) {
    console.log('error', error);
  }
};

export const postOrder = async (
  clientOid: string,
  symbol: string,
  side: 'buy' | 'sell',
  type = 'market',
  size?: number,
  funds?: number
) => {
  try {
    return await API.rest.Trade.Orders.postOrder(
      {
        clientOid,
        symbol,
        side,
        type,
      },
      {
        size,
        funds,
      }
    );
  } catch (error) {
    console.log('error', error);
  }
};

export const postStopOrder = async (
  clientOid: string,
  symbol: string,
  side: 'buy' | 'sell',
  type = 'market',
  stop: 'loss' | 'entry',
  stopPrice: number,
  size?: number,
  funds?: number
) => {
  try {
    return await API.rest.Trade.StopOrder.postStopOrder(
      {
        clientOid,
        symbol,
        side,
        type,
        stop,
        stopPrice,
      },
      {
        size,
        funds,
      }
    );
  } catch (error) {
    console.log('error', error);
  }
};

export const takeProfitOrder = async (
  clientOid: string,
  symbol: string,
  type = 'market',
  stopPrice: number,
  size?: number,
  funds?: number
) => {
  try {
    return postStopOrder(
      clientOid,
      symbol,
      'sell',
      type,
      'entry',
      stopPrice,
      size,
      funds
    );
  } catch (error) {
    console.log('error', error);
  }
};

export const stopLossOrder = async (
  clientOid: string,
  symbol: string,
  type = 'market',
  stopPrice: number,
  size?: number,
  funds?: number
) => {
  try {
    return postStopOrder(
      clientOid,
      symbol,
      'sell',
      type,
      'loss',
      stopPrice,
      size,
      funds
    );
  } catch (error) {
    console.log('error', error);
  }
};

export const startNewTrade = async (
  clientOid: string,
  symbol: string,
) => {
  try {
    const {
      data: { price, bestBid, bestAsk },
    } = await getTicker(symbol);
    
    // postOrder(clientOid, symbol, side, type, size);
    // clientOid: string,
    // symbol: string,
    // type = 'market',
    // size: number,
    // funds: number,
    // stopPrice: number
    // takeProfitOrder(clientOid, symbol, type, size, );
  } catch (error) {
    console.log('error', error);
  }
};
