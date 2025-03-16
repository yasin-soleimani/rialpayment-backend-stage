import { Module } from '@vision/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { GroupCoreModule } from '../../Core/group/group.module';
import { GeneralService } from '../../Core/service/general.service';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { SettingsCoreModule } from '../../Core/settings/settings.module';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';
import { ExportJsService } from './services/export-js.service';
import { SendtoallModule } from '../../Core/sendtoall/sendtoall.module';
import { SendtoallService } from './services/sendtoall.service';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { ClubCoreModule } from '../../Core/customerclub/club.module';
import { PspverifyCoreModule } from '../../Core/psp/pspverify/pspverifyCore.module';
import { GroupCardInfoApiService } from './services/card-info.service';
import { CardModule } from '../../Core/useraccount/card/card.module';
import { GroupApiDechargeService } from './services/decharge.service';
import { GroupMakeQrService } from './qr/make-qr.servie';
import { GroupCardReportApiService } from './services/charge-report.service';
import { CoreGroupTerminalBalanceModule } from '../../Core/group-terminal-balance/group-tv.module';
import { GroupExcelChargeApiService } from './services/excel-charge.service';
import { TicketsCoreModule } from '../../Core/tickets/tickets.module';
import { FileManagerCoreModule } from '../../Core/file-manager/file-manager.module';

@Module({
  imports: [
    GroupCoreModule,
    AccountModule,
    UserModule,
    SettingsCoreModule,
    MerchantcoreModule,
    ClubCoreModule,
    SendtoallModule,
    PspverifyCoreModule,
    CardModule,
    CoreGroupTerminalBalanceModule,
    TicketsCoreModule,
    FileManagerCoreModule,
  ],
  providers: [
    GroupService,
    GeneralService,
    ExportJsService,
    SendtoallService,
    GroupApiDechargeService,
    GroupCardInfoApiService,
    GroupMakeQrService,
    GroupCardReportApiService,
    GroupExcelChargeApiService,
  ],
  controllers: [GroupController],
})
export class GroupModule {}
