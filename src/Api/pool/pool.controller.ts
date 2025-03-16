import { Body, Controller, Get, Post, Req } from '@vision/common';
import { Put } from '@vision/common/decorators/http/request-mapping.decorator';
import { GeneralService } from '../../Core/service/general.service';
import { PoolAddNewApiDto, PoolApiDto } from './dto/pool.dto';
import { PoolApiService } from './pool.service';

@Controller('pool')
export class PoolApiController {
  constructor(private readonly generalService: GeneralService, private readonly poolService: PoolApiService) {}

  @Post()
  async addNewPool(@Body() getInfo: PoolAddNewApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.poolService.addNewPool(getInfo, userid);
  }

  @Get()
  async getPoolList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);

    return this.poolService.getPoolList(userid, page);
  }

  @Post('charge')
  async chargePool(@Body() getInfo: PoolApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.poolService.charge(getInfo, userid);
  }

  @Post('turnover')
  async getTurnoverList(@Body() getInfo: PoolApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);

    return this.poolService.getTurnOverList(getInfo.pool, userid, page);
  }

  @Put('settings')
  async udpateRemainPool(@Body() getInfo: PoolAddNewApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.poolService.udpateMinRemain(getInfo, userid);
  }
}
