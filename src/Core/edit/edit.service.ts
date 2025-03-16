import { Injectable, faildOpt, successOpt, InternalServerErrorException } from '@vision/common';
import { UserEditDto } from './dto/useredit.dto';
import { UserService } from '../useraccount/user/user.service';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { UserTransform } from '@vision/common/transform/user.transform';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { CardService } from '../useraccount/card/card.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { Sitad } from '@vision/common/utils/sitad.util';
import { switchPay } from '@vision/common/utils/PaySwitch';
import * as luhn from 'cc-luhn';
import { last } from 'rxjs/operators';
import { CardTypeEnum } from '@vision/common/enums/card-opt.enum';
import { AccountService } from '../useraccount/account/account.service';
import { GroupCoreService } from '../group/group.service';
import { MerchantCoreTerminalBalanceService } from '../merchant/services/merchant-terminal-balance.service';
import { CardChargeHistoryCoreService } from '../useraccount/card/services/card-history.service';

@Injectable()
export class EditCoreService {
  constructor(
    private readonly userService: UserService,
    private readonly cardService: CardService,
    private readonly accountService: AccountService,
    private readonly groupService: GroupCoreService,
    private readonly balanceService: MerchantCoreTerminalBalanceService,
    private readonly cardHistoryService: CardChargeHistoryCoreService
  ) {}

  async getInfo(getInfo: UserEditDto): Promise<any> {
    if (isEmpty(getInfo.id)) throw new FillFieldsException();

    const data = await this.userService.getInfoByUserid(getInfo.id);
    if (!data) throw new UserNotfoundException();
    let usergroup: any;
    if (data.usergroup && data.usergroup.group) {
      usergroup = {
        gid: data.usergroup.group._id,
        title: data.usergroup.group.title,
      };
    } else {
      usergroup = '';
    }
    // if ( isEmpty(data.ref._id ))  throw new UserCustomException('متاسفانه شما به این کاربر دسترسی ندارید');
    if (data.ref._id == getInfo.userid) {
      return UserTransform(data, usergroup);
    } else {
      throw new UserCustomException('متاسفانه شما به این کاربر دسترسی ندارید');
    }
  }

  async changeMobile(getInfo: UserEditDto): Promise<any> {
    if (isEmpty(getInfo.id) || isEmpty(getInfo.mobile)) throw new FillFieldsException();

    const userData = await this.userService.getInfoByUserid(getInfo.id);
    if (!userData) throw new UserNotfoundException();
    // if ( isEmpty(userData.ref._id ))  throw new UserCustomException('متاسفانه شما به این کاربر دسترسی ندارید');

    if (userData.ref._id == getInfo.userid) {
      const data = await this.userService.changeMobile(userData._id, getInfo.mobile);
      if (!data) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
      return successOpt();
    } else {
      throw new UserCustomException('متاسفانه شما به این کاربر دسترسی ندارید');
    }
  }

  async changeBirthdate(getInfo: UserEditDto): Promise<any> {
    console.log(getInfo, 'getInfo ');
    if (isEmpty(getInfo.id) || isEmpty(getInfo.birthdate)) throw new FillFieldsException();

    const userData = await this.userService.getInfoByUserid(getInfo.id);
    if (!userData) throw new UserNotfoundException();
    // if ( isEmpty(userData.ref._id ))  throw new UserCustomException('متاسفانه شما به این کاربر دسترسی ندارید');

    if (userData.ref._id == getInfo.userid) {
      const sitadService = new Sitad();
      const sitadInfo = await sitadService.getInfo(getInfo.nationalcode, getInfo.birthdate);
      if (isEmpty(sitadInfo.name)) throw new UserCustomException('متاسفانه اطلاعات شما معتبر نمی باشد', false, 201);

      const data = await this.userService.changeBirthdate(
        userData._id,
        getInfo.birthdate,
        sitadInfo.name + ' ' + sitadInfo.family,
        sitadInfo.officeName
      );
      if (!data) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
      return successOpt();
    } else {
      throw new UserCustomException('متاسفانه شما به این کاربر دسترسی ندارید');
    }
  }

