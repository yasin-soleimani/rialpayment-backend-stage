import { Injectable, NotFoundException } from '@vision/common';
import { VoucherCommonService } from './voucher-common.service';
import axios, { AxiosInstance } from 'axios';
import * as qs from 'querystring';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { AccountService } from '../../useraccount/account/account.service';
import { CardcounterService } from '../../useraccount/cardcounter/cardcounter.service';

@Injectable()
export class VoucherQrGenerator {
  private Client: AxiosInstance;

  constructor(
    private readonly commonService: VoucherCommonService,
    private readonly accountService: AccountService,
    private readonly counterService: CardcounterService
  ) {
    this.Client = axios.create({
      baseURL: 'http://localhost:8001/',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  async getByRef(userid: string, serial: string): Promise<any> {
    const halfkey = 'MyVouCheR0';

    const info = await this.commonService.getByRef(userid, serial);

    if (!info) throw new NotFoundException();

    const qr = {
      ty: 102,
      to: info._id,
    };

    const query = qs.stringify({
      key: halfkey,
      text: JSON.stringify(qr),
    });

    const res = await this.Client.post('/api/v1/enc', query);
    if (res.status != 200) throw new UserCustomException('متاسفانه عملیات با خطا با مواجه شده است', false, 500);

    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      data: '09363677791' + res.data.message,
      type: 'بلیط باغ وحش',
      serial: info.serial,
      date: info.createdAt,
      amount: info.amount,
      discount: info.amount,
      ref: info.ref,
      motto: 'من دوست دار طبیعتم \n خلق نشاط و شادی در دنیای ارم',
    };
  }

  async getLast(userid: string): Promise<any> {
    const halfkey = 'MyVouCheR0';

    const info = await this.commonService.getLast(userid);

    const qr = {
      ty: 102,
      to: info._id,
    };

    const query = qs.stringify({
      key: halfkey,
      text: JSON.stringify(qr),
    });

    const res = await this.Client.post('/api/v1/enc', query);
    if (res.status != 200) throw new UserCustomException('متاسفانه عملیات با خطا با مواجه شده است', false, 500);

    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      data: '09363677791' + res.data.message,
      type: 'بلیط باغ وحش',
      serial: info.serial,
      date: info.createdAt,
      amount: info.amount,
      discount: info.amount,
      ref: info.ref,
      motto: 'من دوست دار طبیعتم \n خلق نشاط و شادی در دنیای ارم',
    };
  }

  async makeQrVoucher(amount, data, type, userid, total, discount, percent, mobile?): Promise<any> {
    const halfkey = 'MyVouCheR0';
    const logInfo = 'Voucher-' + new Date().getTime();
    const serialNumber = await this.counterService.getTSerialNumber();
    // amount, by, hek, hmac, expire,data, type, total, discount, percent, ref, serial, mobile?
    const info = await this.commonService.genNewVoucher(
      amount,
      userid,
      halfkey,
      'AA:A0:30:70:00:48',
      5465465465,
      data,
      type,
      total,
      discount,
      percent,
      logInfo,
      this.serialize(serialNumber.tserial),
      mobile
    );

    const qr = {
      ty: 102,
      to: info._id,
    };

    const query = qs.stringify({
      key: halfkey,
      text: JSON.stringify(qr),
    });

    const res = await this.Client.post('/api/v1/enc', query);
    if (res.status != 200) throw new UserCustomException('متاسفانه عملیات با خطا با مواجه شده است', false, 500);

    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      data: '09363677791' + res.data.message,
      type: 'بلیط',
      serial: this.serialize(serialNumber.tserial),
      date: info.createdAt,
      amount: info.amount,
      ref: logInfo,
      motto: 'من دوست دار طبیعتم \n خلق نشاط و شادی در دنیای ارم',
    };
  }

  async JustMakeQr(data: string): Promise<any> {
    const halfkey = 'MyVouCheR0';
    const logInfo = 'Voucher-' + new Date().getTime();
    const serialNumber = await this.counterService.getTSerialNumber();

    const info = await this.commonService.getInfoByData(data);
    this.commonService.addQuery(info._id, {
      ref: logInfo,
      serial: serialNumber,
    });
    const qr = {
      ty: 102,
      to: info._id,
    };

    const query = qs.stringify({
      key: halfkey,
      text: JSON.stringify(qr),
    });

    const res = await this.Client.post('/api/v1/enc', query);
    if (res.status != 200) throw new UserCustomException('متاسفانه عملیات با خطا با مواجه شده است', false, 500);

    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      data: '09363677791' + res.data.message,
      type: 'بلیط',
      serial: this.serialize(serialNumber.tserial),
      date: info.createdAt,
      amount: info.amount,
      ref: logInfo,
      motto: 'من دوست دار طبیعتم \n خلق نشاط و شادی در دنیای ارم',
    };
  }

  private serialize(no: number) {
    const nolen = 3 - no.toString().length;
    if (nolen == 2) {
      return '00' + no;
    } else if (nolen == 1) {
      return '0' + no;
    }
    return no;
  }

  async getInfoById(id): Promise<any> {
    return this.commonService.getInfoById(id);
  }

  async getInfoByVoucherId(id): Promise<any> {
    return this.commonService.getInfoById(id);
  }

  async getInfoByData(data): Promise<any> {
    return this.commonService.getInfoByData(data);
  }
}
