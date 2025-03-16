import { Module } from '@vision/common';
import { AnalyzeCardCoreModule } from '../../Core/analyze/card/analyze-card.module';
import { StatisticsApiController } from './statistics.controller';
import { StatisticsApiService } from './statistics.service';
import { PspverifyCoreModule } from '../../Core/psp/pspverify/pspverifyCore.module';
import { GeneralService } from '../../Core/service/general.service';
import { StatisticsMakePdfApiService } from './services/make-pdf.service';
import { OrganizationNewChargeCoreModule } from '../../Core/organization/new-charge/charge.module';

@Module({
  imports: [AnalyzeCardCoreModule, PspverifyCoreModule, OrganizationNewChargeCoreModule],
  controllers: [StatisticsApiController],
  providers: [StatisticsApiService, GeneralService, StatisticsMakePdfApiService],
  exports: [],
})
export class StatisticsApiModule {}
