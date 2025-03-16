import { Module } from '@vision/common';
import { IpgBackofficeController } from './ipg.controller';
import { IpgBackofficeService } from './ipg.service';
import { GeneralService } from '../../Core/service/general.service';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';

@Module({
  imports: [IpgCoreModule],
  controllers: [IpgBackofficeController],
  providers: [IpgBackofficeService, GeneralService],
  exports: [],
})
export class IpgBackofficeModule {}
