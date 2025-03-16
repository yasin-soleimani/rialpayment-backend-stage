import { Controller, Post, Req } from '@vision/common';
import { GeneralService } from '../../../Core/service/general.service';
import { BasketApiShopService } from './shop.service';
import { Body } from '@vision/common/decorators/http/route-params.decorator';
import { BasketShopApiDto, BasketShopReportExportDto } from './dto/shop.dto';
import { BasketShopStatusApiDto } from './dto/status.dto';

@Controller('basket/shop')
export class BasketApiShopController {
  constructor(private readonly generalService: GeneralService, private readonly shopService: BasketApiShopService) {}

  @Post('report')
  async getMerchantFilter(@Body() getInfo: BasketShopApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.shopService.getMerchantFilter(getInfo, userid, page);
  }

  @Post('report/export')
  async getExcelExports(@Body() getInfo: BasketShopReportExportDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.shopService.getMerchantShopExport(getInfo, userid);
  }

  @Post('status')
  async changeShopStatus(@Body() getInfo: BasketShopStatusApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.shopService.changeStatus(getInfo, userid);
  }

  @Post('user')
  async getUserHistory(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.shopService.getUserFilter(userid, page);
  }

  @Post('details')
  async getShopDetails(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.shopService.getShopInfo(userid, getInfo.invoiceid);
  }
}
