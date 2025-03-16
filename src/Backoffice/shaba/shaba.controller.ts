import { Controller, Get, Post, Put, Req, Body, Delete, InternalServerErrorException } from '@vision/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ShabaDto } from './dto/shaba.dto';
import { ShabacoreService } from '../../Core/shaba/shabacore.service';
import { MerchantDto } from '../merchant/dto/merchant.dto';
import { ShabaService } from './shaba.service';

@Controller('shaba')
export class ShabaController {
  constructor(private readonly shabaCoreService: ShabacoreService, private readonly shabaService: ShabaService) {}

  @Get()
  async getList(): Promise<any> {
    return await this.shabaCoreService.list();
  }

  @Post()
  async addShaba(@Body() shabaDto: ShabaDto): Promise<any> {
    const bankename = await this.shabaService.getBankname(shabaDto.shaba);
    shabaDto.bankname = bankename.name;
    return await this.shabaCoreService.addShaba(shabaDto);
  }

  @Delete()
  async deleteShaba(@Req() req): Promise<any> {
    const id = await this.shabaService.checkDeleteHeader(req);
    return await this.shabaCoreService.deleteShaba(id);
  }
}
