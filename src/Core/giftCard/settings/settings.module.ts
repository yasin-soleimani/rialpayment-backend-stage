import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { CoreGiftCardSettingsCommonService } from './services/common.service';
import { CoreGiftCardSettingsService } from './services/settings.service';
import { GiftCardSettingsProviders } from './settings.providers';

@Module({
  imports: [DatabaseModule],
  providers: [...GiftCardSettingsProviders, CoreGiftCardSettingsCommonService, CoreGiftCardSettingsService],
  exports: [CoreGiftCardSettingsService],
})
export class CoreGiftCardSettingsModule {}
