import { Module } from '@vision/common';
import { IdentifyCoreModule } from '../../Core/useraccount/identify/identify.module';
import { BackofficeIdentifyController } from './identify.controller';
import { BackofficeIdentifyService } from './identify.service';
import { GeneralService } from '../../Core/service/general.service';

@Module({
  imports: [IdentifyCoreModule],
  controllers: [BackofficeIdentifyController],
  providers: [BackofficeIdentifyService, GeneralService],
})
export class BackofficeIdentifyModule {}
