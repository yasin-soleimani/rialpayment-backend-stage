import { Injectable } from '@vision/common';
import { InternetPaymentGatewayService } from '../../../Service/internet-payment-gateway/ipg.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { IpgCoreService } from '../../../Core/ipg/ipgcore.service';

@Injectable()
export class TicketPaymentService {
  constructor(
    private readonly iccIpgService: InternetPaymentGatewayService,
    private readonly ipgService: IpgCoreService
  ) {}

  async getPayment(amount: number, invoiceid: string): Promise<any> {
    const info = this.format(amount, invoiceid);
    const data = await this.iccIpgService.getToken(info, { ip: '::1' });
    if (data.status == 0 && data.success == true) {
      return data.token;
    } else {
      throw new UserCustomException('عملیات با خطا مولجه شده است', false, 500);
    }
  }

  async getRedirect(token, res): Promise<any> {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`
        <form action="https://service.rialpayment.ir/internetpaymentgateway/pay" method="post" id="saman_gateway">
        <input type="hidden" name="token" value="${token}" />
        </form>
        <script type="text/javascript">
        var f=document.getElementById('saman_gateway');
        f.submit();
        </script>
        `);
    res.end();
  }

  private format(amount: number, invoiceid) {
    return {
      terminalid: 2005214,
      paylaod: 'بلیط هلدینگ',
      amount,
      callbackurl: 'https://service.rialpayment.ir/ticket/payment/status',
      invoiceid: invoiceid,
    };
  }

  async getVerify(token, status): Promise<any> {
    const tokenInfo = await this.ipgService.findByUserInvoice(token);
    if (tokenInfo.details.respcode == 0) {
      const data = await this.iccIpgService.verifyPayment(token, { ip: '::1' });
      if (data.status == 0) {
        return { info: tokenInfo, status: 'ok' };
      } else {
        return { info: tokenInfo, status: 'nok' };
      }
    } else {
      return { info: tokenInfo, status: 'nok' };
    }
  }
}
