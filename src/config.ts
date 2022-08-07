import dotenv from 'dotenv';

dotenv.config();

interface General {
  newPositionFundsPercentage: number;
  takeProfitPercentage: number;
  stopLossPercentage: number;

  orderVerificationMaxRetries: number;
  orderVerificationInterval: number;
}

const general: General = {

  newPositionFundsPercentage: parseFloat(process.env.NEW_POSITION_FUNDS_PERCENTAGE || '0.25'),
  takeProfitPercentage: 1 + parseFloat(process.env.NEW_POSITION_FUNDS_PERCENTAGE || '0.4') / 100,
  stopLossPercentage: 1 - parseFloat(process.env.NEW_POSITION_FUNDS_PERCENTAGE || '0.2') / 100,

  orderVerificationMaxRetries: parseInt(process.env.ORDER_VERIFICATION_MAX_RETRIES || '10'),
  orderVerificationInterval: parseInt(process.env.ORDER_VERIFICATION_INTERVAL || '5000'),
} 

export default general;

export const kucoin = {
  baseUrl: 'https://api.kucoin.com',
  apiAuth: {
    key: process.env.KUCOIN_API_KEY, 
    secret: process.env.KUCOIN_API_SECRET, 
    passphrase: process.env.KUCOIN_API_PASSPHRASE,
  },
  authVersion: 2,
};
