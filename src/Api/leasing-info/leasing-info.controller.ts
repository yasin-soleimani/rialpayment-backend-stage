import { Body, Controller, Get, Param, Post, Put, Req } from '@vision/common';
import { Request } from 'express';
import { CreateLeasingInfoDto } from '../../Core/leasing-info/dto/create-leasing-info.dto';
import { UpdateLeasingInfoDto } from '../../Core/leasing-info/dto/update-leasing-info.dto';
import { GeneralService } from '../../Core/service/general.service';
import { CheckLeasingInfoTitleDto } from './dto/check-leasing-info-title.dto';
import { LeasingInfoService } from './leasing-info.service';

@Controller('leasing-info')
export class LeasingInfoController {
  constructor(
    private readonly leasingInfoService: LeasingInfoService,
    private readonly generalService: GeneralService
  ) {}

  @Get()
  async getLeasingInfo(@Req() req: Request): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingInfoService.getLeasingInfo(userId);
  }

  @Post()
  async createLeasingInfo(@Req() req: Request, @Body() body: CreateLeasingInfoDto): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const dto: CreateLeasingInfoDto = { ...body, logo: req['files']['logo'] };
    return this.leasingInfoService.createLeasingInfo(userId, dto);
  }

  @Post('check-title')
  async checkTitle(@Req() req: Request, @Body() body: CheckLeasingInfoTitleDto): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingInfoService.checkLeasingInfoTitle(userId, body);
  }

  @Put(':id')
  async updateLeasingInfo(
    @Req() req: any,
    @Param('id') leasingInfoId: string,
    @Body() body: Partial<UpdateLeasingInfoDto>
  ): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const dto: UpdateLeasingInfoDto = {
      title: body.title,
      logo: req.files?.logo,
      description: body.description,
    };
    return this.leasingInfoService.updateLeasingInfo(leasingInfoId, userId, dto);
  }
}
