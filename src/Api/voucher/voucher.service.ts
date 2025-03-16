import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  successOpt,
  successOptWithDataNoValidation,
  successOptWithPagination,
} from '@vision/common';
import { SafevoucherCoreService } from '../../Core/safevoucher/safevoucher.service';
import { VoucherApiDto } from './dto/voucher.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { AccountService } from '../../Core/useraccount/account/account.service';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { returnVoucherListModel } from './component/return.model';
import { VoucherWageApiService } from './service/voucher-wage.service';
import { CardService } from '../../Core/useraccount/card/card.service';
import { VoucherSearchDto } from './dto/voucher-search.dto';
import { VoucherApiSearchQueryBuilder } from './component/query-builder.component';
import * as sha256 from 'sha256';
import { UserService } from '../../Core/useraccount/user/user.service';
import { AccountBlockService } from '../../Core/useraccount/account/services/account-block.service';

@Injectable()
export class VoucherApiService {
  constructor(
    private readonly voucherService: SafevoucherCoreService,
    private readonly cardService: CardService,
    private readonly wageService: VoucherWageApiService,
    private readonly accountBlockService: AccountBlockService,
    private readonly accountService: AccountService,
    private readonly userService: UserService
  ) {}

  async makeIt(getInfo: VoucherApiDto, userid: string): Promise<any> {
    if (isEmpty(getInfo.amount) || isEmpty(getInfo.pin) || getInfo.pin < 1 || getInfo.amount < 1)
      throw new FillFieldsException();

    const userInfo = await this.userService.getInfoByUserid(userid);
    if (!userInfo) throw new BadRequestException();

    if (isEmpty(userInfo.fullname) || userInfo.block === true || userInfo.checkout === false)
      throw new UserCustomException('شما مجاز به انجام تراکنش نمی باشید');

    if (Number(getInfo.amount) < 100000) throw new UserCustomException('مبلغ نامعتبر');

    const wallet = await this.accountService.getBalance(userid, 'wallet');
    // if ( wallet.balance < Number(getInfo.amount)) throw new notEnoughMoneyException();
    const todayCharge = await this.accountService.getTodayCharge(userid);
    const blocked = await this.accountBlockService.getBlock(userid);
    let todayAmount,
      blockAmount = 0;
    if (blocked.length > 0) blockAmount = blocked[0].total;
    if (!isEmpty(todayCharge)) todayAmount = todayCharge[0].total;
    const cashoutable = wallet.balance - todayAmount - blockAmount;
    if (getInfo.amount > cashoutable) throw new UserCustomException('موجودی ناکافی', false, 701);

    const cardInfo = await this.cardService.getCardByUserID(userid);
    if (!cardInfo) throw new InternalServerErrorException('کاربر نامعتبر');

    const cardPin = sha256(cardInfo.pin);
    if (cardPin != getInfo.cardpin) throw new UserCustomException('شماره پین کارت اشتباه می باشد');

    const wage = await this.wageService.getVoucherWage(userid, Number(getInfo.amount));
    const total = Number(getInfo.amount) + wage;
    if (wallet.balance < total) throw new UserCustomException('موجودی کافی نمیباشد');

    await this.accountService.dechargeAccount(userid, 'wallet', total).then((res) => {
      const title = 'ساخت ووچر';
      this.accountService.accountSetLogg(title, 'SafeVoucher', getInfo.amount, true, userid, null);
      if (wage > 0) {
        const titlex = 'کارمزد ساخت ووچر';
        this.accountService.accountSetLogg(titlex, 'SafeVoucherWage', wage, true, userid, null);
      }
    });

    return this.voucherService
      .newVoucher(userid, getInfo.amount, getInfo.pin)
      .then((res) => {
        return successOptWithDataNoValidation({
          amount: res.amount,
          pin: res.pin,
          key: res.key,
          wage: 0,
          id: res.id,
        });
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async getUsedList(getInfo: VoucherSearchDto, userid: string, page: number): Promise<any> {
    const query = VoucherApiSearchQueryBuilder(userid, getInfo);
    const data = await this.voucherService.getUsedList(query, page);
    data.docs = returnVoucherListModel(data.docs, Number(getInfo.type));
    return successOptWithPagination(data);
  }

  // async getList( userid: string, page: number ): Promise<any> {
  //   const data = await this.voucherService.getList( userid, page );
  //   data.docs = returnVoucherListModel( data.docs, g);
  //   return successOptWithPagination( data );
  // }

  async use(getInfo: VoucherApiDto, userid: string): Promise<any> {
    getInfo.id = getInfo.id.trim();
    const data = await this.voucherService.find(getInfo.id);
    if (!data) throw new UserCustomException('ووچر یافت نشد', false, 404);
    if (data.type === 0) throw new UserCustomException('ووچر معلق شده است');
    if (data.type === -1) throw new UserCustomException('موقتا مسدود می باشد');
    if (data.pin != Number(getInfo.pin)) throw new UserCustomException('پین اشتباه می باشد', false, 402);
    if (data.key != Number(getInfo.key)) throw new UserCustomException('کلید اشتباه می باشد', false, 403);
    if (data.to) throw new UserCustomException('ووچر نامعتبر', false, 404);

    const wage = await this.wageService.getVoucherWage(userid, Number(data.mod));
    const total = Number(data.mod) - wage;

    if (total < 1) throw new UserCustomException('موجودی کافی نمیباشد');

    await this.voucherService.use(userid, getInfo.id, Number(total));

    return this.accountService.chargeAccount(userid, 'wallet', Number(total)).then((res) => {
      const title = 'شارژ کیف پول با شماره ووچر ' + data.id;
      this.accountService.accountSetLogg(title, 'SafeVoucher', Number(total), true, null, userid);
      if (wage > 0) {
        const titlex = 'کارمزد ووچر';
        this.accountService.accountSetLogg(titlex, 'SafeVoucherWage', Number(wage), true, userid, null);
      }
      return successOpt();
    });
  }

  async update(): Promise<any> {
    return this.voucherService.update();
  }

  async updateMod(): Promise<any> {
    return this.voucherService.updateMod();
  }
}
