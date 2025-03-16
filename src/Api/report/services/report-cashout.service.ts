import {
  Injectable,
  InternalServerErrorException,
  successOptWithDataNoValidation,
  successOptWithPagination,
} from '@vision/common';
import { CheckoutSubmitCommonService } from '../../../Core/checkout/submit/services/submit-common.service';
import { ReportApiDto } from '../dto/report.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { hourDiff, todayDay } from '@vision/common/utils/month-diff.util';
import * as excel from 'exceljs';
import * as fs from 'fs';
import { UPLOAD_URI_USERS } from '../../../__dir__';

@Injectable()
export class ReportCashoutService {
  constructor(private readonly checkoutService: CheckoutSubmitCommonService) {}

  async GetReport(getInfo: ReportApiDto, userid: string, page: number): Promise<any> {
    const query = await this.makeQuery(getInfo, userid);

    const data = await this.checkoutService.getReport(query, page);

    data.docs = this.makeList(data.docs);
    return successOptWithPagination(data);
  }

  private async makeQuery(getInfo: ReportApiDto, userid: string): Promise<any> {
    let tmpQuery = Array();
    let amount;
    let date;
    if (getInfo.amountfrom > 0 || getInfo.amountto > 0) {
      if (getInfo.amountto < getInfo.amountfrom) throw new UserCustomException('لطفا مقدار وارد شده مبلغ را چک کنید');
      amount = {
        $or: [
          {
            amount: {
              $gte: getInfo.amountfrom,
              $lte: getInfo.amountto,
            },
          },
        ],
      };
    }
    if (!isEmpty(getInfo.datefrom) || !isEmpty(getInfo.dateto)) {
      if (getInfo.dateto < getInfo.datefrom) throw new UserCustomException('رنج تاریخ نامعتبر');
      const dateto = new Date(getInfo.dateto * 1000);
      const datefrom = new Date(getInfo.datefrom * 1000);

      date = {
        createdAt: {
          $gte: datefrom,
          $lte: dateto,
        },
      };
    }

    if (amount) tmpQuery.push(amount);
    if (date) tmpQuery.push(date);

    tmpQuery.push({
      user: userid,
    });

    return {
      $and: tmpQuery,
    };
  }

  private makeList(data) {
    let tmpArray = Array();

    for (const info of data) {
      const statusInfo = this.checkStatus(info.data, info.createdAt);

      let bankStatus;
      if (info.checkout) {
        bankStatus = info.checkout;
      } else {
        bankStatus = {
          bankname: info.bankname || '',
          account: info.account || '',
        };
      }
      tmpArray.push({
        bankname: bankStatus.bankname || '',
        account: bankStatus.account || '',
        createdAt: info.createdAt,
        amount: info.amount,
        status: statusInfo.status,
        message: statusInfo.message,
      });
    }

    return tmpArray;
  }

  private checkStatus(data, createdAt) {
    if (!data) {
      const hDiff = hourDiff(createdAt);
      if (hDiff <= 2) {
        return {
          status: true,
          message: 'در انتظار پاسخ بانک',
        };
      } else {
        return {
          status: false,
          message: 'عملیات با خطا مواجه شده است',
        };
      }
    }

    const info = JSON.parse(data);
    if (info.status == 200) {
      return {
        status: true,
        message: 'عملیات با موفقیت انجام شد',
      };
    } else {
      return {
        status: false,
        message: 'عملیات با خطا مواجه شده است',
      };
    }
  }

  async getExcelReport(getInfo: ReportApiDto, userid: string): Promise<any> {
    const query = await this.makeQuery(getInfo, userid);

    const data = await this.checkoutService.getExport(query);
    if (isEmpty(data)) throw new UserCustomException('اطلاعاتی یافت نشد');

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('Cashouts');

    const result = this.makeExcelResult(data);

    worksheet.columns = [
      { header: 'ردیف', key: 'id', width: 10 },
      { header: 'نام بانک', key: 'bankname', width: 10 },
      { header: 'شماره حساب', key: 'account', width: 30 },
      { header: 'مبلغ', key: 'amount', width: 10 },
      { header: 'وضعیت', key: 'status', width: 10 },
      { header: 'پیام', key: 'message', width: 25 },
    ];
    console.log(result);
    worksheet.addRows(result);
    const dir = UPLOAD_URI_USERS + userid;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const today = todayDay();
    const filname = 'cashout' + new Date().getTime() + today + '.xlsx';
    const worked = await workbook.xlsx
      .writeFile(dir + '/' + filname)
      .then(function () {
        console.log('file saved!');
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });

    const downloadLink = process.env.SITE_URL_EXCEL + userid + '/' + filname;
    return successOptWithDataNoValidation(downloadLink);
  }

  private makeExcelResult(data) {
    let tmpArray = Array();
    let counter = 1;

    for (const info of data) {
      const statusInfo = this.checkStatus(info.data, info.createdAt);
      let status;
      if (statusInfo.status == true) {
        status = 'موفق';
      } else {
        status = 'ناموفق';
      }
      let bankStatus;
      if (info.checkout) {
        bankStatus = info.checkout;
      } else {
        bankStatus = {
          bankname: info.bankname || '',
          account: info.account || '',
        };
      }

      console.log(bankStatus, 'bs');
      tmpArray.push({
        id: counter,
        bankname: bankStatus.bankname || '',
        account: bankStatus.account || '',
        amount: info.amount,
        status: statusInfo.status,
        message: statusInfo.message,
      });

      counter++;
    }

    return tmpArray;
  }
}
