import { Injectable, InternalServerErrorException, successOpt } from '@vision/common';
import { IpgParsianMplCoreService } from '../../../Core/ipg/services/parsian/parsian-mpl.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { IpgCoreService } from '../../../Core/ipg/ipgcore.service';
import { AccountService } from '../../../Core/useraccount/account/account.service';

@Injectable()
export class MplSdkService {
  constructor(
    private readonly mplService: IpgParsianMplCoreService,
    private readonly ipgService: IpgCoreService,
    private readonly accountService: AccountService
  ) {}

  async getCharge(getInfo, userid): Promise<any> {
    const payInfo = await this.mplService.getTransInfo(getInfo.terminalid, getInfo.invoiceid);
    if (!payInfo) throw new UserCustomException('تراکنش یافت نشد', false, 404);

    return this.ipgService
      .verify(payInfo.terminalid, payInfo.userinvoice)
      .then((result) => {
        if (!result) throw new InternalServerErrorException();
        if (result.status != 0) throw new UserCustomException(result.message, false, 500);

        return this.mplService
          .submitUserTrax(userid, payInfo.total, payInfo.invoiceid, payInfo.userinvoice, payInfo.ref, payInfo.details)
          .then((res) => {
            if (!res) throw new InternalServerErrorException();

            this.accountService.chargeAccount(userid, 'wallet', payInfo.total);
            this.accountService.accountSetLoggWithRef(
              'شارژ کیف پول',
              payInfo.userinvoice,
              payInfo.total,
              true,
              null,
              userid
            );

            return successOpt();
          })
          .catch((err) => {
            throw new InternalServerErrorException();
          });
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }
}
