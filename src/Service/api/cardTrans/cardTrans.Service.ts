import { Injectable, successOptWithDataNoValidation, InternalServerErrorException } from '@vision/common';
import { CardTransServiceDto } from './dto/carstrans.dto';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { CardTransServiceConsts } from './const/card-trans.const';
import { CardDynamicPassCoreService } from '../../../Core/useraccount/card/services/dynamic-pass.service';
import { DynamicPinConsts } from '@vision/common/constants/dynamic-pin.const';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { AccountBlockService } from '../../../Core/useraccount/account/services/account-block.service';
import { CardTransferCoreService } from '../../../Core/useraccount/card/services/cardTransfer.service';

@Injectable()
export class CardTransService {
  constructor(
    private readonly cardService: CardService,
    private readonly optService: CardDynamicPassCoreService,
    private readonly accountService: AccountService,
    private readonly accountBlockService: AccountBlockService,
    private readonly cardTransferService: CardTransferCoreService
  ) {}

  async getInfo(getInfo: CardTransServiceDto): Promise<any> {
    const destCardInfo = await this.cardService.getCardInfo(getInfo.destination_pan);
    if (!destCardInfo)
      throw new UserCustomException(
        CardTransServiceConsts.Invalid_Destination.message,
        false,
        CardTransServiceConsts.Invalid_Destination.code
      );

    if (!destCardInfo.user) throw new UserCustomException('کارت نامعتبر', false, 400);

    const cardInfo = await this.cardService.getCardInfo(getInfo.pan);
    if (!cardInfo.user) throw new UserCustomException('کارت نامعتبر', false, 400);

    await this.checkOpt(getInfo);

    await this.checkBalance(cardInfo.user._id, getInfo.amount);

    if (getInfo.cvv2 != cardInfo.cvv2) throw new UserCustomException('کارت نامعتبر', false, 400);

    const cardTransData = await this.cardTransferService.addCardInfo(
      getInfo.pan,
      getInfo.pin,
      getInfo.cvv2,
      getInfo.expire,
      getInfo.amount,
      getInfo.destination_pan,
      cardInfo.user._id,
      destCardInfo.user._id
    );

    return successOptWithDataNoValidation({
      id: cardTransData._id,
      fullname: destCardInfo.user.fullname,
      amount: getInfo.amount,
    });
  }

  private async checkOpt(getInfo: CardTransServiceDto): Promise<any> {
    const optInfo = await this.optService.checkPin(getInfo.pan, getInfo.pin);
    if (!optInfo)
      throw new UserCustomException(
        CardTransServiceConsts.Invalid_Pan.message,
        false,
        CardTransServiceConsts.Invalid_Pan.code
      );

    if (optInfo.code == DynamicPinConsts.cardFound)
      throw new UserCustomException(
        CardTransServiceConsts.Not_Found.message,
        false,
        CardTransServiceConsts.Not_Found.code
      );

    if (optInfo.code == DynamicPinConsts.expired)
      throw new UserCustomException(
        CardTransServiceConsts.Invalid_Pin.message,
        false,
        CardTransServiceConsts.Invalid_Pin.code
      );

    if (optInfo.code == DynamicPinConsts.invalidPin)
      throw new UserCustomException(
        CardTransServiceConsts.Invalid_Pin.message,
        false,
        CardTransServiceConsts.Invalid_Pin.code
      );

    if (optInfo.code == DynamicPinConsts.success) return true;
  }

  private async checkBalance(cardHolderId: string, amount: number): Promise<any> {
    const account = await this.accountService.getWallet(cardHolderId);
    const todayCharge = await this.accountService.getTodayCharge(cardHolderId);
    const blocked = await this.accountBlockService.getBlock(cardHolderId);
    let todayAmount,
      blockAmount = 0;
    if (!isEmpty(todayCharge)) todayAmount = todayCharge[0].total;
    if (blocked.length > 0) blockAmount = blocked[0].total;
    const cashoutable = account.balance - todayAmount - blockAmount;
    if (amount > cashoutable)
      throw new UserCustomException(
        CardTransServiceConsts.Invalid_Pin.message,
        false,
        CardTransServiceConsts.Invalid_Pin.code
      );
  }

  async getTransaction(id: string): Promise<any> {
    const transData = await this.cardTransferService.getInfoById(id);
    if (!transData) throw new UserCustomException('تراکنش نامعتبر', false, 500);

    if (transData.success == true) throw new UserCustomException('تراکنش نامعتبر', false, 500);

    await this.checkBalance(transData.source_user, transData.amount);

    const deUser = await this.accountService.dechargeAccount(transData.source_user, 'wallet', transData.amount);
    if (!deUser) throw new InternalServerErrorException();

    const chargeUser = await this.accountService.chargeAccount(transData.destination_user, 'wallet', transData.amount);
    if (!chargeUser) {
      await this.accountService.chargeAccount(transData.source_user, 'wallet', transData.amount);
      throw new InternalServerErrorException();
    }

    const title = 'انتقال وجه از شماره کارت ' + transData.pan + ' به شماره کارت ' + transData.destination_pan;
    const log = await this.accountService.accountSetLogg(
      title,
      'CardTrans',
      transData.amount,
      true,
      transData.source_user,
      transData.destination_user
    );

    return successOptWithDataNoValidation({
      ref: log.ref,
      amount: transData.amount,
      createdAt: log.createdAt,
    });
  }
}
