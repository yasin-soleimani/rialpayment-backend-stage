import { Body, Controller, Put, Get, Param, Query } from '@vision/common';
import { Roles } from '../../Guard/roles.decorations';
import { BackofficeMipgService } from './backoffice-mipg.service';
import { BackofficeMipgListFilterDto } from './dto/mipg-list-filter.dto';
import { PatchMipgDto } from './dto/patch-mipg.dto';

@Controller('new-mipg')
export class BackofficeMipgController {
  constructor(private readonly backofficeMipgService: BackofficeMipgService) {}

  @Get('')
  @Roles('admin')
  async getMipgList(@Query() query: BackofficeMipgListFilterDto): Promise<any> {
    return this.backofficeMipgService.getMipgList(query);
  }

  @Get('terminals')
  @Roles('admin')
  async getMerchantTerminals(@Query() query: BackofficeMipgListFilterDto): Promise<any> {
    return this.backofficeMipgService.getMerchantTerminals(query);
  }

  @Put('patchterminal')
  @Roles('admin')
  async patchMipg(@Body() patchMipgDto: PatchMipgDto): Promise<any> {
    return this.backofficeMipgService.patchMipg(patchMipgDto);
  }

  @Get(':terminalid')
  @Roles('admin')
  async getMipgByTerminalId(@Param('terminalid') terminalid: string): Promise<any> {
    return this.backofficeMipgService.getMipgByTerminalId(terminalid);
  }

  @Get(':terminalid/transactions')
  @Roles('admin')
  async getMipgTransactions(
    @Param('terminalid') terminalid: string,
    @Query() query: BackofficeMipgListFilterDto
  ): Promise<any> {
    return this.backofficeMipgService.getMipgTransactions(query, terminalid);
  }

  @Put(':terminalid/status')
  @Roles('admin')
  async changeMipgStatus(@Param('terminalid') terminalid: string, @Body() body: { status: boolean }): Promise<any> {
    return this.backofficeMipgService.changeMipgStatus(terminalid, body.status);
  }
}
