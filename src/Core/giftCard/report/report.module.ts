import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { CoreGiftCardReportCommonService } from './services/common.service';
import { CoreGiftCardReportService } from './services/report.service';
import { GiftCardReportProviders } from './report.providers';
import { GeneralService } from '../../service/general.service';
@Module({
  imports: [DatabaseModule],
  providers: [...GiftCardReportProviders, CoreGiftCardReportService, CoreGiftCardReportCommonService, GeneralService],
  exports: [CoreGiftCardReportService],
})
export class CoreGiftCardReportModule {}
