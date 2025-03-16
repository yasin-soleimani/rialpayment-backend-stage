import { Controller, Get, Post, Put, Req, Body, Delete, InternalServerErrorException } from '@vision/common';
import { DispatcherBackofficeUserDto } from './dto/dispatcher-backoffice-user.dto';
import { DispatcherBackofficeService } from './dispatcher-backoffice.service';
import { DispatcherBackofficeCardDto } from './dto/dispatcher-backoffice-card.dto';
import { DispatcherBackofficeMerchantDto } from './dto/dispatcher-backoffice-merchant.dto';

@Controller('dispatcherManagement')
export class DispatcherBackofficeController {
  constructor(private readonly dispatcherService: DispatcherBackofficeService) {}

  @Post('user')
  async addDispatcherUser(@Body() getInfo: DispatcherBackofficeUserDto): Promise<any> {
    return await this.dispatcherService.addnewUser(getInfo);
  }

  @Post('card')
  async addnewCard(@Body() getInfo: DispatcherBackofficeCardDto): Promise<any> {
    return await this.dispatcherService.addnewCard(getInfo);
  }

  @Post('merchant')
  async addnewMerchant(@Body() getInfo: DispatcherBackofficeMerchantDto): Promise<any> {
    return await this.dispatcherService.addnewMerchant(getInfo);
  }
}
