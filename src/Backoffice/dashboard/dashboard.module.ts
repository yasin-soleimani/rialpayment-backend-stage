import { Module } from '@vision/common';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { BackofficeDashboardController } from './dashboard.controller';
import { BackofficeDashboardService } from './dashboard.service';
import { GeneralService } from '../../Core/service/general.service';
import { PspverifyCoreModule } from '../../Core/psp/pspverify/pspverifyCore.module';
import { LoggercoreModule } from '../../Core/logger/loggercore.module';

@Module({
  imports: [IpgCoreModule, PspverifyCoreModule, LoggercoreModule],
  controllers: [BackofficeDashboardController],
  providers: [BackofficeDashboardService, GeneralService],
  exports: [],
})
export class BackofficeDashboardModule {}
