import { Injectable, successOptWithDataNoValidation } from '@vision/common';
import { VoucherQrGenerator } from './services/voucher-qr.service';
import { VoucherCommonService } from './services/voucher-common.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { nowTimezone } from '@vision/common/utils/month-diff.util';
import { VoucherDetailsCoreService } from './services/voucher.details.service';

@Injectable()
export class VoucherCoreService {
  constructor(
    private readonly qrGenerator: VoucherQrGenerator,
    private readonly detailsService: VoucherDetailsCoreService,
    private readonly commonService: VoucherCommonService
  ) {}

  async generateQrVoucher(amount, data, type, userid, total, discount, percent): Promise<any> {
    return this.qrGenerator.makeQrVoucher(amount, data, type, userid, total, discount, percent);
  }

  async calc(userid: string): Promise<any> {
    return this.commonService.calc(userid);
  }

  async report(userid: string, date: number): Promise<any> {
    return this.commonService.report(userid, date);
  }

  async getInfo(id: string): Promise<any> {
    return this.commonService.recoverVoucher(id);
  }

  async getByRef(userid: string, serial: string): Promise<any> {
    return this.qrGenerator.getByRef(userid, serial);
  }

  async getVoucherDetailsByVoucherId(voucherid: string): Promise<any> {
    return this.detailsService.getInfo(voucherid);
  }

  async getLast(userid): Promise<any> {
    return this.qrGenerator.getLast(userid);
  }

  async decrease(id: string, amount: number): Promise<any> {
    return this.commonService.decreaseAmount(id, amount).then((res) => {
      console.log(res, 'decr');
      return res;
    });
  }

  async updateVoucherDetails(vid: string, items): Promise<any> {
    return this.detailsService.updateItems(vid, items);
  }

  async logout(userid): Promise<any> {
    const data = await this.commonService.logout(userid);
    if (isEmpty(data))
      return {
        success: true,
        status: 200,
        message: 'عملیات با موفقیت انجام شد',
        cash: 0,
        card: 0,
        discount: 0,
        total: 0,
        date: new Date(nowTimezone()),
      };
    return {
      success: true,
      status: 200,
      message: 'عملیات با موفقیت انجام شد',
      cash: data[0].cash,
      card: data[0].card,
      discount: data[0].discount,
      total: data[0].cash + data[0].card,
      date: new Date(nowTimezone()),
    };
  }
}
