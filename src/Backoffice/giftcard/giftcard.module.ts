import { Module } from '@vision/common';
import { CoreGiftCardReportModule } from '../../Core/giftCard/report/report.module';
import { CoreGiftCardSettingsModule } from '../../Core/giftCard/settings/settings.module';
import { GroupCoreModule } from '../../Core/group/group.module';
import { GeneralService } from '../../Core/service/general.service';
import { BackofficeGiftCardController } from './giftcard.controller';
import { BackofficeGiftcardService } from './giftcard.service';

@Module({
  imports: [GroupCoreModule, CoreGiftCardSettingsModule, CoreGiftCardReportModule],
  controllers: [BackofficeGiftCardController],
  providers: [BackofficeGiftcardService, GeneralService],
})
export class BackofficeGiftcardModule {}
