import axios, { AxiosError, AxiosResponse } from "axios";
import dotenv from 'dotenv';
import {
  ToadScheduler,
  SimpleIntervalJob,
  AsyncTask,
} from 'toad-scheduler';
import CyclicDb from 'cyclic-dynamodb';

import { getTicker, postOrder, startNewTrade } from "./kucoin";

dotenv.config();

const db = CyclicDb(process.env.CYCLIC_DB);

let signalsCollection = db.collection('signals');

const scheduler = new ToadScheduler();


const task = new AsyncTask(
  'signals',
  () => {
    return axios
      .post('https://agile-cliffs-23967.herokuapp.com/ok')
      .then(async (res: AxiosResponse) => {
        const { resu: signals } = res.data;
        const id = signals.pop();
        const {
          props: { id: latestID },
        } = await signalsCollection.get('latestID');
        
        // postOrder();
        // console.log(await getTicker('ETH-USDT'));
        startNewTrade(
          "unique-id" + new Date().getTime(),
          "ETH-USDT",
        )


        if (id === latestID) {
          console.log('No new signals, Current ID:', id);
          return;
        }

        await signalsCollection.set('latestID', { id });

        for (let signal of signals) {
          if (typeof signal === 'string' && signal.split('|').length > 1) {
            const [
              coin,
              pings,
              netVolBTC,
              netVolPercentage,
              recentTotalVolBTC,
              recentVolPercentage,
              recentNetVol,
              timestamp,
            ] = signal.split('|');

            console.log(
              `${coin} ${pings} ${netVolBTC} ${netVolPercentage} ${recentTotalVolBTC} ${recentVolPercentage} ${recentNetVol} ${timestamp}`
            );

            if (parseInt(pings) <= 5 && netVolBTC)
              await signalsCollection.set('leo', {
                coin,
                pings,
                netVolBTC,
                netVolPercentage,
                recentTotalVolBTC,
                recentVolPercentage,
                recentNetVol,
                timestamp,
              });
          }
        }
      });
  },
  (error: Error) => {
    console.log(error);
  }
);
const job = new SimpleIntervalJob({ seconds: 5 }, task);

scheduler.addSimpleIntervalJob(job);
