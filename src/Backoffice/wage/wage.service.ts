import { Injectable, successOptWithPagination, successOpt } from '@vision/common';
import { WageCoreService } from '../../Core/wage/wage.service';
import { IpgReportService } from '../../Core/ipg/services/report.class';
import {
  setWageSystemWageModel,
  setWageSystemTerminalModel,
  setWageSystemModel,
} from '../../Core/wage/function/wage-system-model.func';
import { discountPercent, discountChangable } from '@vision/common/utils/load-package.util';
import { MipgCoreService } from '../../Core/mipg/mipg.service';
import { WageTyepConst } from '../../Core/wage/const/terminal-type.const';
import { LoggercoreService } from '../../Core/logger/loggercore.service';
import { BackofficeWageQueryBuilder } from './func/query-builder.func';
import { PspverifyCoreService } from '../../Core/psp/pspverify/pspverifyCore.service';

@Injectable()
export class BackOfficeWageService {
  constructor(
    private readonly wageService: WageCoreService,
    private readonly ipgReportService: IpgReportService,
    private readonly loggerService: LoggercoreService,
    private readonly mipg: MipgCoreService,
    private readonly pspVerifyService: PspverifyCoreService
  ) {}

  async getAllIPg(): Promise<any> {
    // const lastx = await this.wageService.getLast(  WageTyepConst.IPG );

    for (let i = 0; i < 5000; i++) {
      // console.log( i );
      const xdata = await this.ipgReportService.getAll(1000, i);
      // const last =     await  this.wageService.getLast(  WageTyepConst.IPG );
      // const xdata = await this.ipgReportService.getTime(last);
      for (const data of xdata) {
        const ipgInfo = await this.mipg.getInfo(data.terminalid);
        if (ipgInfo) {
          let ref = null;
          if (ipgInfo.ref) {
            ref = ipgInfo.ref._id;
          }
          const wagecalc = discountPercent(data.discount, 40);
          const wage = setWageSystemWageModel(
            data.discount,
            wagecalc.amount,
            wagecalc.discount,
            0,
            data.paytype,
            data.karmozd
          );
          const terminal = setWageSystemTerminalModel(data.terminalid, data.terminalid, WageTyepConst.IPG);
          const all = setWageSystemModel(
            data.total,
            WageTyepConst.IPG,
            wage,
            terminal,
            ref,
            data.user,
            data.user,
            data.createdAt,
            data.updatedAt
          );
          await this.wageService.addWage(all);
        }
      }
    }
  }

  async getLastIpg(): Promise<any> {
    const last = await this.wageService.getLast(WageTyepConst.IPG);
    return this.ipgReportService.getTime(last.createdAt);
  }

  async getFilter(getInfo, page: number): Promise<any> {
    const query = BackofficeWageQueryBuilder(getInfo);
    const data = await this.wageService.getFilter(query);
    const list = await this.wageService.getSearch(query, page);

    return successOptWithPagination(list, undefined, data[0]);
  }

  async getLoggs(): Promise<any> {
    const xdata = await this.loggerService.pureQuery({
      ref: /WebserviceWage-/,
    });

    for (const data of xdata) {
      // const amount = discountChangable(  data.amount, 40 );
      const wage = setWageSystemWageModel(data.amount, data.amount, 0, null, 2, 40);
      const terminal = setWageSystemTerminalModel(null, null, WageTyepConst.Voucher);
      const all = setWageSystemModel(
        data.amount,
        WageTyepConst.CardCharge,
        wage,
        terminal,
        null,
        null,
        data.from,
        data.createdAt,
        data.updatedAt
      );
      await this.wageService.addWage(all);
    }
  }

  async getCashout(): Promise<any> {
    const xdata = await this.loggerService.pureQuery({
      ref: /Club-/,
    });

    for (const data of xdata) {
      const total = (data.amount * 100) / 40;
      const agent = data.amount;
      const company = total - agent;

      const wage = setWageSystemWageModel(data.amount, data.amount, 0, 0, 2, data.amount);
      const terminal = setWageSystemTerminalModel(null, null, WageTyepConst.WebService);
      const all = setWageSystemModel(
        data.amount,
        WageTyepConst.Voucher,
        wage,
        terminal,
        null,
        null,
        data.from,
        data.createdAt,
        data.updatedAt
      );
      await this.wageService.addWage(all);
    }
  }

  async getClub(): Promise<any> {
    const xdata = await this.loggerService.pureQuery({
      ref: /Club-/,
    });

    for (const data of xdata) {
      const total = (data.amount * 100) / 60;
      const company = data.amount;
      const agent = total - company;

      const wage = setWageSystemWageModel(total, company, agent, 0, 1, 40);
      const terminal = setWageSystemTerminalModel(null, null, WageTyepConst.Club);
      const all = setWageSystemModel(
        total,
        WageTyepConst.Club,
        wage,
        terminal,
        data.from,
        null,
        data.from,
        data.createdAt,
        data.updatedAt
      );
      await this.wageService.addWage(all);
    }
  }

  async getRemove(): Promise<any> {
    const all = await this.wageService.getAll({ type: WageTyepConst.WebService });

    for (const info of all) {
      this.wageService.remove(info._id);
    }

    return successOpt();
  }

  async getPsp(): Promise<any> {
    const query = { confirm: true, discount: { $exists: true } };

    const xdata = await this.pspVerifyService.getAllByQuery(query);

    for (const data of xdata) {
      if (data.discount) {
        const parsed = JSON.parse(data.reqin);

        const wage = setWageSystemWageModel(
          data.discount.discount,
          data.discount.companywage,
          data.discount.cardref,
          data.discount.merchantref,
          1,
          50
        );
        const terminal = setWageSystemTerminalModel(parsed.Merchant, parsed.TermID, WageTyepConst.POS);
        const all = setWageSystemModel(
          data.discount.discount + data.discount.amount,
          WageTyepConst.POS,
          wage,
          terminal,
          data.cardref,
          data.user,
          data.merchantref,
          data.createdAt,
          data.updatedAt
        );
        await this.wageService.addWage(all);
      }
    }
  }
}
