import {
  Controller,
  Get,
  Post,
  Put,
  Req,
  Body,
  Delete,
  InternalServerErrorException,
  successOptWithDataNoValidation,
} from '@vision/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PspCoreService } from '../../Core/psp/psp/pspCore.service';
import { PspDto } from './dto/psp.dto';
import { PspService } from './psp.service';
import { PspipDto } from './dto/pspip.dto';
import { PspipCoreService } from '../../Core/psp/pspip/pspipCore.service';

@Controller('pspmanagement')
export class PspController {
  constructor(
    private readonly pspCoreService: PspCoreService,
    private readonly pspService: PspService,
    private readonly pspipService: PspipCoreService
  ) {}

  @Get()
  async getList(): Promise<any> {
    return await this.pspCoreService.list();
  }

  @Get('list')
  async getLists(): Promise<any> {
    return successOptWithDataNoValidation(await this.pspCoreService.getListsFilter());
  }

  @Post()
  async addnewpsp(@Body() pspDto: PspDto): Promise<any> {
    const psp = await this.pspCoreService.addPsp(pspDto);
    if (!psp) throw new InternalServerErrorException();
    return PspService.successOpt();
  }

  @Put()
  async update(@Body() pspDto: PspDto): Promise<any> {
    const psp = await this.pspCoreService.updatePsp(pspDto);
    if (!psp) throw new InternalServerErrorException();
    return PspService.successOpt();
  }

  @Delete()
  async delete(@Req() req): Promise<any> {
    const terminalid = this.pspService.checkDeleteHeader(req);
    const psp = await this.pspCoreService.deletePsp(terminalid);
    if (!psp) throw new InternalServerErrorException();
    return PspService.successOpt();
  }

  @Post('ip')
  async newip(@Body() pspipDto: PspipDto): Promise<any> {
    const pspip = await this.pspipService.newip(pspipDto);
    if (!pspip) throw new InternalServerErrorException();
    return PspService.successOpt();
  }

  @Put('ip')
  async updateip(@Body() pspipDto: PspipDto): Promise<any> {
    const pspip = await this.pspipService.update(pspipDto);
    if (!pspip) throw new InternalServerErrorException();
    return PspService.successOpt();
  }

  @Delete('ip')
  async deleteip(@Body() pspipDto: PspipDto): Promise<any> {
    const pspip = await this.pspipService.remove(pspipDto);
    if (!pspip) throw new InternalServerErrorException();
    return PspService.successOpt();
  }
}
