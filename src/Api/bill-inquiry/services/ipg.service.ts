import { Injectable, InternalServerErrorException, successOptWithDataNoValidation } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { PayIpgModel } from '../../../Api/basket/vitrin/services/pay.model';
import { MipgService } from '../../../Service/mipg/mipg.service';

@Injectable()
export class BillInquiryIpgApiService {
  constructor(
    private readonly mipgService: MipgService,
    private readonly accountService: AccountService
  ) { }

  async getTokenIpg(billInfo, userid: string, devicetype: string): Promise<any> {
    return this.getTokenUserMode(billInfo, userid, devicetype);
  }

  private async getTokenUserMode(billInfo, userid: string, devicetype): Promise<any> {
    const payload = JSON.stringify({
      billDbId: billInfo._id,
      billId: billInfo.billid,
      userId: billInfo.user,
      type: billInfo.type,
      amount: billInfo.amount,
      devicetype,
    });

    const wallet = await this.accountService.getBalance(userid, 'wallet');
    const remain = Number(billInfo.amount) - wallet.balance;
    const ipgModel = PayIpgModel(
      process.env.BILL_INQUIRY_IPG,
      remain,
      process.env.BILL_INQUIRY_CALLBACK,
      payload,
      'Charge-' + new Date().getTime(),
      true
    );
    const data = await this.mipgService.validateIn(ipgModel);
    if (!data.invoiceid) throw new UserCustomException('شارژ با خطا مواجه شده است');
    return data.invoiceid;
  }
}
