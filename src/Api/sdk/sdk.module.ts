import { Module } from '@vision/common';
import { SdkController } from './sdk.controller';
import { SdkService } from './sdk.service';
import { GeneralService } from '../../Core/service/general.service';
import { CardcounterService } from '../../Core/useraccount/cardcounter/cardcounter.service';
import { CardcounterProviders } from '../../Core/useraccount/cardcounter/cardcounter.providers';
import { LoggercoreProviders } from '../../Core/logger/loggercore.providers';
import { LoggercoreService } from '../../Core/logger/loggercore.service';
import { DatabaseModule } from '../../Database/database.module';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { MplSdkService } from './services/mpl.service';

@Module({
  imports: [DatabaseModule, AccountModule, UserModule, IpgCoreModule],
  controllers: [SdkController],
  providers: [SdkService, GeneralService, MplSdkService],
})
export class SdkModule {}
