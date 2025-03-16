import { Controller, Post, Req, Get } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { Body } from '@vision/common/decorators/http/route-params.decorator';
import { VoucherApiService } from './voucher.service';
import { VoucherApiDto } from './dto/voucher.dto';
import { VoucherSearchDto } from './dto/voucher-search.dto';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly generalService: GeneralService, private readonly voucherService: VoucherApiService) {}

  @Post()
  async MakeVoucher(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.voucherService.makeIt(getInfo, userid);
  }

  @Post('filter')
  async getUsedVoucher(@Body() getInfo: VoucherSearchDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.voucherService.getUsedList(getInfo, userid, page);
  }

  @Post('use')
  async useVoucher(@Body() getInfo: VoucherApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.voucherService.use(getInfo, userid);
  }

  @Get('update')
  async update(): Promise<any> {
    return this.voucherService.update();
  }

  @Get('update/mod')
  async updateMod(): Promise<any> {
    return this.voucherService.updateMod();
  }
}
