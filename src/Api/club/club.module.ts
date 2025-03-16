import { Module } from '@vision/common';
import { CustomerClubController } from './club.controller';
import { CustomerClubService } from './club.service';
import { ClubCoreModule } from '../../Core/customerclub/club.module';
import { GeneralService } from '../../Core/service/general.service';
import { SettingsCoreModule } from '../../Core/settings/settings.module';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';

@Module({
  imports: [ClubCoreModule, SettingsCoreModule, MerchantcoreModule],
  providers: [CustomerClubService, GeneralService],
  controllers: [CustomerClubController],
})
export class ClubApiModule {}
