import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  successOptWithDataNoValidation,
} from '@vision/common';
import { ApiPermCoreService } from '../../../Core/apiPerm/apiPerm.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { nahabRequest } from '@vision/common/nahab/request';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { RequestCoreService } from '../../../Core/request/request.service';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { IzbankService } from '@vision/common/izbank/izbank.service';
import { ApiCheckIp } from '../function/api-check-ip.function';

@Injectable()
export class NahabService {
  constructor(
    private readonly apiPermService: ApiPermCoreService,
    private readonly accountService: AccountService,
    private readonly requestService: RequestCoreService
  ) {}

  async getInfo(pan, username, password, req): Promise<any> {
    const state = await this.checkState(username, password);
    if (state) {
      this.requestService.submit(username, password, req.ip, pan, 'Invalid ip');
      const ips = state.ip.split(',');
      const ipcheck = ApiCheckIp(req.ip, ips);
      if (!ipcheck) throw new NotFoundException();
    }
    if (!state) {
      this.requestService.submit(username, password, req.ip, pan, 'Access Denied');
      throw new UserCustomException('متاسفانه شما دسترسی ندارید', false, 401);
    }
    if (isEmpty(pan)) {
      this.requestService.submit(username, password, req.ip, pan, 'Empty pan Field');
      throw new FillFieldsException();
    }

    const wallet = await this.accountService.getBalance(state.user, 'wallet');
    if (wallet.balance < state.nahabamount) {
      this.requestService.submit(username, password, req.ip, pan, 'Not Enough Money');
      throw new notEnoughMoneyException();
    }
    const data = await nahabRequest(pan);
    await this.resultChecker(username, password, req.ip, pan, data.resultCode);

    if (data.resultCode === 0 || data.resultCode === 5004) {
      const reData = await this.accountService
        .dechargeAccount(state.user, 'wallet', state.nahabamount)
        .then(async (res) => {
          if (!res) throw new InternalServerErrorException();
          const title = 'کارمزد وب سرویس';
          this.accountService.accountSetLogg(title, 'WebServiceWage', state.nahabamount, true, state.user, null);
          const izBank = new IzbankService();
          const bankInfo = await izBank.getCardInfo(pan);
          const xfact = {
            nationalCode: data.nationalCode,
            responseId: data.responseId,
            resultCode: data.resultCode,
            resultMessage: data.resultMessage,
            resultDetail: data.resultDetail,
            firstname: bankInfo.first_name,
            lastname: bankInfo.last_name,
          };
          return xfact;
        });

      this.requestService.submit(username, password, req.ip, pan, JSON.stringify(data));
      return successOptWithDataNoValidation(reData);
    }
    if (data.resultCode === 5004) {
      this.requestService.submit(username, password, req.ip, pan, '5004 - Data Not Found');
      throw new UserCustomException('یافت نشد', false, 404);
    }
  }

  private async resultChecker(username, password, ip, pan, code): Promise<any> {
    switch (code) {
      case 5001: {
        this.requestService.submit(username, password, ip, pan, '5001 - Internal system error');
        throw new InternalServerErrorException();
        break;
      }

      case 5002: {
        this.requestService.submit(username, password, ip, pan, '5002 - invalid api key');
        throw new UserCustomException('کلید امنیتی سرویس صحیح نیست', false, 5002);
        break;
      }

      case 5003: {
        this.requestService.submit(username, password, ip, pan, '5003 - Api user is disabled');
        throw new UserCustomException('سرویس در حال حاضر در دسترسی نمی باشد', false, 5003);
        break;
      }

      case 5005: {
        this.requestService.submit(username, password, ip, pan, '5005 - Invalid input data');
        throw new UserCustomException('دیتای ورودی فورمت صحیح ندارد', false, 5005);
        break;
      }

      case 5007: {
        this.requestService.submit(username, password, ip, pan, '5005 - External Service is unavailable');
        throw new UserCustomException('سرویس در حال حاضر در دسترسی نمی باشد', false, 5003);
        break;
      }

      case 5010: {
        this.requestService.submit(username, password, ip, pan, '5010 - Unknown operation');
        throw new UserCustomException('سرویس در حال حاضر در دسترسی نمی باشد', false, 5003);
        break;
      }

      case 5014: {
        this.requestService.submit(username, password, ip, pan, '5010 - Invalid Ip');
        throw new UserCustomException('سرویس در حال حاضر در دسترسی نمی باشد', false, 5003);
        break;
      }

      case 5021: {
        this.requestService.submit(username, password, ip, pan, '5021 - Access Denied ');
        throw new UserCustomException('سرویس در حال حاضر در دسترسی نمی باشد', false, 5003);
        break;
      }
    }
  }

  private async checkState(username, password): Promise<any> {
    const info = await this.apiPermService.getInfo(username, password);
    if (!info) return false;
    if (info.nahab === true) return info;
    return false;
  }
}
