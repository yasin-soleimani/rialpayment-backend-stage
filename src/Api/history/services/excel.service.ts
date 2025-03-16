import { Injectable, successOptWithDataNoValidation, InternalServerErrorException } from '@vision/common';
import { LoggercoreService } from '../../../Core/logger/loggercore.service';
import * as excel from 'exceljs';
import * as fs from 'fs';
import { todayDay } from '@vision/common/utils/month-diff.util';
import { LoggerCoreQueryBuilderService } from '../../../Core/logger/services/filter-query.service';
import { HistoryFilterDto } from '../dto/filter.dto';
import { UPLOAD_URI_USERS } from '../../../__dir__';

@Injectable()
export class HistoryExcelService {
  constructor(private readonly filterService: LoggerCoreQueryBuilderService) {}

  async makeExcel(getInfo: HistoryFilterDto, userid: string): Promise<any> {
    const data = await this.filterService.makeExcel(getInfo, userid);
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('گردش حساب');

    worksheet.columns = [
      { header: 'توضیحات', key: 'title', width: 50 },
      { header: 'کد رهگیری', key: 'ref', width: 25 },
      { header: 'واریز', key: 'in', width: 10 },
      { header: 'برداشت', key: 'out', width: 10 },
      { header: 'وضعیت', key: 'status', width: 10 },
      { header: 'تاریخ', key: 'date', width: 10 },
    ];

    worksheet.addRows(data);

    const dir = UPLOAD_URI_USERS + userid;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const today = todayDay();

    const filname = 'turnover' + new Date().getTime() + today + '.xlsx';

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
}
