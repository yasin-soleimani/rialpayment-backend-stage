import {
  BadRequestException,
  faildOpt,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  successOpt,
  successOptWithDataNoValidation,
  successOptWithPagination,
} from '@vision/common';
import { UserService } from '../../Core/useraccount/user/user.service';
import { BackofficeUsersFilterDto } from './dto/users-filter.dto';
import { userFilterQueryBuilder, usersOutputArray } from './services/query.service';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { userInfoDetails } from './services/data-model';
import { BackofficeUsersLogDto } from './dto/users-log.dto';
import { BackofficeUsersLogQueryBuilder, userCashoutQueryBuilder } from './component/users-query-builder.component';
import { LoggercoreService } from '../../Core/logger/loggercore.service';
import { returnCashoutMdel, returnUserLogModel } from './component/return-user-log.model';
import { BackofficeUsersCashoutDto } from './dto/users-cashout.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { CheckoutSubmitCommonService } from '../../Core/checkout/submit/services/submit-common.service';
import { SafevoucherCoreService } from '../../Core/safevoucher/safevoucher.service';
import { returnVoucherMode, returnVoucherUsedModel } from './component/voucher-query-component';
import { isNumber } from 'util';
import { BackofficeUsersChangeInformationDto } from './dto/users-changeInformation.dto';
import { IdentifyCoreService } from '../../Core/useraccount/identify/identify.service';
import { imageTransform } from '@vision/common/transform/image.transform';
import { backofficeReturnIdentifyList } from './component/identify-list.component';
import { MessagesCoreService } from '../../Core/messages/messages.service';
import { messageTypeConst } from '../../Core/messages/const/type.const';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import * as persianize from 'persianize';
import { Types } from 'mongoose';
import { IdentifyRejectCoreService } from '../../Core/useraccount/identify/services/reject.service';
import { Sitad } from '@vision/common/utils/sitad.util';
import { IzbankService } from '@vision/common/izbank/izbank.service';
import { nahabRequest } from '@vision/common/nahab/request';
import { TicketsCoreService } from '../../Core/tickets/tickets.service';
import { timestamoToISO } from '@vision/common/utils/month-diff.util';
import { ClubCoreService } from '../../Core/customerclub/club.service';
import { GroupCoreService } from '../../Core/group/group.service';

@Injectable()
export class BackofficeUsersService {
  constructor(
    private readonly userService: UserService,
    private readonly cashoutService: CheckoutSubmitCommonService,
    private readonly voucherService: SafevoucherCoreService,
    private readonly identifyService: IdentifyCoreService,
    private readonly rejectService: IdentifyRejectCoreService,
    private readonly messageService: MessagesCoreService,
    private readonly loggerService: LoggercoreService,
    private readonly ticketsCoreService: TicketsCoreService,
    private readonly customerClubService: ClubCoreService,
    private readonly groupCoreService: GroupCoreService
  ) {}

  async getAll(getInfo: BackofficeUsersFilterDto, page): Promise<any> {
    const query = userFilterQueryBuilder(getInfo);
    const data = await this.userService.userAdminFilter(query, page);
    data.docs = await usersOutputArray(data.docs);
    return successOptWithPagination(data);
  }

  async findClubData(mobile: number) {
    const userData = await this.userService.findByMobile(mobile);
    if (!userData) throw new NotFoundException('کاربری یافت نشد');

    const clubData = await this.customerClubService.getClubInfoByOwner(userData._id);

    const nameData = clubData ? clubData.title : userData.fullname;
    return { _id: userData._id, name: nameData };
  }

  async setUserRef(user: string, ref: string) {
    if (!user || !ref) throw new BadRequestException('تمامی فیلد ها را پر کنید');
    const userData = await this.userService.findUser(user);
    if (!userData) throw new NotFoundException('کاربری یافت نشد');
    const refData = await this.userService.findUser(ref);
    if (!refData) throw new NotFoundException('اکانت کاربر مادر یافت نشد');
    this.userService.changeRefID(user, ref);
    return successOpt();
  }

  async changeStatus(userid, block, checkout, accessPanel): Promise<any> {
    if (block) {
      let statusx = false;
      if (block == 'true') statusx = true;
      const data = await this.userService.changeBlockSatusById(userid, statusx).then((res) => {
        let secStatus = true;
        if (statusx == true) secStatus = false;
        this.userService.changeCheckout(userid, secStatus);
        this.userService.accessPanelUser(userid, secStatus);
        return res;
      });

      if (!data) throw new InternalServerErrorException();
      return successOpt();
    }

    if (checkout) {
      let statusx = false;
      if (checkout == 'true') statusx = true;
      const data = await this.userService.changeCheckout(userid, statusx);
      if (!data) throw new InternalServerErrorException();
      return successOpt();
    }

    if (accessPanel) {
      let statusx = false;
      if (accessPanel == 'true') statusx = true;
      const data = await this.userService.accessPanelUser(userid, statusx);
      if (data) if (!data) throw new InternalServerErrorException();
      return successOpt();
    }

    throw new FillFieldsException();
  }

