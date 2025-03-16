import { Injectable, InternalServerErrorException, successOpt } from '@vision/common';
import { GetChargeDto } from './dto/get-charge.dto';
import { IpgCoreService } from '../../Core/ipg/ipgcore.service';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { ChargeDetailsDto } from './dto/charge-details.dto';
import * as UniqueNumber from 'unique-number';
import { OrganizationChargeService } from '../../Core/organization/charge/organization-charge.service';
import { AccountService } from '../../Core/useraccount/account/account.service';
import { GeneralService } from '../../Core/service/general.service';
import { UserService } from '../../Core/useraccount/user/user.service';
import { OrganizationChargeSendMessage } from '@vision/common/messages/SMS';
import { LoggercoreService } from '../../Core/logger/loggercore.service';
import { CardService } from '../../Core/useraccount/card/card.service';
import { IpgParsianDto } from './dto/parsian.details.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { LogegerCoreTodayService } from '../../Core/logger/services/today-log.service';
import { CardChargeHistoryCoreService } from '../../Core/useraccount/card/services/card-history.service';
import { CardChargeHistoryTypeConst } from '../../Core/useraccount/card/const/card-charge-type.const';
import { CardsStarters } from '@vision/common/enums/cards-starters';

@Injectable()
export class ChargeService {
  constructor(
    private readonly ipgService: IpgCoreService,
    private readonly chargeOrgService: OrganizationChargeService,
    private readonly accountService: AccountService,
    private readonly generalService: GeneralService,
    private readonly userService: UserService,
    private readonly loggerTodayService: LogegerCoreTodayService,
    private readonly loggerService: LoggercoreService,
    private readonly cardService: CardService,
    private readonly cardHistoryService: CardChargeHistoryCoreService
  ) {}

  async newIpg(getinfo: GetChargeDto, userid): Promise<any> {
    if (Number(getinfo.amount) <= 10000) throw new UserCustomException('مبلغ باید بیشتر از 10000 ریال باشد');
    this.checkValidation(userid);
    const uniqueNumber = new UniqueNumber(true);
    getinfo.user = userid;
    getinfo.invoiceid = 'Charge-' + uniqueNumber.generate();
    getinfo.callbackurl = 'https://core-backend.rialpayment.ir/v1/payment/callback';
    const ipg = await this.ipgService.create(getinfo);
    return this.successTransform(ipg);
  }

  async chargeSafebox(getInfo: GetChargeDto): Promise<any> {
    const uniqueNumber = new UniqueNumber(true);
    getInfo.invoiceid = 'Charge-' + uniqueNumber.generate();
    getInfo.callbackurl = 'https://core-backend.rialpayment.ir/v1/payment/callback';
    const ipg = await this.ipgService.create(getInfo);
    return this.successTransform(ipg);
  }

  async organizationCharge(userid, getInfo: any): Promise<any> {
    const info = await this.checkUser(getInfo.users);
    const uInfo = await this.userService.getInfoByUserid(userid);

    if (info.cards.length > 0) {
      for (let i = 0; info.cards.length > i; i++) {
        const cardInfo = await this.cardService.getCardInfoById(info.cards[i]);

        const title = ' شارژ اعتبار سازمانی ' + cardInfo.cardno + ' توسط ' + uInfo.fullname;
        const ref = 'OrgCredit-' + new Date().getTime();
        const log = this.loggerService.setLogg(title, ref, getInfo.amount, true, userid, info.users[i]);
        this.loggerService.newLogg(log);

        this.chargeOrgService.chargeCard(userid, info.cards[i], null, getInfo.amount);
        const cardTitle = 'شارژ کارت سازمانی';
        this.cardHistoryService.addNew(
          userid,
          info.cards[i],
          getInfo.amount,
          cardTitle,
          CardChargeHistoryTypeConst.OrganiationCharge,
          cardInfo.cardno
        );
      }
    }

    if (info.users.length > 0) {
      for (let i = 0; info.users.length > i; i++) {
        const userInfo = await this.userService.getInfoByUserid(info.users[i]);
        if (userInfo) {
          this.accountService.chargeAccount(info.users[i], 'org', getInfo.amount);

          const msg = OrganizationChargeSendMessage(userInfo.fullname, getInfo.amount);
          this.generalService.AsanaksendSMS(
            process.env.ASANAK_USERNAME,
            process.env.ASANAK_PASSWORD,
            process.env.ASANAK_NUMBER,
            '0' + userInfo.mobile,
            msg
          );

          const title = ' شارژ اعتبار سازمانی ' + userInfo.fullname + ' توسط ' + uInfo.fullname;
          const ref = 'OrgCredit-' + new Date().getTime();
          const log = this.loggerService.setLogg(title, ref, getInfo.amount, true, userid, info.users[i]);
          this.loggerService.newLogg(log);

          this.chargeOrgService.charge(userid, info.users[i], null, getInfo.amount);
          const cardTitle = 'شارژ کارت سازمانی';

          const cardInfo = await this.cardService.getCardByUserID(userInfo._id);
          this.cardHistoryService.addNew(
            userid,
            info.cards[i],
            getInfo.amount,
            cardTitle,
            CardChargeHistoryTypeConst.OrganiationCharge,
            cardInfo.cadno
          );
        }
      }
    }

    return successOpt();
  }

