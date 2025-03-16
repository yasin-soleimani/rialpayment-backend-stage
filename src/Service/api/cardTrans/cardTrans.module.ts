import { Module } from '@vision/common';
import { CardModule } from '../../../Core/useraccount/card/card.module';
import { AccountModule } from '../../../Core/useraccount/account/account.module';
import { CardTransController } from './cardTrans.controller';
import { CardTransService } from './cardTrans.Service';

@Module({
  imports: [CardModule, AccountModule],
  controllers: [CardTransController],
  providers: [CardTransService],
  exports: [],
})
export class CardTransServiceModule {}
