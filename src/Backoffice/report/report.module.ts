import { Module } from '@vision/common';
import { BackofficeReportController } from './report.controller';
import { BackofficeReportService } from './report.service';
import { GeneralService } from '../../Core/service/general.service';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { PspverifyCoreModule } from '../../Core/psp/pspverify/pspverifyCore.module';
import { LoggercoreModule } from '../../Core/logger/loggercore.module';
import { MipgModule } from '../../Core/mipg/mipg.module';

@Module({
  imports: [IpgCoreModule, PspverifyCoreModule, LoggercoreModule, MipgModule],
  controllers: [BackofficeReportController],
  providers: [BackofficeReportService, GeneralService],
  exports: [],
})
export class BackofficeReportModule {}
