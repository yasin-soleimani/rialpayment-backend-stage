import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  successOptWithDataNoValidation,
  successOptWithPagination,
} from '@vision/common';
import { todayDay } from '@vision/common/utils/month-diff.util';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { GroupCoreUsersCardsService } from '../../../Core/group/services/group-users-card.service';
import { CardChargeHistoryCoreService } from '../../../Core/useraccount/card/services/card-history.service';
import * as excel from 'exceljs';
import * as jalalimoment from 'jalali-moment';
import * as fs from 'fs';
import { FileManagerCoreService } from '../../../Core/file-manager/file-manager.service';
import { FileManagerTypesEnum } from '../../../Core/file-manager/enums/file-manager-types-enum';
import { FileManagerStatusEnum } from '../../../Core/file-manager/enums/file-manager-status-enum';
import { UPLOAD_URI_USERS } from '../../../__dir__';
import { GroupCoreService } from '../../../Core/group/group.service';

@Injectable()
export class GroupCardReportApiService {
  constructor(
    private readonly cardHistoryService: CardChargeHistoryCoreService,
    private readonly groupCardsService: GroupCoreUsersCardsService,
    private readonly grouoCoreServuce: GroupCoreService,
    private readonly fileManagerService: FileManagerCoreService
  ) {}

  async getReport(groupId: string, type: number, start: number, end: number, userid: string): Promise<any> {
    const getCards = await this.groupCardsService.getCalc(groupId);
    const group = await this.grouoCoreServuce.getInfoById(groupId);
    if (!group) throw new BadRequestException();
    console.log('Group title is::::::::::::::::::', group.title);
    if (getCards.length < 1) throw new UserCustomException(' نتیجه ای یافت نشد');
    const data = await this.cardHistoryService.getReport(
      getCards[0].cardsNo,
      type,
      new Date(Number(start)),
      new Date(Number(end))
    );
    console.log(data, 'data report');
    return this.makeExcel(data, userid, groupId, type, group.title);
  }

  async getReportPaginate(
    groupId: string,
    page: number,
    type: number,
    start: number,
    end: number,
    userid: string
  ): Promise<any> {
    const getCards = await this.groupCardsService.getCalc(groupId);
    if (getCards.length < 1) throw new UserCustomException(' نتیجه ای یافت نشد');

    const data = await this.cardHistoryService.getReportPaginate(
      page,
      getCards[0].cardsNo,
      type,
      new Date(Number(start)),
      new Date(Number(end))
    );
    console.log(data, 'data getReportPaginate');

    return successOptWithPagination(this.paginateOutput(data));
  }

  private paginateOutput(data) {
    let tmp = Array();

    for (const item of data.docs) {
      let fullname = 'کارت بی نام';
      if (item.card) {
        if (item.card.user) {
          fullname = item.card.user.fullname;
          if (!fullname) fullname = item.card.user.mobile;
        }
      }

      tmp.push({
        fullname,
        cardno: item.cardno,
        amount: item.amount,
        createdAt: item.createdAt,
        type: item.type,
        description: item.description,
      });
    }

    data.docs = tmp;
    return data;
  }

  async makeExcel(data, userid: string, groupId: string, type: any, title: string): Promise<any> {
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('گزارش شارژ ');

    worksheet.columns = [
      { header: 'ردیف', key: 'row', width: 10 },
      { header: 'شماره کارت', key: 'cardno', width: 30 },
      { header: 'نام و نام خانوادگی', key: 'fullname', width: 15 },
      { header: 'مبلغ شارژ', key: 'amount', width: 10 },
      { header: 'نوع شارژ', key: 'pan3', width: 10 },
      { header: 'تاریخ شارژ', key: 'date', width: 10 },
      { header: 'توضیحات', key: 'desc', width: 10 },
      { header: 'کد ملی', key: 'nationalCode', width: 10 },
      { header: 'نام گروه', key: 'title', width: 15 },
    ];

    const result = this.makeResult(data, title);
    worksheet.addRows(result);

    const today = todayDay();
    const filname = 'charge-' + title + '-' + new Date().getTime() + today + '.xlsx';

    const fileManager = await this.fileManagerService.create({
      user: userid,
      type: FileManagerTypesEnum.EXCEL_GROUP_CHARGE_HISTORY,
      description: 'گزارش شارژ ',
      path: userid + '/' + filname,
      additionalType: type,
      group: groupId,
      status: FileManagerStatusEnum.PENDING,
    });
    this.createSyncExcel(workbook, userid, filname, fileManager).then();
    return successOptWithDataNoValidation(fileManager);
  }

  private async createSyncExcel(workbook, userid, filname, fileManager) {
    const dir = UPLOAD_URI_USERS + userid;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const worked = await workbook.xlsx
      .writeFile(dir + '/' + filname)
      .then(() => {
        this.fileManagerService.updateStatus(fileManager._id, FileManagerStatusEnum.SUCCESS);
        console.log('file saved!');
      })
      .catch((err) => {
        this.fileManagerService.updateStatus(fileManager._id, FileManagerStatusEnum.ERROR);
        throw new InternalServerErrorException();
      });

    const downloadLink = process.env.SITE_URL_EXCEL + userid + '/' + filname;
  }

  private makeResult(data, title) {
    let tmpArray = Array();

    let counter = 1;
    for (const item of data) {
      let fullname = 'کارت بی نام';
      let nationalCode = 'کارت بی نام';
      if (item.card) {
        if (item.card.user) {
          fullname = item.card.user.fullname;
          nationalCode = item.card.user.nationalcode;
          if (!fullname) fullname = item.card.user.mobile;
        }
      }
      tmpArray.push({
        row: counter,
        fullname,
        cardno: item.cardno,
        amount: item.amount,
        date: jalalimoment(Number(item.createdAt)).locale('fa').format('YY/MM/DD'),
        type: item.type,
        desc: item.description,
        nationalCode,
        title,
      });

      counter++;
    }

    return tmpArray;
  }
}
