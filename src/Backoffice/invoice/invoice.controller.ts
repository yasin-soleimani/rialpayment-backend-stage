import { Body, Controller, Req } from '@vision/common';
import { Get, Post } from '@vision/common/decorators/http/request-mapping.decorator';
import { GeneralService } from '../../Core/service/general.service';
import { BackofficeInvoiceService } from './invoice.service';

@Controller('invoice')
export class BackofficeInvoiceController {
  constructor(
    private readonly invoiceService: BackofficeInvoiceService,
    private readonly generalService: GeneralService
  ) {}

  @Post('generate')
  async generate(@Body() getInfo, @Req() req): Promise<any> {
    return this.invoiceService.makeInvoice(Number(getInfo.type), Number(getInfo.date));
  }

  @Post('cancel')
  async cancel(@Body() getInfo, @Req() req): Promise<any> {
    return this.invoiceService.cancelInvoice(getInfo.id);
  }

  @Post()
  async getList(@Body() getInfo, @Req() req): Promise<any> {
    const page = this.generalService.getPage(req);
    return this.invoiceService.getList(Number(page), getInfo.type, getInfo.date);
  }
}
