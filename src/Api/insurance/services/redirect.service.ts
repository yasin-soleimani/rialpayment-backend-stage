import { Injectable } from '@vision/common';

@Injectable()
export class InsuranceRedirectApiService {
  constructor() {}

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
}
