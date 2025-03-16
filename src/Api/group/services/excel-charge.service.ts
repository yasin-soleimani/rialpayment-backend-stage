import { Injectable, successOpt } from '@vision/common';
import { GroupCoreService } from '../../../Core/group/group.service';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { CardService } from '../../../Core/useraccount/card/card.service';
import xlsx from 'node-xlsx';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { UserService } from '../../../Core/useraccount/user/user.service';

@Injectable()
export class GroupExcelChargeApiService {
  constructor(
    private readonly groupService: GroupCoreService,
    private readonly cardService: CardService,
    private readonly userService: UserService
  ) {}

  async action(req, getInfo, userId: string, title): Promise<any> {
    const excelFile = req.files.excel;
    if (!excelFile.data) throw new UserCustomException('متاسفانه قالب بندی فایل شما درست نمی باشد', false, 500);
    const workSheetsFromBuffer = xlsx.parse(excelFile.data);

    if (!title || title.length < 1) throw new UserCustomException('عنوان را وارد نمایید');

    this.calc(workSheetsFromBuffer[0].data, getInfo.type, userId, getInfo.terminals, title, getInfo.group);
    return this.requestAccpted();
  }

  private async calc(data, type: string, userId: string, terminals, title, group): Promise<any> {
    // filter out all empty arrays
    const filteredXlsxData = data.filter((element) => element.length > 0);
    // filter first row of xlsx file, cause it's just header
    const actualXlsxData = filteredXlsxData.slice(2, filteredXlsxData.length);
    console.log('actual:::::::', actualXlsxData);
    if (type == '1') {
      this.walletCharge(actualXlsxData, userId);
      return this.requestAccpted();
    } else if (type == '2') {
      this.BisCharge(actualXlsxData, userId, terminals, title, group);
      return this.requestAccpted();
    } else if (type == '3') {
      this.organizationCharge(actualXlsxData, userId);
      return this.requestAccpted();
    } else {
      throw new UserCustomException('نوع شارژ صحیح نمی باشد ');
    }
  }

  private async walletCharge(data, userId: string): Promise<any> {
    for (const item of data) {
      if (item[5] && item[5]?.length > 1) {
        // const cardNo = item[5].split('=');
        const cardInfo = await this.cardService.getCardInfo(Number(item[5]));
        if (cardInfo) {
          this.groupService.chargePayWallet(parseInt(item[6], 10), userId, cardInfo._id, cardInfo.cardno);
        }
      } else {
        const userInfo = await this.userService.getInfoByNationalCode(item[7]);
        if (userInfo) {
          const cardInfo = await this.cardService.getCardByUserID(userInfo._id);
          this.groupService.chargePayWallet(parseInt(item[6], 10), userId, cardInfo._id, cardInfo.cardno);
        }
      }
    }

    return successOpt();
  }

  private async BisCharge(data, userId: string, terminals, title, group): Promise<any> {
    const terminalsData = terminals.split(',');
    const days = this.daysOfWeek(data);
    const errorsData = [];
    const successData = [];
    let rowCounter = 1;
    for (const item of data) {
      if (item[5] && item[5]?.length > 1) {
        // const cardNo = item[5].split('=');
        const cardInfo = await this.cardService.getCardInfo(Number(item[5]));
        if (cardInfo) {
          const groupId = await this.getGroup(cardInfo);
          let myCard = cardInfo.cardno;
          if (cardInfo.user) myCard = cardInfo._id;
          console.log(groupId.equals(group));
          if (groupId.equals(group)) {
            await this.groupService
              .chargeGroupUsers(
                terminalsData,
                groupId,
                parseInt(item[6], 10),
                new Date().getTime(),
                days,
                myCard.toString(),
                userId,
                title
              )
              .then();
          }
        } else errorsData.push({ row: rowCounter, message: `اطلاعات کارت ${item[5]} یافت نشد` });
      } else {
        const userInfo = await this.userService.getInfoByNationalCode(item[7]);
        if (userInfo) {
          const cardInfo = await this.cardService.getCardByUserID(userInfo._id);
          const groupId = await this.getGroup(cardInfo);
          let myCard = cardInfo.cardno;
          if (cardInfo.user) myCard = cardInfo._id;
          console.log(groupId.equals(group));
          if (groupId.equals(group)) {
            await this.groupService.chargeGroupUsers(
              terminalsData,
              groupId,
              parseInt(item[6], 10),
              new Date().getTime(),
              days,
              myCard.toString(),
              userId,
              title
            );
          }
        }
      }
      rowCounter++;
    }

    return this.requestAccpted();
  }

  private async organizationCharge(data, userId: string): Promise<any> {
    for (const item of data) {
      if (item[5] && item[5].length > 1) {
        // const cardNo = item[5].split('=');
        const cardInfo = await this.cardService.getCardInfo(Number(item[5]));
        if (cardInfo) {
          this.groupService.newOrganizationCharge({ amount: Number(item[6]), users: cardInfo._id }, userId);
        }
      } else {
        const userInfo = await this.userService.getInfoByNationalCode(item[7]);
        if (userInfo) {
          const cardInfo = await this.cardService.getAllCardsByUserid(userInfo._id);
          this.groupService.newOrganizationCharge({ amount: item[6], users: cardInfo._id }, userId);
        }
      }
    }

    return this.requestAccpted();
  }

  private daysOfWeek(getInfo) {
    let daysofweek = Array();
    if (new Boolean(getInfo.saturday)) daysofweek.push(6);
    if (new Boolean(getInfo.sunday)) daysofweek.push(0);
    if (new Boolean(getInfo.monday)) daysofweek.push(1);
    if (new Boolean(getInfo.tuesday)) daysofweek.push(2);
    if (new Boolean(getInfo.wednesday)) daysofweek.push(3);
    if (new Boolean(getInfo.thursday)) daysofweek.push(4);
    if (new Boolean(getInfo.friday)) daysofweek.push(5);
    return daysofweek;
  }

  private async getGroup(cardInfo: any): Promise<any> {
    if (cardInfo.user) {
      console.log('in card info user');
      const info = await this.groupService.getGroupByUserId(cardInfo.user);
      console.log('cardInfooooooooooooooooooooooooooo:::::::::::', info);
      return info.group;
    } else {
      console.log('in card info card');
      return cardInfo.group;
    }
  }

  private requestAccpted() {
    return {
      status: 200,
      success: true,
      message: 'درخواست شما ثبت شده است',
    };
  }
}
