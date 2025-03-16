import { Body, Controller, Get, Post, Req } from "@vision/common";
import { GeneralService } from "../../Core/service/general.service";
import { DiscountApiService } from "./discount.service";

@Controller('discount')
export class DiscountApiController {

  constructor(
    private readonly generalService: GeneralService,
    private readonly discountService: DiscountApiService
  ) { }

  @Get('list')
  async getList(@Req() req): Promise<any> {

    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);

    return this.discountService.getList(userid, page);
  }

  @Post('details')
  async getDetails(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);

    return this.discountService.getDetails(userid, getInfo.terminal, page);
  }
}