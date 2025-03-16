import { Body, Controller, Post, Res } from "@vision/common";
import { InAppPurchaseApiService } from "./in-app-purchase.service";

@Controller('in-app-purchase')
export class InAppPurchaseApiController {

  constructor(
    private readonly purchaseService: InAppPurchaseApiService
  ) { }

  @Post('callback')
  async callback(@Body() getInfo, @Res() res): Promise<any> {
    return this.purchaseService.callback(getInfo, res);
  }


}