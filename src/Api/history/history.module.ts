import { Module } from '@vision/common';
import { HistoryService } from './history.service';
import { DatabaseModule } from '../../Database/database.module';
import { HistoryController } from './history.controller';
import { GeneralService } from '../../Core/service/general.service';
import { RahyabCoreModule } from '../../Core/sms/rahyab/rahyab.module';
import { HistoryCoreModule } from '../../Core/history/history.module';
import { HistoryExcelService } from './services/excel.service';
import { LoggercoreModule } from '../../Core/logger/loggercore.module';
import { OrganizationNewChargeCoreModule } from '../../Core/organization/new-charge/charge.module';
import { HistoryApiOrganizationService } from './services/organization.service';

@Module({
  imports: [DatabaseModule, RahyabCoreModule, LoggercoreModule, HistoryCoreModule, OrganizationNewChargeCoreModule],
  controllers: [HistoryController],
  providers: [HistoryService, GeneralService, HistoryExcelService, HistoryApiOrganizationService],
})
export class HistoryModule {}
