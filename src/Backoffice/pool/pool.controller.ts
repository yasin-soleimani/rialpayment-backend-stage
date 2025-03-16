import { Body, Controller, Get, Post, Put, Req } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { Roles } from '../../Guard/roles.decorations';
import { BackofficePoolChargeDto } from './dto/charge.dto';
import { BackofficePoolAddNewDto, BackofficePoolFilterDto } from './dto/pool.dto';
import { BackofficePoolService } from './pool.service';
import { BackofficePoolDeductionDto } from './dto/deduction.dto';

@Controller('pool')
export class BackofficePoolController {
  constructor(private readonly poolService: BackofficePoolService, private readonly generalService: GeneralService) {}

  @Post('charge')
  @Roles('admin')
  async chargePool(@Body() getInfo: BackofficePoolChargeDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.poolService.charge(getInfo, userid);
  }

  @Post('deduction')
  @Roles('admin')
  async poolDeduction(@Body() getInfo: BackofficePoolDeductionDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.poolService.deduction(getInfo, userid);
  }

  @Post()
  @Roles('admin')
  async addNewPool(@Body() getInfo: BackofficePoolAddNewDto, @Req() req): Promise<any> {
    console.log(getInfo, 'gg');
    const userid = await this.generalService.getUserid(req);
    return this.poolService.addNewPool(getInfo, userid);
  }

  @Post('filter')
  @Roles('admin')
  async getPoolList(@Body() getInfo: BackofficePoolFilterDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.poolService.getListPool(getInfo, userid, page);
  }

  @Post('status')
  @Roles('admin')
  async changeStatusPool(@Body() getInfo: BackofficePoolAddNewDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.poolService.changeStatusPool(getInfo, userid);
  }

  @Put()
  @Roles('admin')
  async editPool(@Body() getInfo: BackofficePoolAddNewDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.poolService.editPool(getInfo, userid);
  }

  // History
  @Post('history')
  // @Roles('admin')
  async getHistoryList(@Body() getInfo: BackofficePoolAddNewDto, @Req() req): Promise<any> {
    // const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);

    return this.poolService.getHistoryList(getInfo, page);
  }

  //TurnOver
  @Post('turnover')
  @Roles('admin')
  async getTurnOverList(@Body() getInfo: BackofficePoolAddNewDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);

    return this.poolService.turnOverList(getInfo, userid, page);
  }

  @Post('settings')
  @Roles('admin')
  async settings(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.poolService.setSettings(getInfo);
  }
}
