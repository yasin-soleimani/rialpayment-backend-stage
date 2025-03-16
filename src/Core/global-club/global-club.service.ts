import { Injectable } from '@vision/common';
import { ClubPwaService } from '../clubpwa/club-pwa.service';
import { ClubPwa } from '../clubpwa/interfaces/club-pwa.interface';
import { ClubCoreService } from '../customerclub/club.service';
import { UserService } from '../useraccount/user/user.service';
import { GlobalClubData } from './interfaces/global-club.interface';

@Injectable()
export class GlobalClubService {
  constructor(private readonly userService: UserService, private readonly clubPwaService: ClubPwaService) {}

  async getClubData(userid: string): Promise<GlobalClubData> {
    const user = await this.userService.getInfoByUserid(userid);
    let clubPwaData = null;
    if (!!user) clubPwaData = (await this.clubPwaService.getClubPwaByClubUserId(user.ref)) as ClubPwa;

    if (!clubPwaData) {
      return {
        clubName: 'ریال پیمنت',
        clubSubdomain: 'https://app.rialpayment.ir',
        pwa: 'https://pwa.rialpayment.ir/',
        androidApp: 'https://core-backend.rialpayment.ir/upload/apps/rialpayment.apk',
        clubFound: false,
        tel: '09363677791',
      };
    }
    const subdomain = clubPwaData.referer.split('/')[2].split('.')[0];

    return {
      clubName: clubPwaData.manifestName,
      clubSubdomain: subdomain,
      clubFound: true,
      androidApp: 'https://core-backend.rialpayment.ir/upload/apps/' + subdomain + '.apk',
      pwa: clubPwaData.referer,
      tel: clubPwaData?.customerClub?.clubinfo?.tell?.toString().startsWith('0')
        ? clubPwaData?.customerClub?.clubinfo?.tell?.toString()
        : `0${clubPwaData?.customerClub?.clubinfo?.tell}`,
    };
  }
}