  async getUserInfo(userid: string): Promise<any> {
    const userInformation = await this.userService.getAllInfoByUserid(userid);
    if (!userInformation) throw new UserNotfoundException();
    let clubData = null;
    if (userInformation.ref) clubData = await this.customerClubService.getClubInfoByOwner(userInformation.ref._id);
    if (userInformation.ref && !clubData) {
      const refUser = await this.userService.findUser(userInformation.ref);
      clubData = { title: refUser.fullname ?? refUser.mobile };
    }
    let groupData = await this.groupCoreService.getGroupInfoByUserId(userid);
    return successOptWithDataNoValidation({
      ...userInfoDetails(userInformation),
      clubInfo: clubData ?? null,
      groupData: groupData ?? null,
    });
  }

  async changeMaxcashout(userid: string, amount: number, perday: number, perhour: number): Promise<any> {
    const userInformation = await this.userService.getInfoByUserid(userid);
    if (!userInformation) throw new UserNotfoundException();

    return this.userService
      .changeCashout(userid, amount, perday, perhour)
      .then((result) => {
        if (result) return successOpt();
        return faildOpt();
      })
      .catch((err) => {
        return faildOpt();
      });
  }

  async getUserLog(getInfo: BackofficeUsersLogDto, page: number): Promise<any> {
    const query = BackofficeUsersLogQueryBuilder(getInfo);
    const data = await this.loggerService.getUserLog(query, page);
    data.docs = returnUserLogModel(data.docs, getInfo.userid);
    return successOptWithPagination(data);
  }

  async getUsersTicketLog(getInfo: BackofficeUsersLogDto, page: number): Promise<any> {
    const array = [];
    if (getInfo.from) {
      let from = timestamoToISO(getInfo.from * 1000);
      array.push({ createdAt: { $gte: from } });
    }
    if (getInfo.to) {
      let to = timestamoToISO(getInfo.to * 1000);
      array.push({ createdAt: { $lte: to } });
    }
    if (getInfo.userid) {
      array.push({ user: getInfo.userid });
    }
    let query = {};
    if (array.length > 0) {
      query = { $and: array };
    }
    const data = await this.ticketsCoreService.getTicketHistoriesBackofiice(query, page);
    return successOptWithPagination(data);
  }

  async getCashoutHistory(getInfo: BackofficeUsersCashoutDto, page: number): Promise<any> {
    if (isEmpty(getInfo.userid)) throw new FillFieldsException();
    const query = userCashoutQueryBuilder(getInfo.from, getInfo.to, getInfo.userid);
    const data = await this.cashoutService.getReportQueryAll(query, page);
    data.docs = returnCashoutMdel(data.docs);
    return successOptWithPagination(data);
  }

