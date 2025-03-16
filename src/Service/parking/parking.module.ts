import { Module } from '@vision/common';
import { ParkingServiceController } from './parking.controller';
import { ParkingService } from './parking.service';
import { PlatnoCoreModule } from '../../Core/plateno/plateno.module';
import { AccountModule } from '../../Core/useraccount/account/account.module';

@Module({
  imports: [PlatnoCoreModule, AccountModule],
  controllers: [ParkingServiceController],
  providers: [ParkingService],
})
export class ParkingServiceModule {}
