import { Controller, Post, Req } from '@vision/common';
import { Body } from '@vision/common/decorators/http/route-params.decorator';
import { DirectIpgService } from './driect-ipg.service';

@Controller('direct/ipg')
export class DirectIpgController {
  constructor(private readonly directIpgService: DirectIpgService) {}

  @Post()
  async getMipgInfo(@Body() getInfo, @Req() req): Promise<any> {
    return this.directIpgService.getMipgInfo(getInfo.terminalid, req.ip);
  }

  @Post('info')
  async getTraxInfo(@Body() getInfo): Promise<any> {
    return this.directIpgService.getTraxInfo(getInfo.terminalid, getInfo.invoiceid);
  }

  @Post('infoinvoice')
  async getTraxInfoByInvoice(@Body() getInfo): Promise<any> {
    return this.directIpgService.getTraxInfoByInvoice(getInfo.invoiceid);
  }

  @Post('infotoken')
  async getTraxInfoByToken(@Body() getInfo): Promise<any> {
    return this.directIpgService.getInfoByToken(getInfo.token);
  }

  @Post('details')
  async submitDetails(@Body() getInfo, @Req() req): Promise<any> {
    return this.directIpgService.submitIpgDetails(
      getInfo.terminalid,
      getInfo.invoiceid,
      getInfo.amount,
      getInfo.psp,
      getInfo.karmozd,
      getInfo.paytype,
      getInfo.callback,
      getInfo.user,
      getInfo.respmsg,
      getInfo.userinvoice,
      getInfo.token,
      getInfo.wagetype
    );
  }

  @Post('callbackDetails')
  async submitCallBackDetails(@Body() getInfo, @Req() req): Promise<any> {
    return this.directIpgService.submitCallBackDetails(
      getInfo.invoiceid,
      getInfo.respcode,
      getInfo.respmsg,
      getInfo.cardno,
      getInfo.rrn,
      getInfo.refnum
    );
  }

  @Post('confirm')
  async confirmTrax(@Body() getInfo, @Req() req): Promise<any> {
    return this.directIpgService.confirm(getInfo.terminalid, getInfo.invoiceid);
  }

  @Post('confirmParsian')
  async confirmParsian(@Body() getInfo): Promise<any> {
    return this.directIpgService.confirmParsian(
      getInfo.token,
      getInfo.cardnumber,
      getInfo.rrn,
      getInfo.respcode,
      getInfo.respmsg
    );
  }

  @Post('wage')
  async confirmWage(@Body() getInfo): Promise<any> {
    return this.directIpgService.confirmWage(getInfo);
  }

  @Post('reverse')
  async reverseTrax(@Body() getInfo, @Req() req): Promise<any> {
    return this.directIpgService.reverse(getInfo.terminalid, getInfo.invoiceid);
  }

  @Post('wallet/getbalance')
  async getBalance(@Body() getInfo, @Req() req): Promise<any> {
    return this.directIpgService.getBalance(getInfo.terminalid);
  }
}
