import { Injectable, InternalServerErrorException, faildOpt } from '@vision/common';
import { GetMipgDto } from './dto/get-mipg.dto';
import { MipgCoreService } from '../../Core/mipg/mipg.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import * as uid from 'uniqid';
import { IpgCoreService } from '../../Core/ipg/ipgcore.service';
import { MipgShaparakDto } from './dto/mipg-shaparak.dto';
import { AccountService } from '../../Core/useraccount/account/account.service';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class MipgService {
  constructor(
    private readonly mipgCoreService: MipgCoreService,
    private readonly accountService: AccountService,
    private readonly ipgService: IpgCoreService
  ) {}

  async validate(getInfo: GetMipgDto, req): Promise<any> {
    const ipguser = await this.mipgCoreService.getInfo(getInfo.terminalid);
    const checkip = await this.checkip(ipguser, req.ip);
    if (checkip || ipguser.status == false) {
      return faildOpt();
    }
    getInfo.user = ipguser.user;
    getInfo.ref = getInfo.invoiceid;
    const time = new Date().getTime();
    const timeS = time.toString();
    const resTime = timeS.substr(9);
    getInfo.userinvoice = uid('Ipg-' + resTime);
    await this.checkToken(getInfo.userinvoice);
    getInfo.paytype = ipguser.type;
    getInfo.karmozd = ipguser.karmozd;
    getInfo.wagetype = ipguser.wagetype;
    getInfo.isdirect = ipguser.isdirect;

    if (ipguser.isdirect == true) {
      if (ipguser.wagetype != 1) {
        const wallet = await this.accountService.getBalance(ipguser.user, 'wallet');
        if (!wallet) throw new InternalServerErrorException();
        if (wallet.balance < 500) throw new notEnoughMoneyException();
      }
    }

    const datax = await this.ipgService.newReq(getInfo);
    if (!datax) throw new InternalServerErrorException();
    return MipgService.returnInfo(
      true,
      ipguser.title,
      getInfo.amount,
      getInfo.terminalid,
      datax.userinvoice,
      getInfo.callbackurl
    );
  }

  async validateIn(getInfo: GetMipgDto): Promise<any> {
    const ipguser = await this.mipgCoreService.getInfo(getInfo.terminalid);

    getInfo.user = ipguser.user;
    getInfo.ref = getInfo.invoiceid;
    const time = new Date().getTime();
    const timeS = time.toString();
    const resTime = timeS.substr(9);
    getInfo.userinvoice = uid('Ipg-' + resTime);
    await this.checkToken(getInfo.userinvoice);
    getInfo.paytype = ipguser.type;
    getInfo.karmozd = ipguser.karmozd;
    getInfo.isdirect = ipguser.isdirect;

    const datax = await this.ipgService.newReq(getInfo);
    if (!datax) throw new InternalServerErrorException();
    return MipgService.returnInfo(
      true,
      ipguser.title,
      getInfo.amount,
      getInfo.terminalid,
      datax.userinvoice,
      getInfo.callbackurl
    );
  }

  private async checkip(ipgData, ip): Promise<any> {
    if (ipgData.ip == ip || ipgData.ip2 == ip || ipgData.ip3 == ip || ipgData.ip4 == ip || ipgData.ip5 == ip) {
      return false;
    } else {
      return true;
    }
  }
  async validateByinvoice(terminalid: number, invoiceid: string): Promise<any> {
    const ipguser = await this.mipgCoreService.getInfo(terminalid);
    const paymentInfo = await this.ipgService.findByInvoiceid(invoiceid);
    return MipgService.returnInfo(
      true,
      ipguser.title,
      paymentInfo.amount,
      ipguser.terminalid,
      paymentInfo.minvoiceid,
      paymentInfo.callbackurl
    );
  }

  async verify(ref, terminal, req): Promise<any> {
    const ipguser = await this.mipgCoreService.getInfo(terminal);
    const checkip = await this.checkip(ipguser, req.ip);

    if (checkip || ipguser.terminalid != terminal) {
      return {
        status: -4,
        success: false,
        message: 'پذیرنده نامعتبر',
      };
    }
    return this.ipgService.verify(terminal, ref);
  }

  async validateByinvoiceShaparak(terminalid: number, invoiceid: string, req): Promise<any> {
    const ipguser = await this.mipgCoreService.getInfo(terminalid);
    if (ipguser.ip != req.ip) {
      return {
        status: 'false',
        payid: -4,
        message: 'پذیرنده نا معتبر',
      };
    }
    const paymentInfo = await this.ipgService.findByInvoiceid(invoiceid);
    return MipgService.returnInfo(
      true,
      ipguser.title,
      paymentInfo.amount,
      ipguser.terminalid,
      paymentInfo.invoiceid,
      paymentInfo.callbackurl
    );
  }

  async shaparakPay(invoiceid, res): Promise<any> {
    const paymentInfo = await this.ipgService.findByUserInvoiceAndUPdateIPG(invoiceid);
    if (!paymentInfo) throw new InternalServerErrorException();
    if (paymentInfo.launch === true) {
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
    const tt = JSON.stringify(paymentInfo.authinfo);
    const lt = Object.keys(JSON.parse(tt));
    if (paymentInfo.auth == true && lt.length == 0) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(`
      <form action="https://service.rialpayment.ir/auth" method="post" id="pec_gateway">
        <input type="hidden" name="token" value="${paymentInfo.userinvoice}" />
      </form>
      <script type="text/javascript">
      var f=document.getElementById('pec_gateway');
      f.submit();
      </script>
      `);
      res.end();
    } else {
      await this.ipgService.launchTrue(invoiceid);
    }

    const ipguser = await this.mipgCoreService.getInfo(paymentInfo.terminalid);
    if (ipguser.status === false) {
      res.redirect(301, 'https://rialpayment.ir/block/');
    }
    console.log(':::::::::payment type:::::::: >>>>>>>>>>>>>>', paymentInfo.type);
    switch (paymentInfo.type) {
      case 1: {
        let redirectUrl = `https://pec.shaparak.ir/NewIPG/?Token=` + paymentInfo.token;
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
        <form style="opacity: 0" action="https://asan.shaparak.ir" method="post" id="pec_gateway">
          <input type="hidden" name="RefId" value="${paymentInfo.token}" />
          ${
            paymentInfo.user.mobile ? `<input type="hidden" name="mobileap" value="0${paymentInfo.user.mobile}" />` : ``
          }
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
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`
        <form action="https://sep.shaparak.ir/payment.aspx" method="post" id="saman_gateway">
        <input type="hidden" name="Amount" value="${paymentInfo.amount}" />
        <input type="hidden" name="ResNum" value="${paymentInfo.userinvoice}" />
        <input type="hidden" name="MID" value="${paymentInfo.terminalinfo.mid}" />
        <input type="hidden" name="RedirectURL" value="https://service.rialpayment.ir/callback/saman" />

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
        res.redirect(301, `https://pna.shaparak.ir/mhui/home/index/${paymentInfo.token}`);
        return res.end();
        break;
        /*res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`
        <form action="https://pna.shaparak.ir/_ipgw_/payment/" method="post" id="pna_gateway">
           <input type="hidden" name="token" value="${paymentInfo.token}" />
           <input type="hidden"  name="language" value="fa"/>
        </form>
        <script type="text/javascript">
        var f=document.getElementById('pna_gateway');
        f.submit();
        </script>
        `);
        res.end();
        break;*/
      }
    }
  }

  private static returnInfo(
    statusx: boolean,
    titlex: string,
    amountx: number,
    terminalidx: number,
    invoiceidx: string,
    callbackurlx: string
  ) {
    return {
      status: statusx,
      title: titlex,
      amount: amountx,
      terminalid: terminalidx,
      invoiceid: invoiceidx,
    };
  }

  async callback(getInfo: MipgShaparakDto): Promise<any> {
    return this.ipgService.ipgaddDetails(getInfo);
  }

  async callbackParsian(getInfo): Promise<any> {
    return this.ipgService.ipgAddDetailsParsian(getInfo);
  }

  async callbackPersian(getInfo, tmp): Promise<any> {
    return this.ipgService.ipgAddDetailsPersian(getInfo, tmp);
  }

  async callbackSaman(getInfo): Promise<any> {
    return this.ipgService.ipgAddDetailsSaman(getInfo);
  }

  async callbackPna(getInfo): Promise<any> {
    return this.ipgService.ipgAddDetailsPna(getInfo);
  }

  async callbackBehpardakht(getInfo): Promise<any> {
    // return this.ipgService.ipgAddDetailsBehpardakht(getInfo);
  }

  async check(getInfo: GetMipgDto): Promise<any> {
    if (
      isEmpty(getInfo.cardno) &&
      isEmpty(getInfo.cardpassword) &&
      isEmpty(getInfo.password) &&
      isEmpty(getInfo.nationalcode)
    ) {
      return true;
    } else {
      return false;
    }
  }

  private async checkToken(userinvoice: string): Promise<any> {
    const checkToken = await this.ipgService.findByUserInvoice(userinvoice);
    if (checkToken) throw new UserCustomException('درخواست با مشکل روبرو شده است مجددا تلاش نمایید');
  }
}
