import { Injectable, NotFoundException, successOptWithDataNoValidation } from '@vision/common';
import { ClubPwaService } from '../../Core/clubpwa/club-pwa.service';
import { UserApiService } from './userapi.service';

@Injectable()
export class AuthClubDataService {
  constructor(private readonly clubPwaService: ClubPwaService, private readonly userApiService: UserApiService) {}

  async getClubLogoByReferer(referer: string): Promise<any> {
    const clubPwa = await this.clubPwaService.getClubPwaByReferer(referer);
    if (!clubPwa) {
      throw new NotFoundException('باشگاه یافت نشد.');
    }
    const ref = clubPwa.clubUser;
    const { logo } = await this.userApiService.getClubInfo(ref);
    return { ...successOptWithDataNoValidation(logo), faqs: clubPwa.faqs };
  }

  async getClubQrData(userid: string): Promise<any> {
    const clubPwa = await this.clubPwaService.getClubPwaByClubUserId(userid);
    if (!clubPwa) {
      throw new NotFoundException('باشگاه یافت نشد');
    }
    const subdomain = clubPwa.referer.split('/')[2].split('.')[0];
    const data = {
      apk: 'https://core-backend.rialpayment.ir/upload/apps/' + subdomain + '.apk',
      pwa: clubPwa.referer,
    };
    return successOptWithDataNoValidation(data);
  }
}
