import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  successOpt,
  successOptWithDataNoValidation,
} from '@vision/common';
import { MplReqApiDto } from './dto/mpl-req.dto';
import { IpgParsianMplCoreService } from '../../Core/ipg/services/parsian/parsian-mpl.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { MplVerifyApiDto } from './dto/mpl-verify.dto';
import { IpgCoreCharegService } from '../../Core/ipg/services/common/ipg-charge.service';

@Injectable()
export class MplApiService {
  constructor(
    private readonly ipgService: IpgParsianMplCoreService,
    private readonly ipgChargeService: IpgCoreCharegService
  ) {}

  async getToken(getInfo: MplReqApiDto, userid: string): Promise<any> {
    const invoiceid = new Date().getTime();
    const reqInfo = await this.ipgService.submitReq(userid, getInfo.amount, 100, invoiceid.toString());
    if (!reqInfo) throw new UserCustomException('عملیات با خطا مواجه شده است');
    if (!reqInfo.token) throw new UserCustomException('عملیات با خطا مواجه شده است');
    return successOptWithDataNoValidation(reqInfo.token);
  }

  async verify(getInfo: MplVerifyApiDto, userid: string): Promise<any> {
    const data = await this.ipgService.verify(
      getInfo.token,
      getInfo.orderid,
      null,
      getInfo.rrn,
      getInfo.pan,
      getInfo.status,
      100
    );
    if (!data) throw new NotFoundException();
    return successOpt();
  }

  async chareg(userid: string): Promise<any> {
    return this.ipgChargeService.getTodayCharge(userid);
  }
}
