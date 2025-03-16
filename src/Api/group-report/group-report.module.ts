import { Module } from '@vision/common';
import { GroupReportCoreModule } from '../../Core/group-report/group-report.module';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';
import { PspverifyCoreModule } from '../../Core/psp/pspverify/pspverifyCore.module';
import { GeneralService } from '../../Core/service/general.service';
import { GroupReportApiController } from './controller/group-report.controller';
import { GroupReportExcelApiService } from './services/excel.service';
import { GroupReportApiService } from './services/group-report.service';
import { FileManagerCoreModule } from '../../Core/file-manager/file-manager.module';
import { GroupCoreModule } from '../../Core/group/group.module';
import { CardModule } from '../../Core/useraccount/card/card.module';

@Module({
  imports: [GroupReportCoreModule,MerchantcoreModule, FileManagerCoreModule, GroupCoreModule, CardModule],
  controllers: [GroupReportApiController],
  providers: [GeneralService, GroupReportApiService, GroupReportExcelApiService],
})
export class GroupReportApiModule {}
