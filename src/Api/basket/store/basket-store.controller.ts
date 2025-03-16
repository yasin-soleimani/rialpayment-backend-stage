import { Controller, Delete, Get, Post, Put, Req } from '@vision/common';
import { BasketStoreApiService } from './basket-store.service';
import { GeneralService } from '../../../Core/service/general.service';
import { Body, Param } from '@vision/common/decorators/http/route-params.decorator';
import { BasketStoreApiDto } from './dto/basket-store.dto';
import { Request } from 'express';
import { UpdateStoreTransmissionSettingsDto } from './dto/update-store-transmission-settings.dto';
import { BasketDeliveryTime } from '../../../Core/basket/delivery-time/interfaces/delivery-time.interface';
import { BasketDeliveryTimeDto, UpdateDeliveryTimeDto } from '../../../Core/basket/delivery-time/dto/delivery-time.dto';

@Controller('basket/store')
export class BasketStoreController {
  constructor(private readonly storeService: BasketStoreApiService, private readonly generalService: GeneralService) {}

  @Post()
  async addNew(@Body() getInfo: BasketStoreApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.storeService.addNew(getInfo, userid, req);
  }

  @Post('check')
  async checkNickname(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.storeService.checkNickname(getInfo.nickname);
  }

  @Get()
  async getInfo(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.storeService.getData(userid);
  }

  @Get('nickname')
  async getStoreNickname(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.storeService.getNickname(userid);
  }

  @Put()
  async update(@Body() getInfo: BasketStoreApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.storeService.update(getInfo, userid, req);
  }

  @Put('banner')
  async updateBanner(@Body() getInfo: BasketStoreApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.storeService.uploadBanners(req, userid);
  }
  @Delete('banner')
  async deleteBanner(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const bannerId = await this.generalService.getID(req);
    return this.storeService.deleteBanner(userid, bannerId);
  }

  @Post('status')
  async changestatus(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.storeService.changeStatus(userid, getInfo.status);
  }

  @Post('details')
  async getStoreDetails(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
  }

  @Post('ipg')
  async setIpg(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.storeService.setIpg(userid, getInfo.terminalid);
  }

  @Put('transmissionsettings')
  async updateTransmissionSettings(
    @Body() getInfo: UpdateStoreTransmissionSettingsDto,
    @Req() req: Request
  ): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.storeService.updateTransmissionSettings(getInfo, userId, req);
  }

  @Get(':storeId/deliveryTime')
  async getStoreDeliveryTime(
    @Req() req: Request,
    @Param('storeId') basketStoreId: string
  ): Promise<BasketDeliveryTime[]> {
    await this.generalService.getUserid(req);
    return this.storeService.getBasketDeliveryTime(basketStoreId);
  }

  @Post(':storeId/deliveryTime')
  async addDeliveryTime(
    @Req() req: Request,
    @Param('storeId') basketStoreId: string,
    @Body() dto: BasketDeliveryTimeDto
  ): Promise<BasketDeliveryTime> {
    await this.generalService.getUserid(req);
    return this.storeService.addDeliveryTime(basketStoreId, dto);
  }

  @Put(':storeId/deliveryTime/:deliveryTimeId')
  async updateDeliveryTime(
    @Req() req: Request,
    @Param('storeId') basketStoreId: string,
    @Param('deliveryTimeId') deliveryTimeId: string,
    @Body() dto: UpdateDeliveryTimeDto
  ): Promise<BasketDeliveryTime> {
    await this.generalService.getUserid(req);
    return this.storeService.updateDeliveryTime(basketStoreId, deliveryTimeId, dto);
  }
}
