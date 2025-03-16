import { Module } from '@vision/common';
import { ChargeController } from './charge.controller';
import { DatabaseModule } from '../../Database/database.module';
import { ChargeService } from './charge.service';
import { GeneralService } from '../../Core/service/general.service';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { SimcardCoreModule } from '../../Core/simcard/simcard.module';
import { OrganizationChargeCoreModule } from '../../Core/organization/charge/organization-charge.module';
import { LoggercoreModule } from '../../Core/logger/loggercore.module';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { CardModule } from '../../Core/useraccount/card/card.module';
import { ChargeRfidService } from './services/charge-rfid.service';
import { MipgModule } from '../../Core/mipg/mipg.module';
import { ChargeIpgApiService } from './services/charge-ipg.service';
import { GroupCoreModule } from '../../Core/group/group.module';
import { ApiSimcardService } from './simcard.service';

@Module({
  imports: [
    DatabaseModule,
    AccountModule,
    UserModule,
    SimcardCoreModule,
    OrganizationChargeCoreModule,
    MipgModule,
    LoggercoreModule,
    IpgCoreModule,
    CardModule,
    GroupCoreModule,
  ],
  controllers: [ChargeController],
  providers: [ChargeService, GeneralService, ChargeIpgApiService, ChargeRfidService, ApiSimcardService],
  exports: [ChargeService],
})
export class ChargeModule { }
