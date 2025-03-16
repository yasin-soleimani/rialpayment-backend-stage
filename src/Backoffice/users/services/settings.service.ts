import { Injectable, successOptWithDataNoValidation, InternalServerErrorException, successOpt } from '@vision/common';
import { UserSettingsService } from '../../../Core/settings/service/user-settings.service';
import { BackofficeUsersSettingsCashout } from '../dto/users-settings-cashout.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';

@Injectable()
export class BackofficeUsersSettingsService {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  async getUserCashoutDetails(userid: string): Promise<any> {
    const userInfo = await this.userSettingsService.getUserSettings(userid);
    if (!userInfo || !userInfo.cashout) {
      return successOptWithDataNoValidation({
        status: false,
        range: [],
      });
    }

    return successOptWithDataNoValidation(userInfo.cashout);
  }

  async submitUserCashoutDetails(getInfo: BackofficeUsersSettingsCashout, userid: string): Promise<any> {
    delete getInfo.id;
    return this.userSettingsService
      .updateUserSettings(userid, getInfo)
      .then((res) => {
        if (!res) throw new InternalServerErrorException();

        return successOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async changeStatus(userid: string, status: boolean): Promise<any> {
    if (isEmpty(userid)) throw new FillFieldsException();

    return this.userSettingsService
      .changeStatus(userid, status)
      .then((res) => {
        if (!res) throw new InternalServerErrorException();

        return successOpt();
      })
      .catch((err) => {
        console.log(err);
        throw new InternalServerErrorException();
      });
  }
}
