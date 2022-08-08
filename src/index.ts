import axios, { AxiosError, AxiosResponse } from 'axios';
import dotenv from 'dotenv';
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import CyclicDb from 'cyclic-dynamodb';
import express, { Request, Response } from 'express';

import { getTicker, postOrder, initiateTrade } from './kucoin';
import { datafeed } from './websocket';

dotenv.config();

const db = CyclicDb(process.env.CYCLIC_DB);

let signalsCollection = db.collection('signals');

const scheduler = new ToadScheduler();

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Kubera is running',
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

const task = new AsyncTask(
  'signals',
  () => {
    console.log('Fetching newest signals...');
    return axios
      .post('https://agile-cliffs-23967.herokuapp.com/ok')
      .then(async (res: AxiosResponse) => {
        const { resu: signals } = res.data;
        const id = signals.pop();

        try {
          const {
            props: { id: latestID },
          } = await signalsCollection.get('latestID');

          const date = new Date().toISOString().split('T')[0];

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

              const parsedPings = parseInt(pings);
              const parsedNetVolPercentage = parseFloat(
                netVolPercentage.split('%')[0]
              );

              console.log(
                `${coin} ${pings} ${netVolBTC} ${netVolPercentage} ${recentTotalVolBTC} ${recentVolPercentage} ${recentNetVol} ${timestamp}`
              );

              const uuid = `${date}-${id}-${coin}`;

              if (
                parsedPings <= 10 &&
                parsedNetVolPercentage > 0 &&
                parsedNetVolPercentage <= 10
              ) {
                console.log('Signal is valid, initiating trade...');
                initiateTrade(uuid, `${coin}-USDT`);
              }
            }
          }
        } catch (error) {
          await signalsCollection.set('latestID', { id });
          console.log(error)
        }
      });
  },
  (error: Error) => {
    console.log(error);
  }
);
const job = new SimpleIntervalJob({ seconds: 5 }, task);

scheduler.addSimpleIntervalJob(job);
