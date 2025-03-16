import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  successOptWithDataNoValidation,
} from '@vision/common';
import * as excel from 'exceljs';
import * as fs from 'fs';
import { todayDay } from '@vision/common/utils/month-diff.util';
import { UPLOAD_URI_USERS } from '../../../__dir__';
import { FileManagerStatusEnum } from '../../../Core/file-manager/enums/file-manager-status-enum';
import { FileManagerModel } from '../../../Core/file-manager/models/file-manager.model';
import { FileManagerCoreService } from '../../../Core/file-manager/file-manager.service';

@Injectable()
export class GroupReportExcelApiService {
  constructor(private readonly fileManagerService: FileManagerCoreService) {}

  async export(data: any[], userid: string, fileName: string, fileManager: FileManagerModel): Promise<any> {
    if (data.length < 1) throw new NotFoundException('یافت نشد');

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('گزارشات');

    worksheet.columns = [
      { header: 'شماره ترمینال', key: 'terminalid', width: 10 },
      { header: 'شماره کارت', key: 'cardno', width: 60 },
      { header: 'نام خریدار', key: 'fullname', width: 20 },
      { header: 'کل مبلغ', key: 'total', width: 10 },
      { header: 'شارژ سازمانی', key: 'organization', width: 10 },
      { header: 'کل تخفیف', key: 'discount', width: 10 },
      { header: 'کیف پول', key: 'wallet', width: 30 },
      { header: 'اعتبار در فروشگاه', key: 'balanceinstore', width: 30 },
      { header: 'تاریخ', key: 'createdAt', width: 10 },
      { header: 'نام گروه', key: 'groupName', width: 20 },
      { header: 'نام پذیرنده', key: 'merchantTitle', width: 30 },
    ];

    worksheet.addRows(data);

    const dir = UPLOAD_URI_USERS + userid;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    const worked = await workbook.xlsx
      .writeFile(dir + '/' + fileName)
      .then(() => {
        this.fileManagerService.updateStatus(fileManager._id, FileManagerStatusEnum.SUCCESS);
      })
      .catch((err) => {
        this.fileManagerService.updateStatus(fileManager._id, FileManagerStatusEnum.ERROR);
        throw new InternalServerErrorException();
      });

    const downloadLink = process.env.SITE_URL_EXCEL + userid + '/' + fileName;
    return successOptWithDataNoValidation(downloadLink);
  }

  async exportTicket(data: any[], userid: string, fileName: string, fileManager: FileManagerModel): Promise<any> {
    if (data.length < 1) throw new NotFoundException('یافت نشد');

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('گزارشات');

    worksheet.columns = [
      { header: 'شماره کارت', key: 'cardnumber', width: 60 },
      { header: 'شماره ترمینال', key: 'terminalid', width: 10 },
      { header: 'تعداد', key: 'used', width: 10 },
      { header: 'تاریخ', key: 'createdAt', width: 30 },
    ];

    worksheet.addRows(data);

    const dir = UPLOAD_URI_USERS + userid;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    const today = todayDay();
    // const filname = 'GroupTicketReport' + new Date().getTime() + today + '.xlsx';
    const worked = await workbook.xlsx
      .writeFile(dir + '/' + fileName)
      .then(() => {
        this.fileManagerService.updateStatus(fileManager._id, FileManagerStatusEnum.SUCCESS);
      })
      .catch((err) => {
        this.fileManagerService.updateStatus(fileManager._id, FileManagerStatusEnum.ERROR);
        throw new InternalServerErrorException();
      });

    const downloadLink = process.env.SITE_URL_EXCEL + userid + '/' + fileName;
    return successOptWithDataNoValidation(downloadLink);
  }
}
