import { Connection } from 'mongoose';
import { BasketLotterySchema } from './schema/lottery.schema';

export const BasketLotteryProviders = [
  {
    provide: 'BasketLotteryModel',
    useFactory: (connection: Connection) => connection.model('BasketLottery', BasketLotterySchema),
    inject: ['DbConnection'],
  },
];
