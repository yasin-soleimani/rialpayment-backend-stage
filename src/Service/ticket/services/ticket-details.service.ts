import { Injectable, InternalServerErrorException, successOpt, successOptWithDataNoValidation } from '@vision/common';
import { VoucherDetailsCoreService } from '../../../Core/voucher/services/voucher.details.service';
import { VoucherListCoreService } from '../../../Core/voucher/services/voucher-list.service';
import { VoucherTicketSubmitServiceDto } from '../dto/submit.dto';
import { discountPercent } from '@vision/common/utils/load-package.util';
import { VoucherCommonService } from '../../../Core/voucher/services/voucher-common.service';
import { CardcounterService } from '../../../Core/useraccount/cardcounter/cardcounter.service';
import { IpgCoreService } from '../../../Core/ipg/ipgcore.service';
import { TicketPaymentService } from './ticket-payment.service';

@Injectable()
export class TicketDetailsService {
  constructor(
    private readonly detailsService: VoucherDetailsCoreService,
    private readonly listService: VoucherListCoreService,
    private readonly voucherCommonService: VoucherCommonService,
    private readonly counterService: CardcounterService,
    private readonly paymentService: TicketPaymentService
  ) {}

  async submit(getInfo: VoucherTicketSubmitServiceDto): Promise<any> {
    const items = await this.check(getInfo);
    console.log(items, 'items');
    if (items.totalAmount < 1) throw new InternalServerErrorException();

    const halfkey = 'MyVouCheR0';
    const logInfo = 'Voucher-' + new Date().getTime();
    const serialNumber = await this.counterService.getTSerialNumber();

    const pay = await this.paymentService.getPayment(items.totalAmount, logInfo);

    const voucherInfo = await this.voucherCommonService.genNewVoucher(
      items.totalAmount,
      null,
      halfkey,
      'AA:A0:30:70:00:48',
      '',
      pay,
      3,
      items.totalAmount,
      0,
      0,
      '',
      serialNumber,
      getInfo.mobile
    );

    this.detailsService.add({
      voucher: voucherInfo._id,
      item: items.items,
      total: items.totalAmount,
      qty: items.qty,
    });

    return successOptWithDataNoValidation(pay);
  }

  private async check(getInfo: VoucherTicketSubmitServiceDto): Promise<any> {
    let tmp = Array();
    let totalAmount = 0;
    let qty = 0;
    for (const info of getInfo.item) {
      const item = await this.listService.getInfo(info.id);
      if (item) {
        const total = info.qty * item.amount;

        const discount = discountPercent(total, item.discount);

        tmp.push({
          product: item._id,
          qty: info.qty,
          amount: item.amount,
          discount: item.discount,
          totalall: discount.total,
          total: discount.amount,
        });

        totalAmount = totalAmount + discount.amount;
        qty++;
      }
    }

    return {
      totalAmount,
      items: tmp,
      qty,
    };
  }
}
