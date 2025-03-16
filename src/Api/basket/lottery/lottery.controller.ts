import { Controller, Delete, Get, Post, Put, Req } from '@vision/common';
import { GeneralService } from '../../../Core/service/general.service';
import { Body } from '@vision/common/decorators/http/route-params.decorator';
import { BasketLotteryApiService } from './lottery.service';
import { BasketAddWinnerApiDto } from './dto/winner.dto';

@Controller('basket/lottery')
export class BasketLotteryApiController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly lotteryService: BasketLotteryApiService
  ) {}

  @Get()
  async getList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.lotteryService.getLotteries(userid);
  }

  @Put()
  async push(@Body() getInfo: BasketAddWinnerApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
    return this.lotteryService.addWinner(getInfo, userid, id);
  }

  @Post()
  async new(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.lotteryService.createLottery(getInfo, userid);
  }
}
