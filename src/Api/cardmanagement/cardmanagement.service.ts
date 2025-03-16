import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  successOptWithDataNoValidation,
  successOpt,
  NotFoundException,
} from '@vision/common';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { AuthService } from '../auth/auth.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { GeneralService } from '../../Core/service/general.service';
import { CardmanagementcoreService } from '../../Core/cardmanagement/cardmanagementcore.service';
import { CardService } from '../../Core/useraccount/card/card.service';
import { CardManagementReturnModel } from './func/return-list-model.func';
import { CardmanagementDto } from './dto/cardmanagement.dto';
import { switchPay } from '@vision/common/utils/PaySwitch';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { AccountService } from '../../Core/useraccount/account/account.service';
import { CardManagementUsercardDto } from './dto/cardmanagement-closeloop.dto';
import { CardDynamicPassCoreService } from '../../Core/useraccount/card/services/dynamic-pass.service';
import { dateFormatYearMonth } from '@vision/common/utils/month-diff.util';
import { GroupDetailCoreService } from '../../Core/group/services/group-detail.service';
import { SendAsanakSms } from '@vision/common/notify/sms.util';
import { GroupCoreService } from '../../Core/group/group.service';
import { MerchantCoreTerminalBalanceService } from '../../Core/merchant/services/merchant-terminal-balance.service';
import { CardChargeHistoryCoreService } from '../../Core/useraccount/card/services/card-history.service';
import { UserService } from '../../Core/useraccount/user/user.service';

@Injectable()
export class CardmanagementService {
  constructor(
    private readonly authService: AuthService,
    private readonly generalService: GeneralService,
    private readonly cardService: CardService,
    private readonly accountService: AccountService,
    private readonly OtpService: CardDynamicPassCoreService,
    private readonly cardManagementService: CardmanagementcoreService,
    private readonly groupDetailService: GroupDetailCoreService,
    private readonly groupService: GroupCoreService,
    private readonly balanceService: MerchantCoreTerminalBalanceService,
    private readonly cardHistoryService: CardChargeHistoryCoreService,
    private readonly userService: UserService
  ) {}

  async registerAll(): Promise<any> {
    const all = await this.cardManagementService.getAll();
    for (let i = 0; all.length > i; i++) {
      const resp = await this.generalService.registerCardInAsanPardakht(all[i].cardno);
      if (resp) {
        let status = false;
        if (resp.errorCode == 0 || resp.errorCode == 149) status = true;
        this.cardManagementService.updateResp(all[i], JSON.stringify(resp), status).then((res) => {
          console.log(res, ' asan pardakht response ');
        });
      }
    }
  }

  async getAllCardsList(userid: string): Promise<any> {
    const shetabCards = await this.cardManagementService.getListCards(userid);
    const myCards = await this.cardService.getAllCardsByUserid(userid);
    return this.tarnsformCardlist(CardManagementReturnModel(shetabCards, myCards));
  }

  async registerCard(getInfo: CardmanagementDto): Promise<any> {
    const cardType = switchPay(getInfo.cardno);
    console.log("yasin register card:::", getInfo)
    switch (cardType) {
      case 'closeloop': {
        return this.closeloopCardRegister(getInfo);
        break;
      }

      case 'shetab': {
        return this.shetabCardRegister(getInfo);
        break;
      }

      default:
        throw new InternalServerErrorException();
    }
  }

  private async shetabCardRegister(getInfo: CardmanagementDto): Promise<any> {
    return this.cardManagementService
      .insertCard(getInfo)
      .then((data) => {
        if (!data) throw new InternalServerErrorException();
        this.generalService.registerCardInAsanPardakht(getInfo.cardno).then((value) => {
          console.log(value);
        });

        return successOpt();
      })
      .catch((error) => {
        throw new InternalServerErrorException();
      });
  }

