import { Injectable, successOptWithDataNoValidation, successOptWithPagination } from '@vision/common';
import { BackofficeReportDto } from './dto/report.dto';
import { IpgCoreService } from '../../Core/ipg/ipgcore.service';
import {
  BackofficeReportIpgQueryBuilder,
  BackofficeReportIpgType3QueryBuilder,
  BackofficeReportPosQueryBuiler,
  BackofficeReportQueryBuilder,
  BackofficeReportWebServiceQueryBuiler,
} from './component/query.component';
import { PspverifyCoreService } from '../../Core/psp/pspverify/pspverifyCore.service';
import { LoggercoreService } from '../../Core/logger/loggercore.service';
import { BackofficeDiscountCalc, BackofficeWebServiceNull } from './component/null.component';
import { IpgTRaxReportIterator } from './component/iterator.component';
import { MipgCoreService } from '../../Core/mipg/mipg.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { retunTerminalInfoModel, returnLogModel, returntraxInfoIpgModel } from './component/return.model';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';

@Injectable()
export class BackofficeReportService {
  constructor(
    private readonly ipgService: IpgCoreService,
    private readonly posService: PspverifyCoreService,
    private readonly mipgService: MipgCoreService,
    private readonly loggerService: LoggercoreService
  ) {}

  async getReport(getInfo: BackofficeReportDto): Promise<any> {
    const query = BackofficeReportQueryBuilder(getInfo);
    let ipg = await this.ipgService.getTotalSuccess(query);
    const query2 = BackofficeReportIpgType3QueryBuilder(getInfo);
    const ipg2 = await this.ipgService.getTotalSuccess(query2);
    ipg[0].total =
      ipg.length > 0
        ? ipg2.length > 0
          ? ipg[0].totalz + ipg2[0].totalz
          : ipg[0].totalz
        : ipg2.length > 0
        ? ipg2[0].totalz
        : 0;
    const posQuery = BackofficeReportPosQueryBuiler(getInfo);
    const pos = await this.posService.getTotal(posQuery);
    const webServiceQuery = BackofficeReportWebServiceQueryBuiler(getInfo);
    const webservice = await this.loggerService.getTotal(webServiceQuery);
    const data = {
      ipg: BackofficeDiscountCalc(ipg[0]),
      pos: BackofficeDiscountCalc(pos[0]),
      websevice: webservice[0] || BackofficeWebServiceNull(),
    };
    return successOptWithDataNoValidation(data);
  }

  async getIpgReport(to, from, terminalid, page, cardno): Promise<any> {
    let query = BackofficeReportIpgQueryBuilder(from, to, terminalid);
    if (cardno) {
      const card = this.maskCard(cardno);
      query = Object.assign(query, { 'details.cardnumber': card });
    }
    const data = await this.ipgService.getAllReportWithQuery(query, page);
    data.docs = IpgTRaxReportIterator(data.docs);
    return successOptWithPagination(data);
  }

  async getTerminalInfo(terminalid): Promise<any> {
    if (isEmpty(terminalid)) throw new FillFieldsException();
    const terminalInfo = await this.mipgService.getInfo(terminalid);
    if (!terminalInfo) throw new UserCustomException('یافت نشد', false, 404);
    return successOptWithDataNoValidation(retunTerminalInfoModel(terminalInfo));
  }

  async getTraxInfo(terminalid: number, userinvoice: string): Promise<any> {
    if (isEmpty(terminalid) || isEmpty(userinvoice)) throw new FillFieldsException();
    const traxInfo = await this.ipgService.getTraxInfoBO(terminalid, userinvoice);
    if (!traxInfo) throw new UserCustomException('یافت نشد', false, 404);
    let uinvoice;
    if (!traxInfo.userinvoice) {
      uinvoice = traxInfo.invoiceid;
    } else {
      uinvoice = traxInfo.userinvoice;
    }
    let regex = /IccIpg-/;
    let Log;
    if (regex.test(uinvoice)) {
      const pspInfo = await this.posService.getTraxInfoByTraxIdWithLog(traxInfo.orderid);
      if (!pspInfo) throw new UserCustomException('تراکنش یافت نشد');
      Log.push(pspInfo.log);
    } else {
      Log = await this.loggerService.getInfoByRef(uinvoice);
    }
    return successOptWithDataNoValidation(returntraxInfoIpgModel(traxInfo, returnLogModel(Log)));
  }

  private maskCard(cardNo) {
    var cardnumber = cardNo;
    var first4 = cardnumber.substring(0, 6);
    var last5 = cardnumber.substring(cardnumber.length - 4);

    const mask = cardnumber.substring(4, cardnumber.length - 6).replace(/\d/g, '*');
    return first4 + mask + last5;
  }
}
