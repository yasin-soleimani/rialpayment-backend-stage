import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  successOptWithDataNoValidation,
} from '@vision/common';
import * as excel from 'exceljs';
import * as fs from 'fs';
import { todayDay } from '@vision/common/utils/month-diff.util';
import moment, * as momentjs from 'jalali-moment';
import { UPLOAD_URI_USERS } from '../../../../__dir__';

@Injectable()
export class ExportJsService {
  constructor() {}

  async makeFile(data: any, userid: string): Promise<any> {
    const result = await this.makeResult(data);
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('Purchases');

    worksheet.columns = [
      { header: 'ردیف', key: 'id', width: 10 },
      { header: 'نام شماره فاکتور', key: 'invoiceid', width: 30 },
      { header: 'آدرس', key: 'address', width: 50 },
      { header: 'تلفن', key: 'mobile', width: 15 },
      { header: 'زمان ارسال', key: 'updatedAt', width: 25 },
      { header: 'کالا', key: 'title', width: 25 },
      { header: 'وزن', key: 'qty', width: 10 },
      { header: 'فی', key: 'amount', width: 15 },
      { header: 'توضیحات', key: 'description', width: 30 },
      { header: 'نحوه پرداخت', key: 'payType', width: 15 },
      { header: 'لوکیشن', key: 'location', width: 80 },
    ];

    worksheet.addRows(result);

    const dir = UPLOAD_URI_USERS + userid;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const today = todayDay();
    const filname = 'vitrinShopExport' + new Date().getTime() + today + '.xlsx';
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

  private async makeResult(data): Promise<any> {
    let tmpArray = Array();

    let counter = 1;

    for (const info of data) {
      const deliveryTime =
        info?.deliveryOption?.id === 1
          ? `${momentjs(info?.deliveryDate).locale('fa').format('dddd jYYYY-jMM-jDD')} ${
              info?.deliveryTime?.startTime
            } - ${info?.deliveryTime.endTime}`
          : info?.deliveryOption.description;

      for (const product of info?.basket) {
        tmpArray.push({
          id: counter,
          invoiceid: info?.invoiceid,
          address: `${info?.address?.province}-${info?.address?.city}-${info?.address?.address}`,
          mobile: info?.address?.mobile,
          updatedAt: deliveryTime,
          title: product?.title,
          qty: product?.qty,
          amount: product?.total,
          description: '',
          payType: 'آنلاین - ریال پیمنت',
          location: `http://maps.google.com/maps?daddr=${info?.address?.location?.coordinates[1]},${info?.address?.location?.coordinates[0]}`,
        });
        counter++;
      }
    }

    return tmpArray;
  }
}