  async getVouchers(userid: string, page: number, type: number): Promise<any> {
    if (isEmpty(userid)) throw new FillFieldsException();
    let list;
    if (type === 1) {
      list = await this.voucherService.getList(userid, page);
      list.docs = returnVoucherMode(list.docs);
      return successOptWithPagination(list);
    } else {
      let ObjId = Types.ObjectId;

      list = await this.voucherService.getUsedList(
        [
          { $unwind: '$details' },
          { $match: { 'details.user': ObjId(userid) } },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'fromInfo',
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'details.user',
              foreignField: '_id',
              as: 'toInfo',
            },
          },
        ],
        page
      );
      list.docs = returnVoucherUsedModel(list.docs);
      return successOptWithPagination(list);
    }
  }

  async changeStus(id: string, status: number): Promise<any> {
    if (isEmpty(id) || !isNumber(status)) throw new FillFieldsException();
    return this.voucherService.changeStatus(id, status).then((res) => {
      if (!res) throw new InternalServerErrorException();
      return successOpt();
    });
  }

  async changeInformation(getInfo: BackofficeUsersChangeInformationDto, userid: string): Promise<any> {
    // @ts-ignore
    if (!getInfo.reject || getInfo.reject == 'false') {
      return this.setAuthIdentify(getInfo);
    } else {
      return this.setRejectAuth(getInfo);
    }
  }

  private async setAuthIdentify(getInfo: BackofficeUsersChangeInformationDto): Promise<any> {
    if (
      isEmpty(getInfo.birthdate) ||
      isEmpty(getInfo.fathername) ||
      isEmpty(getInfo.fullname) ||
      isEmpty(getInfo.place) ||
      isEmpty(getInfo.user) ||
      isEmpty(getInfo.nationalcode)
    )
      throw new FillFieldsException();
    if (!persianize.validator().meliCode(getInfo.nationalcode))
      throw new UserCustomException('کد ملی را به صورت صحیح وارد نمایید');

    const userInfo = await this.userService.getInfoByNationalCode(getInfo.nationalcode);
    if (userInfo && userInfo._id.toString() !== getInfo.user.toString())
      throw new UserCustomException('کد ملی تکراری می باشد');
    return this.userService
      .updateQuery(getInfo.user, {
        fullname: getInfo.fullname,
        place: getInfo.place,
        birthdate: getInfo.birthdate,
        fathername: getInfo.fathername,
        nationalcode: getInfo.nationalcode,
      })
      .then(async (res) => {
        if (!res) throw new InternalServerErrorException();
        await this.identifyService.changeStatus(res._id, true).then((res2) => {
          console.log(res2, 'res');
        });
        return successOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  private async setRejectAuth(getInfo: BackofficeUsersChangeInformationDto): Promise<any> {
    if (isEmpty(getInfo.message)) throw new FillFieldsException();

    return this.messageService
      .submit('5c8268d70e88895a90bd2eeb', getInfo.user, 'احراز هویت', getInfo.message, messageTypeConst.warning)
      .then((res) => {
        if (!res) throw new InternalServerErrorException();
        this.identifyService.changeStatus(getInfo.user, true);
        this.rejectService.addNew(getInfo.user, getInfo.message).then((res) => console.log(res, 'reject reason'));
        return successOpt();
      })
      .catch((err) => {
        console.log(err, 'err');
        throw new InternalServerErrorException();
      });
  }

  async getIdentifyList(userid: string, page: number): Promise<any> {
    if (isEmpty(userid) || isEmpty(page)) throw new FillFieldsException();

    const data = await this.identifyService.getIdentifyList(userid, page);
    data.docs = backofficeReturnIdentifyList(data.docs);
    return successOptWithPagination(data);
  }

  async getLastIdentifyUploadData(userid: string): Promise<any> {
    if (isEmpty(userid)) throw new FillFieldsException();

    const userInfo = await this.userService.getInfoByUserid(userid);
    const data = await this.identifyService.getUserLastUploadIdentifyData(userid);
    const rejectInfo = await this.rejectService.getLast(userid);

    let reason = '';
    let reject = false;
    if (!rejectInfo) {
      reason = '';
    } else {
      reason = rejectInfo.reason;
      reject = true;
    }
    let front,
      back = '';
    if (data && data.ninfront) {
      front = imageTransform(data.ninfront);
    }
    if (data && data.ninback) {
      back = imageTransform(data.ninback);
    }
    return successOptWithDataNoValidation({
      fullname: userInfo.fullname || '',
      nationalcode: userInfo.nationalcode || '',
      birthdate: userInfo.birthdate || '',
      place: userInfo.place || '',
      fathername: userInfo.fathername || '',
      ninfront: front,
      ninback: back,
      cardno: data.cardno,
      message: reason,
      reject: reject,
      updatedAt: userInfo.updatedAt,
    });
  }

  async getIdentitySitad(nin, birthdate): Promise<any> {
    const sitad = new Sitad();

    const sitadInfo = await sitad.getInfo(nin, birthdate);
    if (!sitadInfo) throw new UserCustomException('یافت نشد', false, 404);
    return successOptWithDataNoValidation(sitadInfo);
  }

  async getIdentifyWithCardNumber(cardno, nationalcode): Promise<any> {
    const izBank = new IzbankService();

    const cardInfo = await nahabRequest(cardno);
    if (!cardInfo || cardInfo.resultCode != 0) {
      throw new UserCustomException('متاسفانه مشخصات کارت در بانک اطلاعاتی یافت نشد');
    }

    if (cardInfo.nationalCode != nationalcode) {
      throw new UserCustomException('متاسفانه کد ملی وارد شده با کد ملی صاحب کارت یکی نمی باشد');
    }

    const bankInfo = await izBank.getCardInfo(cardno);

    const data = {
      fullname: bankInfo.first_name + ' ' + bankInfo.last_name,
      nationalcode: nationalcode,
      cardno: cardno,
    };

    return successOptWithDataNoValidation(data);
  }
}
