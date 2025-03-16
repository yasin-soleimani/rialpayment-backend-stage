import { Controller, Post, Body, Put, Req, Get } from '@vision/common';
import { MerchantcoreService } from '../../Core/merchant/merchantcore.service';
import { GeneralService } from '../../Core/service/general.service';
import { MerchantcoreDto } from '../../Core/merchant/dto/merchantcore.dto';
import { Roles } from '../../Guard/roles.decorations';
import { UserMerchantService } from '../../Api/merchant/merchant.service';

@Controller('merchant-office')
export class MerchantController {
  constructor(
    private readonly merchantCore: MerchantcoreService,
    private readonly merchantApiService: UserMerchantService,
    private readonly generalService: GeneralService
  ) {}

  @Roles('admin')
  @Get('')
  async getList(@Req() req): Promise<any> {
    await this.generalService.getUserid(req);
    const user = await this.generalService.getID(req);
    const page = await this.generalService.getPage(req);
    return await this.merchantApiService.getListMerchants('', user, page);
  }

  @Roles('admin')
  @Put()
  async updateMerchant(@Body() merchantDto: MerchantcoreDto, @Req() req): Promise<any> {
    await this.generalService.getUserid(req);
    const merchant = await this.generalService.getMerchantCode(req);
    const user = await this.generalService.getID(req);
    return await this.merchantCore.editMerchant(merchant, user, merchantDto);
  }

  // @Post('strategy')
  // async newStrategy(@Body() strategyDto: StrategyDto): Promise<any> {
  //   return await this.strategyService.newStrategy(strategyDto);
  // }

  // @Put('strategy')
  // async updateStrategy(@Body() strategyDto: StrategyDto): Promise<any> {
  //   return await this.strategyService.update(strategyDto);
  // }

  // @Delete('strategy')
  // async removeStrategy(@Body() strategyDto: StrategyDto): Promise<any>{
  //   return await this.removeStrategy(strategyDto);
  // }
}
