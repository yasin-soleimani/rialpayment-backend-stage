import { Module } from '@vision/common';
import { IpgCoreService } from './ipgcore.service';
import { IpgCoreProviders } from './ipgcore.providers';
import { DatabaseModule } from '../../Database/database.module';
import { CardcounterService } from '../useraccount/cardcounter/cardcounter.service';
import { GeneralService } from '../service/general.service';
import { CardcounterProviders } from '../useraccount/cardcounter/cardcounter.providers';
import { LoggercoreService } from '../logger/loggercore.service';
import { LoggercoreProviders } from '../logger/loggercore.providers';
import { AccountModule } from '../useraccount/account/account.module';
import { UserModule } from '../useraccount/user/user.module';
import { IpgParsianService } from './services/parsian/parsian.service';
import { IpgPersianService } from './services/persian/persian.service';
import { IpgReportService } from './services/report.class';
import { MipgModule } from '../mipg/mipg.module';
import { IpgSamanService } from './services/saman/saman.service';
import { PardakhtNovinService } from './services/pna/pna.service';
import { IpgParsianMplCoreService } from './services/parsian/parsian-mpl.service';
import { ShaparakSettlementModule } from '../shaparak/settlement/settlement.module';
import { IpgCoreCharegService } from './services/common/ipg-charge.service';
import { IpgCoreCheckPanService } from './services/common/check-pan.service';
import { IpgBehpardakhtService } from './services/behpardakht/behpardakht.service';
import { IpgCoreInvoiceService } from './services/common/invoice.service';
import { ClubpPwaModule } from '../clubpwa/club-pwa.module';
import { PardakhtNovinNewService } from './services/pna/new-pna.service';

@Module({
  imports: [DatabaseModule, AccountModule, UserModule, MipgModule, ShaparakSettlementModule, ClubpPwaModule],
  controllers: [],
  providers: [
    LoggercoreService,
    CardcounterService,
    GeneralService,
    IpgCoreService,
    IpgCoreCheckPanService,
    IpgParsianService,
    IpgPersianService,
    IpgReportService,
    IpgSamanService,
    IpgCoreCharegService,
    PardakhtNovinService,
    PardakhtNovinNewService,
    IpgParsianMplCoreService,
    IpgBehpardakhtService,
    IpgCoreInvoiceService,
    ...IpgCoreProviders,
    ...CardcounterProviders,
    ...LoggercoreProviders,
  ],
  exports: [IpgCoreService, IpgParsianMplCoreService, IpgCoreCharegService, IpgReportService, IpgCoreInvoiceService],
})
export class IpgCoreModule {}
