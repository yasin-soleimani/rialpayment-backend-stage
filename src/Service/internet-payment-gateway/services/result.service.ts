import { Injectable } from '@vision/common';
import { IpgCoreService } from '../../../Core/ipg/ipgcore.service';

@Injectable()
export class InternetPaymentGatewayResultService {
  constructor(private readonly ipgService: IpgCoreService) {}

  async getInfo(token, res): Promise<any> {
    const tokenInfo = await this.ipgService.findByUserInvoice(token);
    console.log(tokenInfo, 'tokenInfo xxxxxs');
    if (tokenInfo.userinvoice != token || tokenInfo.details.type != 100)
      res.redirect('http://192.168.0.199:5522/internetpaymentgateway/error');

    // await this.ipgService.addQuery( tokenInfo._id, { $set: { details: { type: 200 }}});
    console.log(tokenInfo, 'tokenInfo');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`
        <form action="${tokenInfo.callbackurl}" method="post" id="gateway">
        <input type="hidden" name="amount" value="${tokenInfo.amount}" />
        <input type="hidden" name="token" value="${tokenInfo.userinvoice}" />
        <input type="hidden" name="terminalid" value="${tokenInfo.terminalid}" />
        <input type="hidden" name="ref" value="${tokenInfo.ref}" />
        <input type="hidden" name="payload" value="${tokenInfo.payload}" />
        <input type="hidden" name="invoiceid" value="${tokenInfo.invoiceid}" />
        <input type="hidden" name="status" value="${tokenInfo.details.respcode}" />
        </form>
        <script type="text/javascript">
        var f=document.getElementById('gateway');
        f.submit();
        </script>
        `);
    res.end();
  }
}
