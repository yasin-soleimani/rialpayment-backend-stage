import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { BasketLotteryApiService } from './lottery.service';
import { UserModule } from '../../../Core/useraccount/user/user.module';
import { BasketLotteryCoreModule } from '../../../Core/basket/lottery/lottery.module';
import { BasketStoreCoreModule } from '../../../Core/basket/store/basket-store.module';
import { BasketLotteryApiController } from './lottery.controller';
import { GeneralService } from '../../../Core/service/general.service';

@Module({
  imports: [DatabaseModule, UserModule, BasketLotteryCoreModule, BasketStoreCoreModule],
  controllers: [BasketLotteryApiController],
  providers: [GeneralService, BasketLotteryApiService],
  exports: [BasketLotteryApiService],
})
export class BasketLotteryApiModule {}
