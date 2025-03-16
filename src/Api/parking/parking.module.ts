import { Module } from '@vision/common';
import { PlatnoCoreModule } from '../../Core/plateno/plateno.module';
import { ParkingApiController } from './parking.controller';
import { ParkingApiService } from './parking.service';
import { GeneralService } from '../../Core/service/general.service';
import { VoucherModule } from '../../Core/voucher/voucher.module';

@Module({
  imports: [PlatnoCoreModule, VoucherModule],
  controllers: [ParkingApiController],
  providers: [ParkingApiService, GeneralService],
})
export class ParkingApiModule {}
