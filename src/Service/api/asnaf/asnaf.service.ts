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
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { Sitad } from '@vision/common/utils/sitad.util';
import { ApiCheckIp } from '../function/api-check-ip.function';

@Injectable()
export class AsnafApiService {
  constructor(
    private readonly apiPermService: ApiPermCoreService,
    private readonly accountService: AccountService,
    private readonly requestService: RequestCoreService
  ) {}

  async play(username, password, idcode, req): Promise<any> {
    const state = await this.checkState(username, password);
    if (state) {
      const ips = state.ip.split(',');
      const ipcheck = ApiCheckIp(req.ip, ips);
      if (!ipcheck) {
        this.requestService.submit(username, password, req.ip, idcode, 'Invalid ip');
        throw new NotFoundException();
      }
    }
    if (!state) {
      this.requestService.submit(username, password, req.ip, idcode, 'Access Denied');
      throw new UserCustomException('متاسفانه شما دسترسی ندارید', false, 401);
    }
    if (isEmpty(idcode)) {
      this.requestService.submit(username, password, req.ip, idcode, 'Empty postalcode Field');
      throw new FillFieldsException();
    }

    const wallet = await this.accountService.getBalance(state.user, 'wallet');
    if (wallet.balance < state.asnafamount) {
      this.requestService.submit(username, password, req.ip, idcode, 'Not Enough Money');
      throw new notEnoughMoneyException();
    }

    const sitadService = new Sitad();

    const postData = await sitadService.asnaf(idcode);
    if (!postData) {
      this.requestService.submit(username, password, req.ip, idcode, 'Not Founds');
      throw new UserCustomException('یافت نشد', false, 404);
    }

    if (!postData.unitData) {
      this.requestService.submit(username, password, req.ip, idcode, 'Not Founds');
      throw new UserCustomException('یافت نشد', false, 404);
    }

    this.accountService.dechargeAccount(state.user, 'wallet', state.nahabamount).then((res) => {
      if (!res) throw new InternalServerErrorException();
      const title = 'کارمزد وب سرویس';
      this.accountService.accountSetLogg(title, 'WebServiceWage', state.nahabamount, true, state.user, null);
    });

    this.requestService.submit(username, password, req.ip, idcode, JSON.stringify(postData.unitData));
    return successOptWithDataNoValidation(postData.unitData);
  }

  private async checkState(username, password): Promise<any> {
    const info = await this.apiPermService.getInfo(username, password);
    if (!info) return false;
    if (info.asnaf === true) return info;
    return false;
  }
}
