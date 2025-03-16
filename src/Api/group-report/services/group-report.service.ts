import { BadRequestException, Injectable, successOptWithData } from '@vision/common';
import { GroupReportCoreService } from '../../../Core/group-report/services/report.service';
import { GroupReportExcelApiService } from './excel.service';
import { todayDay } from '@vision/common/utils/month-diff.util';
import { FileManagerTypesEnum } from '../../../Core/file-manager/enums/file-manager-types-enum';
import { FileManagerStatusEnum } from '../../../Core/file-manager/enums/file-manager-status-enum';
import { FileManagerCoreService } from '../../../Core/file-manager/file-manager.service';
import { GroupCoreService } from '../../../Core/group/group.service';
import { MerchantcoreService } from '../../../Core/merchant/merchantcore.service';
import { CardService } from '../../../Core/useraccount/card/card.service';

@Injectable()
export class GroupReportApiService {
  constructor(
    private readonly reportService: GroupReportCoreService,
    private readonly excelService: GroupReportExcelApiService,
    private readonly fileManagerService: FileManagerCoreService,
    private readonly groupService: GroupCoreService,
    private readonly merchantService: MerchantcoreService,
    private readonly cardService: CardService
  ) {}

  async gerReport(merchantId: string, userId: string, groupId: string, from, to, page: number, type): Promise<any> {
    return this.reportService.getAll(merchantId, groupId, userId, from, to, page, type);
  }

  async excel(merchantId: string, userId: string, groupId: string, from, to, type): Promise<any> {
    const today = todayDay();
    const groupData = await this.groupService.getInfoById(groupId);
    if (!groupData) throw new BadRequestException();
    const filname = (groupData.title ?? 'GroupReport') + new Date().getTime() + today + '.xlsx';
    // const filname = 'GroupReport' + new Date().getTime() + today + '.xlsx';

    const fileManager = await this.fileManagerService.create({
      user: userId,
      type: FileManagerTypesEnum.EXCEL_GROUP_TRANSACTION,
      description: `گزارش تراکنش ${type == 1 ? '' : 'تیکت'} های گروه `,
      path: userId + '/' + filname,
      additionalType: -1,
      group: groupId,
      status: FileManagerStatusEnum.PENDING,
    });
    const fileId = fileManager._id;
    this.createExcel(merchantId, userId, groupId, from, to, type, filname, fileManager, groupData.title)
      .then()
      .catch(async () => {
        await this.fileManagerService.updateStatus(fileId, FileManagerStatusEnum.ERROR);
      });
    return successOptWithData(fileManager);
  }

  private async createExcel(
    merchantId: string,
    userId: string,
    groupId: string,
    from,
    to,
    type,
    filname,
    fileManager,
    groupTitle: string
  ) {
    const fixed = [];
    const data = await this.reportService.getAllTransactions(merchantId, groupId, userId, from, to, type);
    const merchantInfo = await this.merchantService.getMerchantInfoById(merchantId, userId, false);
    if (type == 1) {
      for (const d of data) {
        fixed.push({
          ...d,
          groupName: groupTitle ? groupTitle : '',
          merchantTitle: merchantInfo ? merchantInfo.title : '',
          fullname: d && d.user && d.user.fullname ? d.user.fullname : '',
          cardno:
            d.cardno.toString().substr(0, 4) +
            '-' +
            d.cardno.toString().substr(4, 4) +
            '-' +
            d.cardno.toString().substr(8, 4) +
            '-' +
            d.cardno.toString().substr(12, 4),
        });
      }
      this.excelService.export(fixed, userId, filname, fileManager).then(console.log).catch(console.log);
    } else {
      for (const d of data) {
        fixed.push({
          ...d,
          cardnumber:
            d.cardnumber.toString().substr(0, 4) +
            '-' +
            d.cardnumber.toString().substr(4, 4) +
            '-' +
            d.cardnumber.toString().substr(8, 4) +
            '-' +
            d.cardnumber.toString().substr(12, 4),
        });
      }
      return this.excelService.exportTicket(fixed, userId, filname, fileManager).then(console.log).catch(console.log);
    }
  }
}
