import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  successOptWithDataNoValidation,
} from '@vision/common';
import * as excel from 'exceljs';
import { GroupCoreService } from '../../../Core/group/group.service';
import { GroupListCoreService } from '../../../Core/group/services/group-list.service';
import * as fs from 'fs';
import { todayDay } from '@vision/common/utils/month-diff.util';
import { isEmpty } from '@vision/common/utils/shared.utils';
import * as momentjs from 'jalali-moment';
import { CoreGroupTerminalBalanceService } from '../../../Core/group-terminal-balance/group-tb.service';
import { FileManagerTypesEnum } from '../../../Core/file-manager/enums/file-manager-types-enum';
import { FileManagerStatusEnum } from '../../../Core/file-manager/enums/file-manager-status-enum';
import { FileManagerCoreService } from '../../../Core/file-manager/file-manager.service';
import { UPLOAD_URI_USERS } from '../../../__dir__';

@Injectable()
export class ExportJsService {
  constructor(
    private readonly groupService: GroupCoreService,
    private readonly groupListService: GroupListCoreService,
    private readonly balanceService: CoreGroupTerminalBalanceService,
    private readonly fileManagerService: FileManagerCoreService
  ) {}

  async makeFile(userid, groupid): Promise<any> {
    const today = todayDay();
    const filname = 'cards' + new Date().getTime() + today + '.xlsx';

    const fileManager = await this.fileManagerService.create({
      user: userid,
      type: FileManagerTypesEnum.EXCEL_USERS_LIST,
      description: 'گزارش کاربران گروه ',
      path: userid + '/' + filname,
      additionalType: -1,
      group: groupid,
      status: FileManagerStatusEnum.PENDING,
    });
    this.generateSyncExcel(groupid, userid, filname, fileManager);
    return successOptWithDataNoValidation(fileManager);
  }

  private async generateSyncExcel(groupid, userid, filname, fileManager) {
    const data = await this.groupListService.getAll(groupid);
    if (!data) throw new NotFoundException();
    const result = await this.makeResult(data, userid);
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('Customers');

    worksheet.columns = [
      { header: 'Id', key: 'id', width: 10 },
      { header: 'Pan1', key: 'pan1', width: 10 },
      { header: 'Pan2', key: 'pan2', width: 10 },
      { header: 'Pan3', key: 'pan3', width: 10 },
      { header: 'Pan4', key: 'pan4', width: 10 },
      { header: 'encode', key: 'encode', width: 30 },
      { header: 'fullname', key: 'fullname', width: 30 },
      { header: 'cvv2', key: 'cvv2', width: 10 },
      { header: 'expire', key: 'expire', width: 15 },
      { header: 'pin', key: 'pin', width: 15 },
      { header: 'nationalcode', key: 'nationalcode', width: 30 },
      { header: 'amount', key: 'mod', width: 30 },
    ];

    worksheet.addRows(result);

    const dir = UPLOAD_URI_USERS + userid;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    await workbook.xlsx
      .writeFile(dir + '/' + filname)
      .then(() => {
        this.fileManagerService.updateStatus(fileManager._id, FileManagerStatusEnum.SUCCESS);
        console.log('file saved!');
      })
      .catch((err) => {
        this.fileManagerService.updateStatus(fileManager._id, FileManagerStatusEnum.ERROR);
        throw new InternalServerErrorException();
      });
  }

  private async makeResult(data, userid: string): Promise<any> {
    let tmpArray = Array();

    let counter = 1;

    const terminals = await this.balanceService.getTerminalByUserId(userid);
    console.log({ terminals });
    for (const info of data) {
      let encode;
      let pans;
      let cvv2, expire, pin;
      let mod = 0;

      if (info.user) {
        console.log({ user: info?.user?._id });
        encode = info.user.card.cardno + '=' + info.user.card.secpin;
        pans = this.getPans(info.user.card.cardno.toString());
        cvv2 = info.user.card.cvv2;
        expire = momentjs(Number(info.user.card.expire)).locale('fa').format('YY/MM');
        pin = info.user.card.secpin;
        mod = await this.balanceService.getBalanceByUser(terminals, info.user._id);
      } else if (info.card.user) {
        console.log({ cardUser: info?.card?.user?._id });
        cvv2 = info.card.cvv2;
        encode = info.card.cardno + '=' + info.card.secpin;
        pans = this.getPans(info.card.cardno.toString());
        expire = momentjs(Number(info.card.expire)).locale('fa').format('YY/MM');
        pin = info.card.secpin;
        mod = await this.balanceService.getBalanceByUser(terminals, info.card.user._id);
      } else if (info.card) {
        console.log({ card: info?.card?._id });
        cvv2 = info.card.cvv2;
        encode = info.card.cardno + '=' + info.card.secpin;
        pans = this.getPans(info.card.cardno.toString());
        expire = momentjs(Number(info.card.expire)).locale('fa').format('YY/MM');
        pin = info.card.secpin;
        mod = await this.balanceService.getBalanceByCard(terminals, info.card._id);
      }

      console.log({ mod });
      tmpArray.push({
        id: counter,
        pan1: pans[0].toString(),
        pan2: pans[1].toString(),
        pan3: pans[2].toString(),
        pan4: pans[3].toString(),
        encode: encode,
        fullname: this.getUserInfo(info),
        cvv2: cvv2,
        expire: expire,
        nationalcode: this.getUserNationalCode(info),
        pin: pin,
        mod: mod ?? 0,
      });
      counter++;
    }

    return tmpArray;
  }

  private getUserInfo(info) {
    if (info.user) {
      return info.user.fullname;
    } else if (info.card && info.card.user) {
      return info.card.user.fullname;
    } else '';
  }

  private getUserNationalCode(info) {
    if (info.user) {
      return info.user.nationalcode;
    } else if (info.card && info.card.user) {
      return info.card.user.nationalcode;
    } else '';
  }

  getPans(cardno: string) {
    return cardno.match(/.{1,4}/g);
  }
}
