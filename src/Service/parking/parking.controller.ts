import { Controller, Post, Body } from '@vision/common';
import { ParkingService } from './parking.service';
import { ParkingServiceDto } from './dto/parking.dto';

@Controller('parkingpayment')
export class ParkingServiceController {
  constructor(private readonly parkingService: ParkingService) {}

  @Post()
  async payment(@Body() getInfo: ParkingServiceDto): Promise<any> {
    return this.parkingService.check(getInfo);
  }
}
