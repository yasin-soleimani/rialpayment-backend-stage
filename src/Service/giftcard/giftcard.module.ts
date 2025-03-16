import { Module } from '@vision/common';
import { CoreGiftCardModule } from '../../Core/giftCard/card/giftcard.module';
import { CoreGiftCardReportModule } from '../../Core/giftCard/report/report.module';
import { CoreGiftCardSettingsCommonService } from '../../Core/giftCard/settings/services/common.service';
import { CoreGiftCardSettingsModule } from '../../Core/giftCard/settings/settings.module';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { MipgServiceModule } from '../mipg/mipg.module';
import { GiftCardServiceController } from './giftcard.controller';
import { GiftcardService } from './giftcard.service';
import { GiftcardIpgService } from './services/ipg.service';

@Module({
  imports: [CoreGiftCardModule, CoreGiftCardReportModule, CoreGiftCardSettingsModule, MipgServiceModule, IpgCoreModule],
  controllers: [GiftCardServiceController],
  providers: [GiftcardService, GiftcardIpgService],
})
export class GiftCardServiceModule {}
