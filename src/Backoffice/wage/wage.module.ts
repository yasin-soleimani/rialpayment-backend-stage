import { Module } from '@vision/common';
import { WageSystemCoreModule } from '../../Core/wage/wage.module';
import { BackofficeWageController } from './wage.controller';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { BackOfficeWageService } from './wage.service';
import { MipgModule } from '../../Core/mipg/mipg.module';
import { GeneralService } from '../../Core/service/general.service';
import { LoggercoreModule } from '../../Core/logger/loggercore.module';
import { PspverifyCoreModule } from '../../Core/psp/pspverify/pspverifyCore.module';

@Module({
  imports: [WageSystemCoreModule, IpgCoreModule, LoggercoreModule, MipgModule, PspverifyCoreModule],
  controllers: [BackofficeWageController],
  providers: [BackOfficeWageService, GeneralService],
})
export class BackofficeWageModule {}
