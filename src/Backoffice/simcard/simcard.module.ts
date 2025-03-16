import { Module } from '@vision/common';
import { SimcardCoreModule } from '../../Core/simcard/simcard.module';
import { GeneralService } from '../../Core/service/general.service';
import { SimcardBackofficeService } from './simcard.service';
import { SimcardBackofficeController } from './simcard.controller';
import { LoggercoreModule } from '../../Core/logger/loggercore.module';

@Module({
  imports: [SimcardCoreModule, LoggercoreModule],
  controllers: [SimcardBackofficeController],
  providers: [GeneralService, SimcardBackofficeService],
})
export class BackofficeSimcardModule {}
