import { Injectable, InternalServerErrorException, successOptWithDataNoValidation } from '@vision/common';
import { MipgCoreService } from '../../../Core/mipg/mipg.service';
import { IpgCoreService } from '../../../Core/ipg/ipgcore.service';
import { GetMipgChargeDto } from '../dto/mipg-api.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { ChargeParsianFunction } from '../function/parsian.func';
import { ChargePersianFunction } from '../function/persian.func';
import { ChargeSamanFunction } from '../function/saman.func';
import { ChargeFaildFunction } from '../function/failed.func';
import { ChargeCallbackFunction } from '../function/callback.func';
import { LoggercoreService } from '../../../Core/logger/loggercore.service';
import { ChargeBehpardakhtFunction } from '../function/behpardakht.func';
import { ChargePnaFunction } from '../function/pna.func';

@Injectable()
export class ChargeIpgApiService {
  constructor(
    private readonly mipgService: MipgCoreService,
    private readonly ipgService: IpgCoreService,
    private readonly loggerService: LoggercoreService
  ) {}

  async newReq(getInfo: GetMipgChargeDto, userid: string, referer: string): Promise<any> {
    if (Number(getInfo.amount) <= 10000) throw new UserCustomException('مبلغ باید بیشتر از 10000 ریال باشد');

    const inv = 'Charge-' + new Date().getTime();
    const ipguser = await this.mipgService.getInfo(process.env.PORTAL_CHARGE_USER);

    const payload = {
      cardno: getInfo.cardno,
      referer,
    };

    getInfo.user = userid;
    getInfo.userinvoice = inv;
    getInfo.invoiceid = inv;
    getInfo.paytype = ipguser.type;
    getInfo.karmozd = 0;
    getInfo.payload = JSON.stringify(payload);
    getInfo.devicetype = getInfo.devicetype;
    getInfo.terminalid = ipguser.terminalid;
    getInfo.isdirect = ipguser.isdirect;
    const title = 'شارژ کیف پول از درگاه اینترنتی ';
    const log = this.setLogg(title, getInfo.invoiceid, getInfo.amount, false, null, getInfo.user);
    await this.loggerService.newLogg(log);

    const datax = await this.ipgService.newReq(getInfo, 'we have');
    if (!datax) throw new InternalServerErrorException();

    const callback = ChargeCallbackFunction(datax.type);
    await this.ipgService.updateCallback(datax._id, callback);
    return successOptWithDataNoValidation(datax.ref);
  }

  async redirect(ref: string, res: any): Promise<any> {
    const ipgInfo = await this.ipgService.findByRef(ref);
    if (!ipgInfo) throw new UserCustomException('تراکنش یافت نشد', false, 404);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    let x;

    if (ipgInfo.launch == true) {
      x = ChargeFaildFunction();
      res.write(x);
      res.end();
    }

    await this.ipgService.launchTrue(ref);

    switch (ipgInfo.type) {
      case 1: {
        x = ChargeParsianFunction(ipgInfo.token);
        break;
      }

      case 2: {
        x = ChargePersianFunction(ipgInfo.token);
        break;
      }

      case 3: {
        x = ChargeSamanFunction(ipgInfo);
        break;
      }

      case 4: {
        x = ChargePnaFunction(ipgInfo);
        break;
      }

      case 5: {
        x = ChargeBehpardakhtFunction(ipgInfo);
        break;
      }

      default:
        x = ChargeBehpardakhtFunction(ipgInfo);
        break;
    }

    res.write(x);
    res.end();
  }

  private setLogg(titlex, refx, amountx, statusx, fromid, toid) {
    return {
      title: titlex,
      ref: refx,
      amount: amountx,
      status: statusx,
      from: fromid,
      to: toid,
    };
  }
}