  async changeCardNo(getInfo: UserEditDto): Promise<any> {
    if (isEmpty(getInfo.id) || isEmpty(getInfo.cardno) || isEmpty(getInfo.lastcardno)) throw new FillFieldsException();

    const userInfo = await this.userService.getInfoByUserid(getInfo.id);
    if (!userInfo) throw new UserNotfoundException();

    if (userInfo.ref._id != getInfo.userid) throw new UserCustomException('ا به این کاربر دسترسی ندارید');
    const cardInfoCard = await this.cardService.getCardInfo(getInfo.cardno);
    if (cardInfoCard.user) throw new UserCustomException('کارت قبلا در سامانه ثبت شده است', false, 500);

    const cardInfo = await this.cardService.getCardInfoByCardNoAndRefId(getInfo.cardno, getInfo.userid);
    if (switchPay(getInfo.cardno) === 'closeloop') {
      if (cardInfo) {
        return this.existCardChange(getInfo, userInfo, cardInfo);
      }
      return this.newCardChange(getInfo, userInfo);
    } else {
      throw new UserCustomException('قالب بندی کارت صحیح نمی باشد', false, 202);
    }
  }

  private async existCardChange2(getInfo: UserEditDto, userData: any, cardInfo: any): Promise<any> {
    if ((cardInfo.type = CardTypeEnum.Gift)) {
      return this.cardService.unsetUserCard(userData._id).then(async (res) => {
        this.groupService.removeCardFromGroup(cardInfo._id);
        const data = await this.cardService.changeCard(getInfo.cardno, userData._id, getInfo.userid);

        if (!data) throw new UserCustomException('عملیات با خطا مواجه شده است');
        if (data.amount && data.amount > 0) {
          this.accountService.chargeAccount(userData._id, 'wallet', data.amount).then((res) => {
            const title = 'انتقال وجه از شماره کارت ' + cardInfo.cardno;
            this.accountService.accountSetLogg(title, 'Trans', data.amount, true, null, userData._id);
            this.cardService.dechargeAmount(cardInfo._id, data.amount);
          });
        }

        return successOpt();
      });
    } else {
      throw new UserCustomException('شما به این کارت دسترسی ندارید');
    }
  }

  private async existCardChange(getInfo: UserEditDto, userData: any, cardInfo: any): Promise<any> {
    const userCard = await this.cardService.getCardByUserID(userData._id);

    if ((cardInfo.type = CardTypeEnum.Gift)) {
      return this.cardService.unsetUserCard(userData._id).then(async (res) => {
        return this.cardService
          .setUser(cardInfo._id, userData._id)
          .then(async (res) => {
            if (!res) throw new InternalServerErrorException();
            this.groupService.getGroupByCardId(cardInfo._id).then(async (res) => {
              console.log('in group service get by card id:::::::::::', res);
              if (res) {
                const oldCardBalance = await this.balanceService.getBalanceFromCard(cardInfo._id);
                if (oldCardBalance.length > 0 && oldCardBalance[0].amount > 0) {
                  const chargenew = await this.accountService.chargeAccount(
                    userData._id,
                    'discount',
                    oldCardBalance[0].amount
                  );
                  console.log('oldBalance:::::', oldCardBalance[0].amount, 'chargeNew::::::::', chargenew);
                  const terminals = await this.balanceService.bulkChangeCardUser(cardInfo._id, userData._id);
                  console.log('balance in store card updated:::;;;', terminals);
                  const cardHistory = await this.cardHistoryService.changeCardHistoryToNewCard(
                    userCard._id,
                    cardInfo._id
                  );
                  console.log('card history change:::::::::', cardHistory);
                }
                const useradd = await this.groupService.addUserToGroup(userData._id, res.group);
                console.log('userAdd:::::::::::::', useradd);

                this.groupService.removeCardFromGroup(cardInfo._id).then(async (res2) => {});
              }
            });
            if (cardInfo.amount > 0) {
              await this.cardService.dechargeAmount(cardInfo._id, cardInfo.amount);
              this.accountService.chargeAccount(userData._id, 'wallet', cardInfo.amount).then((result) => {
                const title = 'انتقال وجه از کارت ' + cardInfo.cardno;
                this.accountService.accountSetLogg(title, 'CardTrans', cardInfo.amount, true, null, userData._id);
              });
            }

            return successOpt();
          })
          .catch((err) => {
            throw new InternalServerErrorException();
          });
      });
    } else {
      throw new UserCustomException('شما به این کارت دسترسی ندارید');
    }
  }

  private async newCardChange(getInfo: UserEditDto, userData: any): Promise<any> {
    const lastCard = await this.cardService.getLastCard();
    if (lastCard.cardno < getInfo.cardno) throw new UserCustomException('شماره کارت نامعتبر');
    if (luhn(true, getInfo.cardno)) {
      const data = await this.cardService.changeCardno(userData._id, getInfo.lastcardno, getInfo.cardno);
      if (!data) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
      return successOpt();
    } else {
      throw new UserCustomException('قالب بندی کارت صحیح نمی باشد', false, 202);
    }
  }
}