  private async checkUser(users): Promise<any> {
    const usersSplit = users.split(',');
    let cards = Array();
    let usersArray = Array();
    for (let i = 0; usersSplit.length > i; i++) {
      const res = usersSplit[i].substr(0, 6);
      if (CardsStarters.includes(res)) {
        const cardInfo = await this.getCardsId(usersSplit[i]);
        if (cardInfo.card) {
          cards.push(cardInfo.card);
        } else {
          usersArray.push(cardInfo.user);
        }
      } else {
        usersArray.push(usersSplit[i]);
      }
    }
    return {
      cards: cards,
      users: usersArray,
    };
  }

  private async getCardsId(card): Promise<any> {
    const cardInfo = await this.cardService.getCardInfo(card);
    if (!cardInfo.user) {
      return { card: cardInfo._id };
    } else {
      return { user: cardInfo.user._id };
    }
  }

  async getInfoByRef(ref: string, res): Promise<any> {
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
        break;
      }

      case 2: {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`
        <form action="https://asan.shaparak.ir" method="post" id="pec_gateway">
          <input name="RefId" value="${data.token}" />
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
        <input type="hidden" name="Amount" value="${data.amount}" />
        <input type="hidden" name="ResNum" value="${data.invoiceid}" />
        <input type="hidden" name="MID" value="11921467" />
        <input type="hidden" name="RedirectURL" value="https://core-backend.rialpayment.ir/v1/payment/callback/saman" />

        </form>
        <script type="text/javascript">
        var f=document.getElementById('saman_gateway');
        f.submit();
        </script>
        `);
        res.end();
        break;
      }
    }
    return data;
  }

  async updateDetails(detailsInfo: ChargeDetailsDto): Promise<any> {
    const data = await this.ipgService.addDetails(detailsInfo);
    return data;
  }

  async updateDetailsParsian(getInfo: IpgParsianDto): Promise<any> {
    return this.ipgService.addDetailsParsian(getInfo);
  }

  async updateDetailsPersian(getInfo): Promise<any> {
    return this.ipgService.addSuccessPersianNew(getInfo);
  }

  async updateDetailsSaman(getInfo): Promise<any> {
    return this.ipgService.addDetailsSaman(getInfo);
  }

  async updateDetailsBehpardakht(getInfo): Promise<any> {
    return this.ipgService.addDetailsBehpardakht(getInfo);
  }

  async updateDetailsPna(getInfo): Promise<any> {
    return this.ipgService.addDetailsPna(getInfo);
  }

  async checkValidation(userid: string) {
    if (isEmpty(userid)) throw new FillFieldsException();
  }

  async successTransform(data) {
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      data: data.ref,
    };
  }

  async pnaService(res): Promise<any> {}

  async todayTotal(userid: string): Promise<any> {
    return this.loggerTodayService.getTodayTransAmount(userid);
  }
}
