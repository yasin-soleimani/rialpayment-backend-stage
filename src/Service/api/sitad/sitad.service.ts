import { Injectable, Inject, NotFoundException } from '@vision/common';
import { SitadApiDto } from './dto/sitad-api.dto';
import { ApiPermCoreService } from '../../../Core/apiPerm/apiPerm.service';
import { SitadCoreService } from '../../../Core/sitad/sitad.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { Sitad } from '@vision/common/utils/sitad.util';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { ApiCheckIp } from '../function/api-check-ip.function';

@Injectable()
export class SitadApiService {
  constructor(
    private readonly apiPerm: ApiPermCoreService,
    private readonly sitadCore: SitadCoreService,
    private readonly apiPermService: ApiPermCoreService,
    private readonly accountService: AccountService
  ) {}

  async getInformation(getInfo: SitadApiDto, username, password, req): Promise<any> {
    const state = await this.checkState(username, password);
    if (state) {
      const ips = state.ip.split(',');
      const ipcheck = ApiCheckIp(req.ip, ips);
      if (!ipcheck) throw new NotFoundException();
    }
    if (!state) throw new UserCustomException('متاسفانه شما دسترسی ندارید', false, 401);
    const sitadService = new Sitad();
    if (!isEmpty(getInfo.nationalCode) && !isEmpty(getInfo.simNumber)) {
      if (state.shahkar == false) throw new NotFoundException();

      const dataUser = await sitadService.shahkar(getInfo.simNumber, getInfo.nationalCode);
      if (!dataUser) return this.optMessage(404, false, 'متاسفانه یافت نشد', null);
      if (state.authamount > 0) {
        const wallet = await this.accountService.getBalance(state.user, 'wallet');
        if (wallet.balance < state.authamount) throw new notEnoughMoneyException();
        this.accountService.dechargeAccount(state.user, 'wallet', state.authamount).then((res) => {
          const title = 'کارمزد وب سرویس';
          this.accountService.accountSetLogg(title, 'WebServiceWage', state.authamount, true, state.user, null);
        });
      }
      const hisData = this.ReqHis(state.user, JSON.stringify(getInfo), JSON.stringify(dataUser));
      this.sitadCore.submitReq(hisData);
      return this.optMessage(200, true, 'عملیات با موفقیت انجام شد', dataUser);
    }

    if (!isEmpty(getInfo.nationalcode) && !isEmpty(getInfo.birthdate)) {
      if (state.sitad == false) throw new NotFoundException();

      const dataUser = await sitadService.getInfo(getInfo.nationalcode, getInfo.birthdate);
      if (!dataUser) return this.optMessage(404, false, 'متاسفانه یافت نشد', null);
      const dataTrans = this.infoTransform(dataUser);
      if (state.authamount > 0) {
        const wallet = await this.accountService.getBalance(state.user, 'wallet');
        if (wallet.balance < state.authamount) throw new notEnoughMoneyException();
        this.accountService.dechargeAccount(state.user, 'wallet', state.authamount).then((res) => {
          const title = 'کارمزد وب سرویس';
          this.accountService.accountSetLogg(title, 'WebServiceWage', state.authamount, true, state.user, null);
        });
      }
      const hisData = this.ReqHis(state.user, JSON.stringify(getInfo), JSON.stringify(dataTrans));
      this.sitadCore.submitReq(hisData);
      return this.optMessage(200, true, 'عملیات با موفقیت انجام شد', dataTrans);
    }
  }

  private async checkState(username, password): Promise<any> {
    const info = await this.apiPermService.getInfo(username, password);
    if (!info) return false;
    return info;
  }

  private ReqHis(user, req, res) {
    return {
      user: user,
      req: req,
      res: res,
    };
  }

  private infoTransform(data) {
    return {
      birthDate: data.birthDate,
      bookNo: data.bookNo,
      bookRow: data.bookRow,
      deathStatus: data.deathStatus,
      family: data.family,
      fatherName: data.fatherName,
      gender: data.gender,
      name: data.name,
      nin: data.nin,
      officeCode: data.officeCode,
      officeName: data.officeName,
      shenasnameNo: data.shenasnameNo,
      shenasnameSeri: data.shenasnameSeri,
      shenasnameSerial: data.shenasnameSerial,
    };
  }

  private optMessage(status: number, success: boolean, message: string, datax: any) {
    return {
      status: status,
      success: success,
      message: message,
      data: datax,
    };
  }
}
