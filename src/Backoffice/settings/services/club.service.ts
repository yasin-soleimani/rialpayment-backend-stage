import { Injectable, successOpt } from '@vision/common';
import { ClubSettingsCoreService } from '../../../Core/settings/service/club-settings.service';
import { SettingsClubDto } from '../dto/club-settings.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class SettingsClubService {
  constructor(private readonly clubService: ClubSettingsCoreService) {}

  async udpateSettings(getInfo: SettingsClubDto): Promise<any> {
    const data = await this.clubService.update(getInfo);
    if (!data) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
    return successOpt();
  }
}
