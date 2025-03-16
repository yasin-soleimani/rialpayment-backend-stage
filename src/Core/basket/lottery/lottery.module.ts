import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { BasketLotteryService } from './lottery.service';
import { BasketLotteryProviders } from './lottery.providers';

@Module({
  imports: [DatabaseModule],
  providers: [BasketLotteryService, ...BasketLotteryProviders],
  exports: [BasketLotteryService],
})
export class BasketLotteryCoreModule {}
