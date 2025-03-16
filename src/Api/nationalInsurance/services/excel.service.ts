import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  successOptWithDataNoValidation,
} from '@vision/common';
import { NationalInsuranceCoreService } from '../../../Core/insurance/insurance.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import * as excel from 'exceljs';
import { todayDay } from '@vision/common/utils/month-diff.util';
import * as fs from 'fs';
import { timeDateJalali } from '../../../Api/report/functions/date-time.function';
import { UPLOAD_URI_USERS } from '../../../__dir__';

@Injectable()
export class NationalInsuranceMakeExcelApiService {
  constructor(private readonly inusranceService: NationalInsuranceCoreService) {}

  async single(id: string): Promise<any> {
    const info = await this.inusranceService.getInsuranceInfoById(id);
    if (!info) throw new UserCustomException('یافت نشد', false, 404);

    const result = await this.makeResult(info);
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('Customers');

    worksheet.columns = [
      { header: 'row', key: 'row', width: 10 },
      { header: 'firstname', key: 'firstname', width: 40 },
      { header: 'lastname', key: 'lastname', width: 40 },
      { header: 'fathername', key: 'fathername', width: 40 },
      { header: 'familycode', key: 'familycode', width: 15 },
      { header: 'amayesh', key: 'amayesh', width: 30 },
      { header: 'birthdate', key: 'birthdate', width: 30 },
      { header: 'relation', key: 'relation', width: 30 },
      { header: 'insuranccode', key: 'insuranccode', width: 30 },
      { header: 'nationality', key: 'nationality', width: 30 },
      { header: 'mobile', key: 'mobile', width: 30 },
      { header: 'sheba', key: 'sheba', width: 60 },
    ];
    worksheet.addRows(result);

    const dir = UPLOAD_URI_USERS;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const today = todayDay();
    const filname = 'Insurance' + new Date().getTime() + today + '.xlsx';
    const worked = await workbook.xlsx
      .writeFile(dir + '/' + filname)
      .then(function () {
        console.log('file saved!');
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });

    const downloadLink = process.env.SITE_URL_EXCEL + '/' + filname;
    return successOptWithDataNoValidation(downloadLink);
  }

  async makeResult(data): Promise<any> {
    let tmpArray = Array();
    let counter = 1;
    tmpArray.push({
      row: counter,
      firstname: data.user.firstname,
      lastname: data.user.lastname,
      fathername: data.user.father,
      familycode: data.user.familycode,
      amayesh: data.user.amayesh,
      birthdate: timeDateJalali(data.user.birthdate).date,
      relation: 'اصلی',
      insuranccode: '',
      nationality: 'افغانستان',
      sheba: data.user.sheba,
      mobile: data.user.mobile,
    });

    for (const info of data.persons) {
      counter++;
      tmpArray.push({
        row: counter,
        firstname: info.firstname,
        lastname: info.lastname,
        fathername: info.fathername,
        familycode: info.familycode,
        amayesh: info.amayesh,
        birthdate: timeDateJalali(info.birthdate).date,
        relation: 'اصلی',
        insuranccode: '',
        nationality: 'افغانستان',
        sheba: data.user.sheba,
        mobile: info.mobile,
      });
    }

    return tmpArray;
  }
}
