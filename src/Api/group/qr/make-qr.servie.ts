import { Injectable, NotFoundException, successOpt } from '@vision/common';
import { GroupListCoreService } from '../../../Core/group/services/group-list.service';
import * as momentjs from 'jalali-moment';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { CardQrCoreService } from '../../../Core/useraccount/card/services/card-qr.service';
import { cardQrGenerator } from '../function/card-qr.func';
import { PUBLIC_DIR, UPLOAD_URI, UPLOAD_URI_USERS } from '../../../__dir__';
import * as path from 'path';
import { ClubCoreService } from '../../../Core/customerclub/club.service';
import { GroupCoreService } from '../../../Core/group/group.service';
import { FileManagerTypesEnum } from '../../../Core/file-manager/enums/file-manager-types-enum';
import { FileManagerStatusEnum } from '../../../Core/file-manager/enums/file-manager-status-enum';
import { FileManagerCoreService } from '../../../Core/file-manager/file-manager.service';
import { FileManagerModel } from '../../../Core/file-manager/models/file-manager.model';

var pdf = require('html-pdf');
var fs = require('fs');

@Injectable()
export class GroupMakeQrService {
  private currentDir = PUBLIC_DIR.endsWith('/') ? PUBLIC_DIR : PUBLIC_DIR + '/';

  constructor(
    private readonly groupListService: GroupListCoreService,
    private readonly groupService: GroupCoreService,
    private readonly customerClubService: ClubCoreService,
    private readonly cardQrService: CardQrCoreService,
    private readonly fileManagerService: FileManagerCoreService
  ) {}

  async doIt(groupId: string, user: string): Promise<any> {
    if (!groupId || groupId.length < 1) throw new FillFieldsException();
    const data = await this.groupListService.getAll(groupId);
    const groupData = await this.groupService.getInfoById(groupId);
    let logo = this.currentDir + 'assets/img/logo301.png';
    if (groupData) {
      console.log(groupData.user);
      const clubData = await this.customerClubService.getClubInfo(groupData.user);
      console.log('clubdata::::::::::::::::::::::::', clubData);
      if (clubData && clubData.logo) {
        if (fs.existsSync(this.currentDir + 'upload/' + clubData.logo))
          logo = this.currentDir + 'upload/' + clubData.logo;
        else console.log('noxist');
      }
    }
    let preImg = '';
    if (logo.endsWith('.png')) preImg = 'data:image/png;base64,';
    else preImg = 'data:image/jpeg;base64,';
    let logoscope = fs.readFileSync(logo);
    const buffer = Buffer.from(logoscope).toString('base64');
    const logoBase64 = preImg + buffer;
    if (!data) throw new NotFoundException();

    const list = await this.getList(data);
    let scope = fs.readFileSync(path.join(this.currentDir, '../', 'views', 'card-qr', 'details.html'), 'utf8');

    let template = '';
    let counter = 1;
    let fileQrCounter = 1;
    let fileCounter = 0;
    let files = [];
    for (const info of list) {
      console.log(info.content);
      let newScope = scope;
      newScope = newScope.replace('!!cardno', info.cardno);
      newScope = newScope.replace('!!expire', info.expire);
      newScope = newScope.replace(
        '!!groupname',
        'data:image/png;base64,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'
      );
      newScope = newScope.replace('!!cvv2', info.cvv2);
      newScope = newScope.replace('!!logo', logoBase64);
      newScope = newScope.replace('!!qr', cardQrGenerator(info.content));
      if (counter == 8) {
        newScope = newScope + '<br><div style="page-break-after:always;"></div>';
        counter = 0;
      }
      //template = template + newScope;
      files[fileCounter] = files[fileCounter] + newScope;
      counter += 1;

      if (fileQrCounter == 48) {
        fileCounter += 1;
        fileQrCounter = 0;
      }
      fileQrCounter += 1;
    }
    console.log('loopeded::::::');

    const fileNames = [];
    for (let i = 0; i < files.length; i++) {
      const filename = momentjs().format('YYYY-MM-DD_HH:mm:ss') + groupId + '-' + (i + 1) + '.pdf';
      const fileManager = await this.fileManagerService.create({
        user: user,
        type: FileManagerTypesEnum.GROUP_QR,
        description: 'Qr کد گروه ',
        path: user + '/' + filename,
        additionalType: null,
        group: groupId,
        status: FileManagerStatusEnum.PENDING,
      });
      fileNames.push({ filename, fileManager });
    }

    this.loopPdf(files, fileNames, user).then(() =>
      console.log('::::::::::::::::::::: PDF DONE ::::::::::::::::::::::::::::')
    );
    /*    const filename = new Date().getTime() + groupId;
        const pdf = await this.makePdf(template, filename);
        const downloadLink = process.env.SITE_URL + filename + '.pdf';*/
    return successOpt();
  }

  private async loopPdf(files: string[], fileNames: { filename: string; fileManager: FileManagerModel }[], userid) {
    for (let i = 0; i < files.length; i++) {
      const dir = UPLOAD_URI_USERS + userid;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      await this.makePdf(files[i], fileNames[i].filename, userid);
      await this.fileManagerService.updateStatus(fileNames[i].fileManager._id, FileManagerStatusEnum.SUCCESS);
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }

  private async getList(data: any): Promise<any> {
    let tmpArray = Array();
    for (const info of data) {
      if (info.user) {
        if (info.user.card.secpin) {
          const enc = await this.cardQrService.makeQrEnc(info.user.card.cardno);
          if (enc) {
            tmpArray.push({
              encode: info.user.card.cardno + '=' + info.user.card.secpin,
              cardno: info.user.card.cardno,
              cvv2: info.user.card.cvv2,
              expire: momentjs(Number(info.user.card.expire)).locale('fa').format('YY/MM'),
              fullname: info.user.fullname,
              content: info.user.card.cardno.toString() + enc,
            });
          }
        }
      } else {
        if (info.card.secpin) {
          const enc = await this.cardQrService.makeQrEnc(info.card.cardno);
          if (enc) {
            tmpArray.push({
              encode: info.card.cardno + '=' + info.card.secpin,
              cardno: info.card.cardno,
              cvv2: info.card.cvv2,
              expire: momentjs(Number(info.card.expire)).locale('fa').format('YY/MM'),
              fullname: null,
              content: info.card.cardno.toString() + enc,
            });
          }
        }
      }
    }
    if (tmpArray.length < 1) throw new UserCustomException('کارتی یافت نشد');

    return tmpArray;
  }

  private makeQr() {}

  private async makePdf(data, ref, user): Promise<any> {
    const header = fs.readFileSync(path.join(this.currentDir, '../', 'views', 'card-qr', 'header.html'), 'utf8');
    const footer = fs.readFileSync(path.join(this.currentDir, '../', 'views', 'card-qr', 'footer.html'), 'utf8');

    const options = {
      format: 'A4',
      header: {
        height: '10mm',
      },
    };
    let html = header + data + footer;

    return new Promise((resolve, reject) => {
      console.log('create pdf started::::');
      pdf.create(html, options).toFile(UPLOAD_URI_USERS + user + '/' + ref, function (err, res) {
        console.log('pdf path:::::', UPLOAD_URI_USERS + user + '/' + ref);
        if (err) {
          console.log('err pdf:::', err);
          reject(err);
        }
        resolve(res);
      });
    });
  }
}
