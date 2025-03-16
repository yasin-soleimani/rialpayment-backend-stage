import { Module } from '@vision/common';
import { PspService } from './psp.service';
import { DatabaseModule } from '../../Database/database.module';
import { GeneralService } from '../../Core/service/general.service';
import { PspController } from './psp.controller';
import { PspCoreService } from '../../Core/psp/psp/pspCore.service';
import { PspCoreProviders } from '../../Core/psp/psp/pspCore.providers';
import { PspipCoreProviders } from '../../Core/psp/pspip/pspipCore.providers';
import { PspipCoreService } from '../../Core/psp/pspip/pspipCore.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PspController],
  providers: [PspService, GeneralService, PspCoreService, PspipCoreService, ...PspCoreProviders, ...PspipCoreProviders],
})
export class PspModule {}
