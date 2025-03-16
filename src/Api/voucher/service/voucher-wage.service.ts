import { Injectable } from '@vision/common';
import { UserSettingsService } from '../../../Core/settings/service/user-settings.service';
import { SettingsService } from '../../../Core/settings/service/settings.service';
import { isEmpty } from '@vision/common/utils/shared.utils';

@Injectable()
export class VoucherWageApiService {
  constructor(
    private readonly userSettingsService: UserSettingsService,
    private readonly settingsService: SettingsService
  ) {}

  async getVoucherWage(userid: string, amount: number): Promise<any> {
    let wage = 0;
    const userWageInfo = await this.userSettingsService.getUserSettings(userid);
    if (userWageInfo && !isEmpty(userWageInfo.voucher)) {
      wage = await this.userWage(userWageInfo.voucher, amount);
    } else {
      wage = await this.globalWage(amount);
    }

    if (!wage) return Math.round((0.1 * amount) / 100);
    return wage;
  }

  private async userWage(wageInfo, amount): Promise<any> {
    for (const info of wageInfo) {
      if (amount >= info.from && amount < info.to) {
        return Math.round((info.percent * amount) / 100);
      }
    }
  }

  private async globalWage(amount: number): Promise<any> {
    const wageInfo = await this.settingsService.get();
    console.log(wageInfo);
    for (const info of wageInfo.voucher) {
      if (amount >= info.from && amount < info.to) {
        return Math.round((info.percent * amount) / 100);
      }
    }
  }
}