  private async closeloopCardRegister(getInfo: CardmanagementDto): Promise<any> {
    const cardInfo = await this.cardService.getCardInfo(getInfo.cardno);
    console.log("yasin register card info:::", cardInfo)
    if (!cardInfo) throw new UserCustomException('کارت معتبر نمی باشد', false, 500);
    if (cardInfo.user) throw new UserCustomException('کارت قبلا در سامانه ثبت شده است', false, 500);

    const userCard = await this.cardService.getCardByUserID(getInfo.user);

    if (cardInfo.secpin !== getInfo.pin) throw new UserCustomException('اطلاعات کارت وارد شده صحیح نمیباشد');

    if (cardInfo.group) {
      const gDetail = await this.groupDetailService.getDetails(cardInfo.group);
      if (gDetail) {
        if (gDetail.card.addtouser == true) {
          if (cardInfo.amount > gDetail.card.minamount) {
            const exp =
              'کارت به صورت هدیه صادر شده است و برای اضافه کردن کارت موجودی کارت باید به حداقل ' +
              gDetail.card.minamount +
              'رسیده باشد';
            throw new UserCustomException(exp);
          }
        } else {
          throw new UserCustomException('کارت فقط به صورت هدیه صادر شده است');
        }
      }
    }
    await this.cardService.unsetUserCard(getInfo.user);
    return this.cardService
      .setUser(cardInfo._id, getInfo.user)
      .then(async (res) => {
        if (!res) throw new InternalServerErrorException();
        this.groupService.getGroupByCardId(cardInfo._id).then(async (res) => {
          console.log('in group service get by card id:::::::::::', res);
          if (res) {
            const oldCardBalance = await this.balanceService.getBalanceFromCard(cardInfo._id);
            if (oldCardBalance.length > 0 && oldCardBalance[0].amount > 0) {
              const chargenew = await this.accountService.chargeAccount(
                getInfo.user,
                'discount',
                oldCardBalance[0].amount
              );
              console.log('oldBalance:::::', oldCardBalance[0].amount, 'chargeNew::::::::', chargenew);
              const terminals = await this.balanceService.bulkChangeCardUser(cardInfo._id, getInfo.user);
              console.log('balance in store card updated:::;;;', terminals);
              const cardHistory = await this.cardHistoryService.changeCardHistoryToNewCard(userCard._id, cardInfo._id);
              console.log('card history change:::::::::', cardHistory);
            }
            const useradd = await this.groupService.addUserToGroup(getInfo.user, res.group);
            console.log('userAdd:::::::::::::', useradd);

            // update fullname user by yasin
            console.log("cardownerfullname yasin:::", getInfo.cardownerfullname);
            this.userService.updateUserFullname(getInfo.user, getInfo.cardownerfullname);

            this.groupService.removeCardFromGroup(cardInfo._id).then(async (res2) => {});
          }
        });

        await this.cardService.changePasswordAdmin(getInfo.cardno, userCard.pin);

        if (cardInfo.amount > 0) {
          await this.cardService.dechargeAmount(cardInfo._id, cardInfo.amount);
          this.accountService.chargeAccount(getInfo.user, 'wallet', cardInfo.amount).then((result) => {
            const title = 'انتقال وجه از کارت ' + cardInfo.cardno;
            this.accountService.accountSetLogg(title, 'CardTrans', cardInfo.amount, true, null, getInfo.user);
          });
        }

        return successOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async deleteCard(cardno: number, userid: string): Promise<any> {
    const cardType = switchPay(cardno);

    switch (cardType) {
      case 'closeloop': {
        const userCards = await this.cardService.getAllUsersCard(userid);
        if (!userCards) throw new UserCustomException('کارت یافت نشد', false, 404);
        if (userCards.length < 2) throw new UserCustomException('مجاز به حذف این کارت نمی باشید', false, 500);
        const cardInfo = await this.cardService.getInfocard(cardno, userid);
        if (!cardInfo) throw new UserCustomException('کارت یافت نشد', false, 404);

        return this.cardService
          .unsetUserCardByCardno(cardno)
          .then((res) => {
            if (!res) throw new InternalServerErrorException();

            return successOpt();
          })
          .catch((err) => {
            throw new InternalServerErrorException();
          });
      }
      case 'shetab': {
        const cardInfo = await this.cardManagementService.getCardInfo(cardno);
        if (!cardInfo) throw new UserCustomException('کارت یافت نشد', false, 404);
        if (cardInfo.user._id != userid) throw new UserCustomException('کارت یافت نشد', false, 404);

        return this.cardManagementService
          .remove(cardno)
          .then((res) => {
            if (!res) throw new InternalServerErrorException();

            return successOpt();
          })
          .catch((err) => {
            throw new InternalServerErrorException();
          });
      }
      default:
        break;
    }
  }

  async changeStatus(getInfo: CardManagementUsercardDto, userid: string): Promise<any> {
    const cardType = switchPay(getInfo.cardno);
    if (cardType != 'closeloop') throw new UserCustomException('کارت نامعتبر', false, 400);
    return this.cardService.changeStatus(getInfo.cardno, getInfo.status, userid, getInfo.password);
  }

  async sendForgetPassword(getInfo: CardManagementUsercardDto, userid: string): Promise<any> {
    const cardType = switchPay(getInfo.cardno);
    if (cardType != 'closeloop') throw new UserCustomException('کارت نامعتبر', false, 400);

    return this.cardService.sendVerify(getInfo.cardno, userid);
  }

  async checkCode(getInfo, userid: string): Promise<any> {
    const cardType = switchPay(getInfo.cardno);
    if (cardType != 'closeloop') throw new UserCustomException('کارت نامعتبر', false, 400);

    const cardInfo = await this.cardService.getInfocard(getInfo.cardno, userid);
    if (!cardInfo) throw new UserCustomException('کارت یافت نشد', false, 400);

    if (cardInfo.code != getInfo.code) throw new UserCustomException('کد وارد شده صحیح نمی باشد', false, 500);

    return successOpt();
  }

  async getOtp(userid: string, cardno: number, useSms = false): Promise<any> {
    const info = await this.OtpService.generate(cardno, userid);
    if (!info) throw new UserCustomException('عملیات با خطا مواجه شده است', false, 500);

    const cardInfo = await this.cardService.getCardInfo(cardno);
    if (useSms) {
      if (cardInfo.user)
        if (cardInfo.user.mobile)
          SendAsanakSms(
            process.env.ASANAK_USERNAME,
            process.env.ASANAK_PASSWORD,
            process.env.ASANAK_NUMBER,
            '0' + cardInfo.user.mobile,
            `زمر دوم پویا شما ${info.pin} میباشد لطفا این رمز را در اختیار فرد دیگری قرار ندهید`
          );
    }
    return successOptWithDataNoValidation({
      otp: true,
      cardno: cardInfo.cardno,
      cvv2: cardInfo.cvv2,
      expire: dateFormatYearMonth(cardInfo.expire / 1000),
      pin: info.pin,
    });
  }

  async changePassword(getInfo: CardManagementUsercardDto, userid: string): Promise<any> {
    const cardType = switchPay(getInfo.cardno);
    if (cardType != 'closeloop') throw new UserCustomException('کارت نامعتبر', false, 400);

    return await this.cardService.changePW(getInfo.cardno, getInfo.newpassword, userid, getInfo.password);
  }

  async setPassword(getInfo, userid: string): Promise<any> {
    const cardType = switchPay(getInfo.cardno);
    if (cardType != 'closeloop') throw new UserCustomException('کارت نامعتبر', false, 400);

    const cardInfo = await this.cardService.getInfocard(getInfo.cardno, userid);
    if (!cardInfo) throw new UserCustomException('کارت معتبر نمی باشد', false, 400);

    if (cardInfo.pin) {
      if (cardInfo.code != getInfo.code) throw new UserCustomException('کد وارد شده صحیح نمی باشد', false, 500);
    }

    return await this.cardService.newActivate(getInfo.password, userid);
  }
  checkDeleteHeader(req) {
    const cardno = req.header('cardno');
    if (isEmpty(cardno)) throw new FillFieldsException();
    return cardno;
  }

  tarnsformCardlist(cardsx) {
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      cards: cardsx,
    };
  }
}
