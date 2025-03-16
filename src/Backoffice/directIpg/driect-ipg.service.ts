import {
  faildOpt,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  successOpt,
  successOptWithDataNoValidation,
} from '@vision/common';
import { MipgCoreService } from '../../Core/mipg/mipg.service';
import { IpgCoreService } from '../../Core/ipg/ipgcore.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { DuplicateException } from '@vision/common/exceptions/dup.exception';
import { AccountService } from '../../Core/useraccount/account/account.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { DirectIpgWageService } from './services/wage.service';

@Injectable()
export class DirectIpgService {
  constructor(
    private readonly mipgService: MipgCoreService,
    private readonly ipgService: IpgCoreService,
    private readonly wageService: DirectIpgWageService,
    private readonly accountService: AccountService
  ) {}

  async getMipgInfo(terminalid: number, ip: string): Promise<any> {
    // await this.checkip( ip );
    const mipgInfo = await this.mipgService.getInfoDirect(terminalid);
    if (!mipgInfo) return faildOpt();
    return successOptWithDataNoValidation(mipgInfo);
  }

  private async checkip(ip: string): Promise<any> {
    if (ip != '162.223.90.238') throw new UserCustomException('آی پی نامعتبر');
  }

  async submitIpgDetails(
    terminalid,
    invoiceid,
    amount,
    psp,
    karmozd,
    karmozdtype,
    callbackurl,
    user,
    respmsg,
    userinvoice,
    token,
    wagetype
  ): Promise<any> {
    const data = await this.ipgService.newReqDetails(
      terminalid,
      invoiceid,
      amount,
      psp,
      karmozd,
      karmozdtype,
      callbackurl,
      user,
      respmsg,
      userinvoice,
      token,
      wagetype
    );
    if (!data) throw new InternalServerErrorException();
    return successOptWithDataNoValidation(data);
  }

  async getInfoByToken(token: any): Promise<any> {
    if (isEmpty(token)) throw new FillFieldsException();
    const data = await this.ipgService.getTraxInfoByToken(token);
    if (!data) throw new InternalServerErrorException();
    return successOptWithDataNoValidation(data);
  }

  async getTraxInfo(terminalid, invoiceid): Promise<any> {
    const data = await this.ipgService.getTraxInfo(terminalid, invoiceid);
    if (!data) throw new InternalServerErrorException();
    return successOptWithDataNoValidation(data);
  }

  async getTraxInfoByInvoice(invoiceid): Promise<any> {
    const data = await this.ipgService.getTraxInfoByInvoiceid(invoiceid);
    if (!data) throw new InternalServerErrorException();
    return successOptWithDataNoValidation(data);
  }

  async submitCallBackDetails(invoiceid, respcode, respmsg, cardno, rrn, refnum): Promise<any> {
    const data = await this.ipgService.submitCallbackDetails(invoiceid, respcode, respmsg, cardno, rrn, refnum);
    if (!data) throw new InternalServerErrorException();
    return successOptWithDataNoValidation(data);
  }

  async confirm(terminalid, invoiceid): Promise<any> {
    const data = await this.ipgService.globalConfirm(terminalid, invoiceid);
    if (!data) return faildOpt();
    return successOpt();
  }

  async confirmParsian(token, cardnumber, rrn, respcode, msg): Promise<any> {
    if (isEmpty(token) || isEmpty(cardnumber)) throw new FillFieldsException();
    const data = await this.ipgService.confirmParsian(token, cardnumber, rrn, respcode, msg);
    if (!data) return faildOpt();
    return successOpt();
  }

  async reverse(terminalid, invoiceid): Promise<any> {
    const data = await this.ipgService.reverseTrax(terminalid, invoiceid);
    if (!data) return faildOpt();
    return successOpt();
  }

  async confirmWage(getInfo): Promise<any> {
    const traxInfo = await this.ipgService.getTraxInfoByInvoiceid(getInfo.userinvoice);
    if (!traxInfo) throw new NotFoundException();

    const terminalInfo = await this.mipgService.getInfo(getInfo.terminalid);
    if (!terminalInfo) throw new NotFoundException();

    if (traxInfo.confirm == true || traxInfo.reverse == true || traxInfo.trx == false) throw new DuplicateException();

    await this.wageService.calcWage(traxInfo, terminalInfo);

    await this.ipgService.globalConfirm(getInfo.terminalid, getInfo.userinvoice);

    return successOpt();
  }

  async getBalance(terminalid): Promise<any> {
    const mipgInfo = await this.mipgService.getInfoDirect(terminalid);
    if (!mipgInfo) return faildOpt();
    const wallet = await this.accountService.getBalance(mipgInfo.user, 'wallet');
    if (!wallet) faildOpt();

    return successOptWithDataNoValidation(wallet);
  }
}
