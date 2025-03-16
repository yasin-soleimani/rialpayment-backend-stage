import { Injectable, successOpt, successOptWithDataNoValidation } from '@vision/common';
import { SettingsUserDeveloperService } from '../../Core/settings/service/developer-settings.service';
import { DeveloperApiDto } from './dto/developer.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { developerReplacer } from './func/developer.func';
import { AuthorizeUserzCoreService } from '../../Core/authorize/user/user.service';
import { developerAuthorizeModel } from './func/authorize.func';

@Injectable()
export class DeveloperApiService {
  constructor(
    private readonly developerSettingsService: SettingsUserDeveloperService,
    private readonly authUserService: AuthorizeUserzCoreService
  ) {}

  async addCallback(getInfo: DeveloperApiDto): Promise<any> {
    return this.developerSettingsService
      .addNewCallback(getInfo.url, getInfo.status, getInfo.userid)
      .then((res) => {
        if (!res) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
        return successOpt();
      })
      .catch((err) => {
        throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
      });
  }

  async getCallbackInfo(userid: string): Promise<any> {
    const data = await this.developerSettingsService.getInfo(userid);
    const auth = await this.authUserService.getList(userid);
    return successOptWithDataNoValidation(developerReplacer(data, developerAuthorizeModel(auth)));
  }
}
