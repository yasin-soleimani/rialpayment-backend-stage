import { Injectable, successOptWithDataNoValidation, NotFoundException, successOpt } from '@vision/common';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { CheckoutAutomaticDto } from './dto/checkout-automatic.dto';
import { CheckoutAutomaticService } from '../../Core/checkout/automatic/checkout-automatic.service';
import { GroupProjectCoreService } from '../../Core/group-project/group-project.service';
import { CheckoutBanksApiReturnModel } from './func/checkout-banks.func';
import { CheckoutCoreService } from '../../Core/checkout/checkout/checkoutcore.service';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly checkoutAutomaticService: CheckoutAutomaticService,
    private readonly groupProjectService: GroupProjectCoreService,
    private readonly checkoutCoreService: CheckoutCoreService
  ) {}

  async successTransform() {
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
    };
  }

  async listTransform(instatx, shaparakx) {
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      instant: instatx,
      shaparak: shaparakx,
    };
  }

  checkDeleteHeader(req) {
    const account = req.header('account');
    if (isEmpty(account)) throw new FillFieldsException();
    return account;
  }

  async submitNewAutomatic(getInfo: CheckoutAutomaticDto, userid: string): Promise<any> {
    getInfo.user = userid;
    return this.checkoutAutomaticService.addNew(getInfo);
  }

  // async getList( userid: string ): Promise<any> {
  //   const data = await this.checkoutAutomaticService.getInfo( userid );
  //   if ( data ) {
  //     const acc = {
  //       id: data.account._id,
  //       bankname : '( ' + data.account.bankname + ' ) ' + data.account.account
  //     }
  //     data.account = acc;
  //   }
  //   return successOptWithDataNoValidation( data );
  // }

  // async remove( userid: string ): Promise<any> {
  //   const data = await this.checkoutAutomaticService.remove( userid );
  //   if ( !data ) throw new NotFoundException();
  //   return successOpt();
  // }

  async getUserCheckOutInfo(userid: string): Promise<any> {
    return this.groupProjectService.getUserInfo(userid);
  }

  async banks(userid: string): Promise<any> {
    let data = await this.groupProjectService.getUserInfo(userid);
    if (!data) {
      data = await this.groupProjectService.getInfoByCode('common');
    }

    const instant = await this.checkoutCoreService.getListInstant(userid);
    const shaparak = await this.checkoutCoreService.getListShaparak(userid);
    return successOptWithDataNoValidation(CheckoutBanksApiReturnModel(data, instant, shaparak));
  }
}
