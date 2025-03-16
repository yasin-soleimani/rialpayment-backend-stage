import { Module } from '@vision/common';
import { MplApiController } from './mpl.controller';
import { MplApiService } from './mpl.service';
import { GeneralService } from '../../Core/service/general.service';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';

@Module({
  imports: [IpgCoreModule],
  controllers: [MplApiController],
  providers: [MplApiService, GeneralService],
  exports: [],
})
export class MplApiModule {}
