import { Model } from 'mongoose';
import { Injectable, Inject } from '@vision/common';
import { CheckoutCoreDto } from './dto/checkoutcore.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { CheckoutService } from '../../../Api/checkout/checkout.service';
import * as Sheba from 'iran-sheba';
import { BanksCoreService } from '../../../Core/banks/banks.service';

@Injectable()
export class CheckoutCoreService {
  constructor(
    @Inject('CheckoutModel') private readonly checkoutModel: any,
    private readonly bankService: BanksCoreService
  ) {}

  private async create(checkoutDto: CheckoutCoreDto): Promise<any> {
    const insertCheckout = new this.checkoutModel(checkoutDto);
    return await insertCheckout.save();
  }

  private async getList(userid: string): Promise<any> {
    return await this.checkoutModel.find({ user: userid }).select({ account: 1, bankname: 1, type: 1 }).exec();
  }

  async getInfo(accountx, userid): Promise<any> {
    const query = { $and: [{ account: accountx }, { user: userid }] };
    return await this.checkoutModel.findOne(query).exec();
  }
  async getListInstant(userid: string): Promise<any> {
    return await this.checkoutModel
      .find({ user: userid, type: 1 })
      .select({ account: 1, bankname: 1, bankcode: 1, type: 1 })
      .exec();
  }

  async getListShaparak(userid: string): Promise<any> {
    return await this.checkoutModel.find({ user: userid, type: 2 }).select({ account: 1, bankname: 1, type: 1 }).exec();
  }
  private async delete(accountx: string, userid: string): Promise<any> {
    return await this.checkoutModel.findOneAndRemove({ $and: [{ account: accountx }, { user: userid }] }).exec();
  }

  private async update(checkoutDto: CheckoutCoreDto): Promise<any> {
    const query = { $and: [{ account: checkoutDto.preaccount }, { user: checkoutDto.user }] };
    return await this.checkoutModel.findOneAndUpdate(query, checkoutDto);
  }

  async insertCheckout(checkoutDto: CheckoutCoreDto): Promise<any> {
    if (
      isEmpty(checkoutDto.account) ||
      isEmpty(checkoutDto.user) ||
      isEmpty(checkoutDto.type) ||
      isEmpty(checkoutDto.bankcode)
    )
      throw new FillFieldsException();
    if (checkoutDto.type == 2) {
      const sheba = await this.getBankname(checkoutDto);
      checkoutDto.bankname = sheba.persianName;
      checkoutDto.bankcode = 1;
    } else {
      const bankInfo = await this.bankService.getInfoByCode(checkoutDto.bankcode);
      if (!bankInfo) throw new UserCustomException('بانک یافت نشد', false, 404);
      if (bankInfo.status == false) throw new UserCustomException('بانک مدنظر غیر فعالی می باشد', false, 404);
      checkoutDto.bankname = bankInfo.title;
    }
    return await this.create(checkoutDto);
  }

  async list(userid): Promise<any> {
    if (isEmpty(userid)) throw new FillFieldsException();
    return await this.getList(userid);
  }

  async deleteItem(account, userid): Promise<any> {
    if (isEmpty(account) || isEmpty(userid)) throw new FillFieldsException();
    return await this.delete(account, userid);
  }

  async updateItem(checkoutDto: CheckoutCoreDto): Promise<any> {
    if (isEmpty(checkoutDto.account) || isEmpty(checkoutDto.user) || isEmpty(checkoutDto.preaccount))
      throw new FillFieldsException();
    if (checkoutDto.type == 2) {
      const sheba = await this.getBankname(checkoutDto);
      checkoutDto.bankname = sheba.persianName;
    }
    return await this.update(checkoutDto);
  }

  async getBankname(checkoutDto: CheckoutCoreDto): Promise<any> {
    if (Sheba.isValid(checkoutDto.account)) {
      return Sheba.recognize(checkoutDto.account);
    } else {
      throw new UserCustomException('شماره شبا صحیح نمی باشد');
    }
  }
}
