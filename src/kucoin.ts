import * as API from 'kucoin-node-sdk';
import dotenv from 'dotenv';

import config, { kucoin as kucoinConfig } from './config';

dotenv.config();

API.init(kucoinConfig);

export const getTicker = (symbol: string) => {
  try {
    return API.rest.Market.Symbols.getTicker(symbol);
  } catch (error) {
    console.log('error', error);
  }
};

export const getAccountsList = (type?: 'trade' | 'main', currency?: string) => {
  try {
    return API.rest.User.Account.getAccountsList({
      type,
      currency,
    });
  } catch (error) {
    console.log('error', error);
  }
};

export const getOrderByID = (orderId: string) => {
  try {
    return API.rest.Trade.Orders.getOrderByID(orderId);
  } catch (error) {
    console.log('error', error);
  }
};

export const postOrder = (
  clientOid: string,
  symbol: string,
  side: 'buy' | 'sell',
  type = 'market',
  size?: number | string,
  funds?: number | string,
  price?: number | string,
) => {
  try {
    return API.rest.Trade.Orders.postOrder(
      {
        clientOid,
        symbol,
        side,
        type,
      },
      {
        size,
        funds,
        price,
      }
    );
  } catch (error) {
    console.log('error', error);
  }
};

export const postStopOrder = (
  clientOid: string,
  symbol: string,
  side: 'buy' | 'sell',
  type = 'market',
  stop: 'loss' | 'entry',
  stopPrice: number | string,
  size?: number | string,
  funds?: number | string
) => {
  try {
    return API.rest.Trade.StopOrder.postStopOrder(
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

export const takeProfitOrder = (
  clientOid: string,
  symbol: string,
  type = 'market',
  stopPrice: number,
  size?: number | string,
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

export const stopLossOrder = (
  clientOid: string,
  symbol: string,
  type = 'market',
  stopPrice: number | string,
  size?: number | string,
  funds?: number | string
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
      funds,
    );
  } catch (error) {
    console.log('error', error);
  }
};

async function sleep(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export const initiateTrade = async (clientOid: string, symbol: string) => {
  try {
    const [
      getTickerResponse,
      {
        data: getAccountsListData,
      },
    ] = await Promise.all([
      getTicker(symbol),
      getAccountsList('trade', 'USDT'),
    ]);

    console.log({getTickerResponse, getAccountsListData});

    let orderId = null;

    let funds: number = getAccountsListData[0].available * config.newPositionFundsPercentage;
    let size: string = (funds / getTickerResponse.data.price).toFixed(4);

    let realSize: number | string = size;
    let realFunds: number | string = funds;
    let realPrice: number = getTickerResponse.data.price;

    try {
      try {
        const {
          data: postOrderData,
        } = await postOrder(clientOid, symbol, 'buy', 'market', size, undefined)
        console.log(postOrderData)
        orderId = postOrderData.orderId;
      } catch (error) {
        console.log('error', error);
        return
      }

      let retries = 0;
      while (retries < config.orderVerificationMaxRetries) {
        await sleep(config.orderVerificationInterval);
        try {
          const { 
            data: getOrderByIDData,
          } = await getOrderByID(orderId);
          realSize = parseFloat(getOrderByIDData.dealSize);
          realFunds = parseFloat(getOrderByIDData.dealFunds);
          realPrice = realFunds / realSize
          console.log('Order verified');
          break;
        } catch(error) {
          console.log('error', error);
        }
      }

      const [
        takeProfitOrderResponse,
        stopLossOrderResponse,
      ] = await Promise.all([
        postOrder(clientOid, symbol, 'sell', 'limit', realSize, undefined, (realPrice * config.takeProfitPercentage).toPrecision(4)),
        // takeProfitOrder(clientOid, symbol, 'market', realPrice * config.takeProfitPercentage, realSize, undefined),
        stopLossOrder(clientOid, symbol, 'market', (realPrice * config.stopLossPercentage).toPrecision(4), realSize, undefined),
      ]);

      console.log({takeProfitOrderResponse, stopLossOrderResponse});

    } catch(error) {
      console.log('error', error);
      return
    }
      
  } catch (error) {
    console.log('error', error);
  }
};
