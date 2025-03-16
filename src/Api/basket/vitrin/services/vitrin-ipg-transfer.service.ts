import { Injectable, InternalServerErrorException, successOptWithDataNoValidation } from '@vision/common';
import { IpgCoreService } from '../../../../Core/ipg/ipgcore.service';
import { VitrinIpgTransferDto } from '../dto/vitrin-ipg-transfer.dto';
import * as UniqueNumber from 'unique-number';
import { UserService } from '../../../../Core/useraccount/user/user.service';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { MipgService } from '../../../../Service/mipg/mipg.service';
import { BasketStoreCoreService } from '../../../../Core/basket/store/basket-store.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { PayIpgModel } from './pay.model';

@Injectable()
export class VitrinIpgTransferService {
  constructor(
    private readonly ipgService: IpgCoreService,
    private readonly mipgService: MipgService,
    private readonly storeService: BasketStoreCoreService,
    private readonly userService: UserService
  ) {}

  async newReq(getInfo: VitrinIpgTransferDto): Promise<any> {
    await this.checkValidate(getInfo);

    const userInfo = await this.userService.getInfoByAccountNo(getInfo.account_no);
    if (!userInfo) throw new UserNotfoundException();

    // const storeInfo = await this.storeService.getInfo(userInfo._id);
    // if (!storeInfo) throw new UserCustomException('فروشگاه یافت نشد');

    // if ( storeInfo.status === false ) throw new UserCustomException('فروشگاه غیرفعال می باشد');
    // if ( storeInfo.mipg === null || !storeInfo.mipg ) throw new UserCustomException('درگاه غیر فعال می باشد');
    // if ( storeInfo.mipg.status === false ) throw new UserCustomException('درگاه غیر فعال می باشد');

    const payload = JSON.stringify({
      user: userInfo._id,
      description: getInfo.description,
      mobile: getInfo.mobile,
      fullname: getInfo.fullname,
    });
    getInfo.callbackurl = process.env.STORE_TRANSFER_CALLBACK_URL_ADDRESS;

    const terminal = process.env.STORE_TRANSFER_TERMINAL_ID;
    const payModel = PayIpgModel(terminal, getInfo.amount, getInfo.callbackurl, payload, new Date().getTime());
    const token = await this.mipgService.validateIn(payModel);
    const log = 'ShopTrans-' + new Date().getTime();
    await this.ipgService.addAuthInfo(token.invoiceid, {
      userinvoice: log,
      user: userInfo._id,
    });
    if (token.status != true) throw new InternalServerErrorException();
    return successOptWithDataNoValidation(log);
  }

  async newPaymentReq(getInfo: VitrinIpgTransferDto, req): Promise<any> {
    await this.checkValidate(getInfo);

    const userInfo = await this.userService.getInfoByAccountNo(getInfo.account_no);
    if (!userInfo) throw new UserNotfoundException();

    const storeInfo = await this.storeService.getInfo(userInfo._id);
    if (!storeInfo) throw new UserCustomException('فروشگاه یافت نشد');

    if (storeInfo.status === false) throw new UserCustomException('فروشگاه غیرفعال می باشد');
    if (storeInfo.mipg === null || !storeInfo.mipg) throw new UserCustomException('درگاه غیر فعال می باشد');
    if (storeInfo.mipg.status === false) throw new UserCustomException('درگاه غیر فعال می باشد');

    const payModel = PayIpgModel(storeInfo.mipg.terminalid, getInfo.amount, '', '', 'ShopPay-' + new Date().getTime());
    const token = await this.mipgService.validateIn(payModel);
    return token;
  }

  private async checkValidate(getInfo: VitrinIpgTransferDto) {
    if (
      isEmpty(getInfo.account_no) ||
      isEmpty(getInfo.amount) ||
      isEmpty(getInfo.fullname) ||
      isEmpty(getInfo.description)
    )
      throw new FillFieldsException();
    if (getInfo.amount < 1000) throw new UserNotfoundException('حداقل مبلغ را رعایت فرمایید');
  }

  async makePay(terminalid, amount, callback): Promise<any> {
    const payModel = PayIpgModel(terminalid, amount, callback, '', 'ShopPay-' + new Date().getTime());
    const token = await this.mipgService.validateIn(payModel);
    return token;
  }
}
