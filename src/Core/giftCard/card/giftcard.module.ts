import { Module } from '@vision/common';
import { GeneralService } from '../../service/general.service';
import { CardModule } from '../../useraccount/card/card.module';
import { CoreGiftCardReportModule } from '../report/report.module';
import { CoreGiftcardService } from './giftcard.service';

@Module({
  imports: [CoreGiftCardReportModule, CardModule],
  providers: [CoreGiftcardService, GeneralService],
  exports: [CoreGiftcardService],
})
export class CoreGiftCardModule {}
