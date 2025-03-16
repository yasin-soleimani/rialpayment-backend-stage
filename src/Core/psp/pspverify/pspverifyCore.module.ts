import { Module } from '@vision/common';
import { PspverifyCoreService } from './pspverifyCore.service';
import { DatabaseModule } from '../../../Database/database.module';
import { PspverifyCoreProviders } from './pspverifyCore.providers';
import { PspVrifyRequestCoreService } from './services/request.service';
import { PspVerifyCoreInvoiceService } from './services/invoice.service';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [PspverifyCoreService, ...PspverifyCoreProviders, PspVrifyRequestCoreService, PspVerifyCoreInvoiceService],
  exports: [PspverifyCoreService, PspVerifyCoreInvoiceService, PspVrifyRequestCoreService],
})
export class PspverifyCoreModule {}
