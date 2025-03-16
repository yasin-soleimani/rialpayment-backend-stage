import { Module } from '@vision/common';
import { CardModule } from '../../../Core/useraccount/card/card.module';
import { AccountModule } from '../../../Core/useraccount/account/account.module';
import { UserModule } from '../../../Core/useraccount/user/user.module';
import { CardChargeServiceController } from './cardCharge.controller';
import { CardChargeService } from './cardCharge.service';

@Module({
  imports: [CardModule, AccountModule, UserModule],
  controllers: [CardChargeServiceController],
  providers: [CardChargeService],
  exports: [],
})
export class CardChargeServiceModule {}
