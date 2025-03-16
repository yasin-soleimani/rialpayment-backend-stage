import { Injectable, successOptWithPagination } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { MerchantcoreService } from '../../merchant/merchantcore.service';
import { TransactionReportCoreService } from '../../transaction-report/transaction-report.service';
import { GroupReportCommonCoreService } from './common.service';
import { GroupReportPspCoreService } from './psp.service';
import { TicketsCoreService } from '../../tickets/tickets.service';
import * as moment from 'jalali-moment';
import * as mongoose from 'mongoose';
import { MerchantShareService } from '../../merchant/services/merchant-share.service';

@Injectable()
export class GroupReportCoreService {
  constructor(
    private readonly commonService: GroupReportCommonCoreService,
    private readonly pspService: GroupReportPspCoreService,
    private readonly merchantService: MerchantcoreService,
    private readonly reportService: TransactionReportCoreService,
    private readonly ticketsCoreService: TicketsCoreService,
    private readonly merchantShareService: MerchantShareService
  ) {}

  async getAll(merchantId: string, groupId: string, userId: string, from, to, page: number, type: 1 | 2): Promise<any> {
    const shares = await this.merchantShareService.getSharesByToId(userId);
    const array = [mongoose.Types.ObjectId(userId)];
    for (const share of shares) array.push(mongoose.Types.ObjectId(share.sharedMerchant as string));
    const merchantInfo = await this.merchantService.getMerchantInfoById(merchantId, array, true);
    if (!merchantInfo) throw new UserCustomException('پذیرنده یافت نشد', false, 404);

    const info = await this.commonService.getGroupUsers(groupId);

    const fromDate = new Date(Number(from));
    console.log(fromDate.toISOString(), from);
    const toDate = new Date(Number(to));
    console.log(toDate);
    if (type == 1) {
      let terminals = await this.commonService.terminals(merchantId, userId);
      if (!terminals || !info)
        return successOptWithPagination(
          {
            docs: [],
            total: 0,
            limit: 50,
            page: 1,
          },
          undefined,
          []
        );
      /*const summary = await this.reportService.getTotal(fromDate, toDate, info[0].cardsNo, terminals, [
        merchantInfo.merchantcode,
      ]);*/
      const summary = await this.pspService.getTotal(
        info[0].cardsNo,
        info[0].users,
        terminals,
        [merchantInfo.merchantcode],
        fromDate,
        toDate
      );

      /*const list = await this.reportService.getPaginate(
        fromDate,
        toDate,
        info[0].cardsNo,
        terminals,
        [merchantInfo.merchantcode],
        page
      );*/
      const list = await this.pspService.getAllDirectPaginate(
        merchantInfo.title,
        info[0].cardsNo,
        [],
        terminals,
        [merchantInfo.merchantcode],
        fromDate,
        toDate,
        page
      );
      // const list = await this.pspService.getTotalPaginate(
      //   info[0].cardsNo,
      //   info[0].users,
      //   terminals,
      //   [merchantInfo.merchantcode],
      //   fromDate,
      //   toDate,
      //   page
      // );
      return successOptWithPagination(list, undefined, summary);
    } else {
      const terminals = await this.commonService.terminalIds(merchantId, userId);
      if (!terminals || !info)
        return successOptWithPagination(
          {
            docs: [],
            total: 0,
            limit: 50,
            page: 1,
          },
          undefined,
          []
        );
      const list = await this.ticketsCoreService.getTicketsHistories(
        fromDate,
        toDate,
        info[0].cardsNo,
        terminals,
        page
      );
      console.log('list:::: ', list);
      const summary = await this.ticketsCoreService.getTicketsHistorySummary(
        fromDate,
        toDate,
        info[0].cardsNo,
        terminals
      );
      console.log('summary::: ', summary);
      return successOptWithPagination(list, undefined, summary);
    }
  }

  async getAllTransactions(merchantId: string, groupId: string, userId: string, from, to, type: 1 | 2): Promise<any> {
    const shares = await this.merchantShareService.getSharesByToId(userId);
    const array = [mongoose.Types.ObjectId(userId)];
    for (const share of shares) array.push(mongoose.Types.ObjectId(share.sharedMerchant as string));
    const merchantInfo = await this.merchantService.getMerchantInfoById(merchantId, array, true);
    if (!merchantInfo) throw new UserCustomException('پذیرنده یافت نشد', false, 404);

    const info = await this.commonService.getGroupUsers(groupId);

    const fromDate = new Date(Number(from));
    console.log(fromDate.toISOString(), from);
    const toDate = new Date(Number(to));
    console.log(toDate);

    if (type == 1) {
      const terminals = await this.commonService.terminals(merchantId, userId);
      return this.pspService.getAll(
        info[0].cardsNo,
        info[0].users,
        terminals,
        [merchantInfo.merchantcode],
        fromDate,
        toDate
      );
    } else {
      const terminals = await this.commonService.terminalIds(merchantId, userId);
      const datax = await this.ticketsCoreService.getTicketsHistoriesForXls(
        fromDate,
        toDate,
        info[0].cardsNo,
        terminals
      );
      console.log(datax);
      const newData = [];
      for (const i of datax) {
        newData.push({
          cardnumber: i.cardnumber,
          terminalid: i.terminal.terminalid,
          used: 1,
          createdAt: moment(i.createdAt).locale('fa').format('YYYY/MM/DD-HH:mm:ss'),
        });
      }
      return newData;
    }
  }
}
