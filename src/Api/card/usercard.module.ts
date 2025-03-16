import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { UsercardController } from './usercard.controller';
import { UsercardService } from './usercard.service';
import { GeneralService } from '../../Core/service/general.service';
import { CardModule } from '../../Core/useraccount/card/card.module';
import { SettingsCoreModule } from '../../Core/settings/settings.module';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { GroupCoreModule } from '../../Core/group/group.module';
import { CardcounterModule } from '../../Core/useraccount/cardcounter/cardcounter.module';
import { ClubCoreModule } from '../../Core/customerclub/club.module';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';
import { IpgParsianService } from '../../Core/ipg/services/parsian/parsian.service';

@Module({
  imports: [
    DatabaseModule,
    CardModule,
    SettingsCoreModule,
    AccountModule,
    GroupCoreModule,
    CardcounterModule,
    ClubCoreModule,
    GroupCoreModule,
    UserModule,
    MerchantcoreModule,
  ],
  controllers: [UsercardController],
  providers: [UsercardService, GeneralService, IpgParsianService],
})
export class UserCardModule {}
