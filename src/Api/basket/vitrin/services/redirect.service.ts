import { Injectable, InternalServerErrorException } from '@vision/common';
import { IpgCoreService } from '../../../../Core/ipg/ipgcore.service';

@Injectable()
export class BasketVitirinRedirectService {
  constructor(private readonly ipgService: IpgCoreService) {}

  async transferRedirect(ref, res): Promise<any> {
    const data = await this.ipgService.findByRef(ref);
    if (!data) throw new InternalServerErrorException();
    if (data.launch == true) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(`<head>  <meta charset="UTF-8"></head><style> body, html {
  margin: 0;
  padding: 0;
  background: slateblue;
  height: 100vh;
}
.container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.container>.message {
  width: 60vh;
  background: white;
  height: 50px;
  text-align: center;
  color: #444;
  padding: 2em;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}
.container>.message>h2 {
  margin: 0;
}</style>  <div class="container">
    <div class="message">
      <h2>توکن شما منقضی شده است</h2>
    </div>
  </div>`);
      res.end();
      return res;
    }
    await this.ipgService.launchTrue(ref);
    switch (data.type) {
      case 1: {
        let redirectUrl = `https://pec.shaparak.ir/NewIPG/?Token=` + data.token;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`<form action="${redirectUrl}" method="post" id="pec_gateway"></form>
        <script type="text/javascript">
        var f=document.getElementById('pec_gateway');
        f.submit();
        </script>`);
        res.end();
      }

      case 2: {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`
        <form action="https://asan.shaparak.ir" method="post" id="pec_gateway">
          <input type="hidden" name="RefId" value="${data.token}" />
        </form>
        <script type="text/javascript">
        var f=document.getElementById('pec_gateway');
        f.submit();
        </script>
        `);
        res.end();
        break;
      }

      case 3: {
        let terminalid, callback, invoiceid;
        if (data.terminalinfo && data.terminalinfo.mid) {
          terminalid = data.terminalinfo.mid;
          callback = 'https://service.rialpayment.ir/callback/saman';
          invoiceid = data.userinvoice;
        } else {
          terminalid = '';
          callback = 'https://core-backend.rialpayment.ir/v1/vitrin/callback';
          invoiceid = data.ref;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`
        <form action="https://sep.shaparak.ir/payment.aspx" method="post" id="saman_gateway">
        <input type="hidden" name="Amount" value="${data.amount}" />
        <input type="hidden" name="ResNum" value="${invoiceid}" />
        <input type="hidden" name="MID" value="${terminalid}" />
        <input type="hidden" name="RedirectURL" value="${callback}" />

        </form>
        <script type="text/javascript">
        var f=document.getElementById('saman_gateway');
        f.submit();
        </script>
        `);
        res.end();
        break;
      }

      case 4: {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`
        <form action="https://pna.shaparak.ir/_ipgw_/payment/" method="post" id="pna_gateway">
           <input type="hidden" name="token" value="${data.token}" />
           <input type="hidden"  name="language" value="fa"/>
        </form>
        <script type="text/javascript">
        var f=document.getElementById('pna_gateway');
        f.submit();
        </script>
        `);
        res.end();
        break;
      }
    }
  }

  async paymentRedirect(ref, res): Promise<any> {
    const data = await this.ipgService.findByRef(ref);
    if (!data) throw new InternalServerErrorException();
    if (data.launch == true) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(`<head>  <meta charset="UTF-8"></head><style> body, html {
      margin: 0;
      padding: 0;
  background: slateblue;
  height: 100vh;
}
.container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.container>.message {
  width: 60vh;
  background: white;
  height: 50px;
  text-align: center;
  color: #444;
  padding: 2em;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}
.container>.message>h2 {
  margin: 0;
}</style>  <div class="container">
    <div class="message">
      <h2>توکن شما منقضی شده است</h2>
    </div>
  </div>`);
      res.end();
      return res;
    }
    await this.ipgService.launchTrue(ref);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`
        <form action="https://sep.shaparak.ir/payment.aspx" method="post" id="saman_gateway">
        <input type="hidden" name="Amount" value="${data.amount}" />
        <input type="hidden" name="ResNum" value="${data.invoiceid}" />
        <input type="hidden" name="MID" value="31062101" />
        <input type="hidden" name="RedirectURL" value="https://core-backend.rialpayment.ir/v1/vitrin/callback" />

        </form>
        <script type="text/javascript">
        var f=document.getElementById('saman_gateway');
        f.submit();
        </script>
        `);
    res.end();
  }
}
