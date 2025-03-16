import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { CounterCoreModule } from '../counter/counter.module';
import { IpgCoreModule } from '../ipg/ipgcore.module';
import { LoggercoreModule } from '../logger/loggercore.module';
import { PspverifyCoreModule } from '../psp/pspverify/pspverifyCore.module';
import { InvoiceBillingProviders } from './billing.providers';
import { InvoiceBillingCoreService } from './billing.service';
import { InvoiceBillingClubCoreService } from './services/club.service';
import { InvoiceBillingCommonCoreService } from './services/common.service';
import { InvoiceBillingIpgCoreService } from './services/ipg.service';
import { InvoiceBillingPosCoreService } from './services/pos.service';
import { InvoiceBillingWebserviceCoreService } from './services/webservice.service';

@Module({
  imports: [DatabaseModule, LoggercoreModule, CounterCoreModule, IpgCoreModule, PspverifyCoreModule],
  providers: [
    ...InvoiceBillingProviders,
    InvoiceBillingClubCoreService,
    InvoiceBillingIpgCoreService,
    InvoiceBillingPosCoreService,
    InvoiceBillingWebserviceCoreService,
    InvoiceBillingCommonCoreService,
    InvoiceBillingCoreService,
  ],
  exports: [InvoiceBillingCoreService],
})
export class InvoiceBillingCoreModule {}
