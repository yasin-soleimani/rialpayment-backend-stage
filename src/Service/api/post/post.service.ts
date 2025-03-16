import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  successOptWithData,
  successOptWithDataNoValidation,
} from '@vision/common';
import { ApiPermCoreService } from '../../../Core/apiPerm/apiPerm.service';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { RequestCoreService } from '../../../Core/request/request.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { Sitad } from '@vision/common/utils/sitad.util';
import { ApiCheckIp } from '../function/api-check-ip.function';

@Injectable()
export class PostApiService {
  constructor(
    private readonly apiPermService: ApiPermCoreService,
    private readonly accountService: AccountService,
    private readonly requestService: RequestCoreService
  ) {}

  async play(username, password, postalcode, req): Promise<any> {
    const state = await this.checkState(username, password);
    if (state) {
      const ips = state.ip.split(',');
      const ipcheck = ApiCheckIp(req.ip, ips);
      if (!ipcheck) {
        this.requestService.submit(username, password, req.ip, postalcode, 'Invalid ip');
        throw new NotFoundException();
      }
    }
    if (!state) {
      this.requestService.submit(username, password, req.ip, postalcode, 'Access Denied');
      throw new UserCustomException('متاسفانه شما دسترسی ندارید', false, 401);
    }
    if (isEmpty(postalcode)) {
      this.requestService.submit(username, password, req.ip, postalcode, 'Empty postalcode Field');
      throw new FillFieldsException();
    }

    const wallet = await this.accountService.getBalance(state.user, 'wallet');
    if (wallet.balance < state.postamount) {
      this.requestService.submit(username, password, req.ip, postalcode, 'Not Enough Money');
      throw new notEnoughMoneyException();
    }

    const sitadService = new Sitad();

    const postData = await sitadService.post(postalcode);
    if (!postData) {
      this.requestService.submit(username, password, req.ip, postalcode, 'Not Founds');
      throw new UserCustomException('یافت نشد', false, 404);
    }

    if (!postData.address) {
      this.requestService.submit(username, password, req.ip, postalcode, 'Not Founds');
      throw new UserCustomException('یافت نشد', false, 404);
    }

    this.accountService.dechargeAccount(state.user, 'wallet', state.nahabamount).then((res) => {
      if (!res) throw new InternalServerErrorException();
      const title = 'کارمزد وب سرویس';
      this.accountService.accountSetLogg(title, 'WebServiceWage', state.nahabamount, true, state.user, null);
    });

    this.requestService.submit(username, password, req.ip, postalcode, JSON.stringify(postData.address));
    return successOptWithDataNoValidation(postData.address);
  }

  private async checkState(username, password): Promise<any> {
    const info = await this.apiPermService.getInfo(username, password);
    if (!info) return false;
    if (info.post === true) return info;
    return false;
  }
}
