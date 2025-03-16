import { Injectable, InternalServerErrorException, successOptWithDataNoValidation } from '@vision/common';
import * as excel from 'exceljs';
import * as fs from 'fs';
import { todayDay } from '@vision/common/utils/month-diff.util';
import * as jalalimoment from 'jalali-moment';
import { UPLOAD_URI_USERS } from '../../../__dir__';

@Injectable()
export class ReportTicketHistoryExcel {
  async makeExcel(data, userid: string, user, terminalName: string): Promise<any> {
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('گزارش شارژ ');
    if (user.type === "customerclub") {
      worksheet.columns = [
        { header: 'ردیف', key: 'row', width: 10 },
        { header: 'شماره کارت', key: 'cardnumber', width: 60 },
        { header: 'نام', key: 'user', width: 60 },
        { header: 'تاریخ', key: 'date', width: 30 },
        { header: 'کد ملی', key: 'nationalcode', width: 30 },
      ];
    } else {
      worksheet.columns = [
        { header: 'ردیف', key: 'row', width: 10 },
        { header: 'شماره کارت', key: 'cardnumber', width: 60 },
        { header: 'نام', key: 'user', width: 60 },
        { header: 'تاریخ', key: 'date', width: 30 },
      ];
    }

    console.log(data, 'result data');
    console.log("user:::", user)

    const result = this.makeResult(data, user);
    console.log(result, 'result excel');
    worksheet.addRows(result);

    const dir = UPLOAD_URI_USERS + userid;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const today = todayDay();
    // const name = terminalName ? terminalName : 'tickets-used';
    // const filname = name + new Date().getTime() + today + '.xlsx';
    const filname = (terminalName ?? 'tickets-used') + new Date().getTime() + today + '.xlsx';
    // const filname = 'tickets-used' + new Date().getTime() + today + '.xlsx';
    // console.log("excel name yasin!:::", name);

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

  private makeResult(data, user) {
    let tmpArray = Array();

    let counter = 1;
    if (user.type === "customerclub") {
      for (const item of data) {
        tmpArray.push({
          row: counter,
          cardnumber: item.cardnumber,
          user: item?.user?.fullname ?? '',
          date: jalalimoment(item.createdAt).locale('fa').format('YY/MM/DD - HH:mm'),
          nationalcode: item?.user?.nationalcode ?? ''
        });

        counter++;
      }
    } else {
      for (const item of data) {
        tmpArray.push({
          row: counter,
          cardnumber: item.cardnumber,
          user: item?.user?.fullname ?? '',
          date: jalalimoment(item.createdAt).locale('fa').format('YY/MM/DD - HH:mm')
        });

        counter++;
      }
    }


    return tmpArray;
  }
}
