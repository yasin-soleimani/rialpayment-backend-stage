import { Controller, Post, Get, Put, Delete, Body, Req } from '@vision/common';
import { ParkingApiService } from './parking.service';
import { ParkingApiDto } from './dto/parking.dto';
import { GeneralService } from '../../Core/service/general.service';
import { VoucherQrGenerator } from '../../Core/voucher/services/voucher-qr.service';

@Controller('parking')
export class ParkingApiController {
  constructor(
    private readonly parkingService: ParkingApiService,
    private readonly generalService: GeneralService,
    private readonly voucherService: VoucherQrGenerator
  ) {}

  @Post()
  async addNew(@Body() getInfo: ParkingApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.user = userid;
    return this.parkingService.addnew(getInfo);
  }

  @Get()
  async getList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.parkingService.getList(userid);
  }

  @Put()
  async update(@Body() getInfo: ParkingApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.user = userid;
    return this.parkingService.update(getInfo);
  }

  @Delete()
  async delete(@Req() req): Promise<any> {
    const pid = await this.generalService.getPID(req);
    const userid = await this.generalService.getUserid(req);

    return this.parkingService.delete(pid, userid);
  }

  @Put('changestatus')
  async changeStatus(): Promise<any> {}

  @Get('vv')
  async voucehr(): Promise<any> {
    // return this.voucherService.makeVoucher();
  }
}
