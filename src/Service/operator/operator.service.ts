import { Injectable } from '@vision/common';
import { OPeratorCoreService } from '../../Core/useraccount/operator/operator.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { VoucherCoreService } from '../../Core/voucher/voucher.service';
import { InvalidMiddlewareException } from '@vision/core/errors/exceptions/invalid-middleware.exception';
import { nowTimezone } from '@vision/common/utils/month-diff.util';

@Injectable()
export class OperatorService {
  constructor(
    private readonly operatorService: OPeratorCoreService,
    private readonly voucherService: VoucherCoreService
  ) {}

  async login(getinfo): Promise<any> {
    return this.operatorService.login(getinfo);
  }

  async newVoucher(getInfo, userid): Promise<any> {
    if (isEmpty(getInfo.amount)) throw new FillFieldsException();

    let data;
    if (getInfo.type == 2) {
      if (isEmpty(getInfo.data)) throw new FillFieldsException();
    }
    data = await this.voucherService.generateQrVoucher(
      getInfo.amount,
      getInfo.data,
      getInfo.type,
      userid,
      getInfo.totalamount,
      getInfo.discount,
      getInfo.percent
    );

    return data;
  }

  async getLast(userid: string): Promise<any> {
    return this.voucherService.getLast(userid);
  }

  async getByRef(userid: string, serial: string): Promise<any> {
    return this.voucherService.getByRef(userid, serial);
  }

  async logout(userid): Promise<any> {
    return this.voucherService.logout(userid);
  }

  async report(userid: string, date: number): Promise<any> {
    let cash = 0;
    let card = 0;
    const data = await this.voucherService.report(userid, date);
    for (let i = 0; data.length > i; i++) {
      if (data[i].type == 1) {
        const mm = data[i].totalamount - data[i].discount;
        cash = cash + mm;
      } else if (data[i].type == 2) {
        const mm = data[i].totalamount - data[i].discount;
        card = card + mm;
      }
    }

    return {
      status: 200,
      message: 'عملیات با موفقیت انجام شد',
      success: true,
      cash: cash,
      card: card,
      total: cash + card,
      date: new Date(),
    };
  }

  async calc(userid): Promise<any> {
    let cash = 0;
    let card = 0;
    let discount = 0;
    const data = await this.voucherService.calc(userid);
    for (let i = 0; data.length > i; i++) {
      if (data[i].type == 1) {
        const mm = data.totalamount - data.discount;
        console.log(mm, 'mm');
        cash = cash + mm;
      } else if (data[i].type == 2) {
        const mm = data.totalamount - data.discount;
        console.log(mm, 'mm');
        card = card + mm;
      }
    }

    return {
      cash: cash,
      card: card,
    };
  }
}
