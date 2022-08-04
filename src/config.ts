import dotenv from 'dotenv';

dotenv.config();

export const kucoin = {
  baseUrl: 'https://api.kucoin.com',
  apiAuth: {
    key: process.env.KUCOIN_API_KEY, 
    secret: process.env.KUCOIN_API_SECRET, 
    passphrase: process.env.KUCOIN_API_PASSPHRASE,
  },
  authVersion: 2,
};
