const axios = require('axios');
const {
  ToadScheduler,
  SimpleIntervalJob,
  AsyncTask,
} = require('toad-scheduler');

const scheduler = new ToadScheduler();

const task = new AsyncTask(
  'signals',
  () => {
    return axios
      .post('https://agile-cliffs-23967.herokuapp.com/ok')
      .then((res) => {
        const { resu: signals } = res.data;
        const id = signals.pop();
        console.log(`#${id}`);
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
          }
        }
      });
  },
  (error) => {
    console.log(error);
  }
);
const job = new SimpleIntervalJob({ seconds: 5 }, task);

scheduler.addSimpleIntervalJob(job);
