import { Injectable, successOptWithDataNoValidation, InternalServerErrorException, successOpt } from '@vision/common';
import { discountChangable } from '@vision/common/utils/load-package.util';
import { CoreGiftCardReportService } from '../../Core/giftCard/report/services/report.service';
import { CoreGiftCardSettingsService } from '../../Core/giftCard/settings/services/settings.service';
import { GiftCardModel } from './function/card.func';
import { ServiceGiftCardList } from './function/list.func';
import { GiftcardIpgService } from './services/ipg.service';

@Injectable()
export class GiftcardService {
  constructor(
    private readonly settingsService: CoreGiftCardSettingsService,
    private readonly reportService: CoreGiftCardReportService,
    private readonly ipgService: GiftcardIpgService
  ) {}

  async getList(): Promise<any> {
    const data = await this.settingsService.getListService();
    return successOptWithDataNoValidation(ServiceGiftCardList(data));
  }

  async setMobile(mobile: string, groupId: string): Promise<any> {
    const data = await this.reportService.submit(mobile, groupId);
    if (!data) throw new InternalServerErrorException();
    return successOpt();
  }

  async verify(mobile: string, code: string, ip: string): Promise<any> {
    const data = await this.reportService.verify(mobile, code);
    if (!data) throw new InternalServerErrorException();

    const settings = await this.settingsService.getSettingByGroupId(data.group);
    if (!settings) throw new InternalServerErrorException();
    const amount = discountChangable(settings.price, settings.discount);

    this.reportService.setTerminal(data._id, process.env.GIFT_CARD_TERMINAL, ip);
    const token = await this.ipgService.getToken(data._id, amount.amount);
    return successOptWithDataNoValidation(token);
  }

  async getDetails(id: string): Promise<any> {
    const data = await this.reportService.getInfoById(id);
    return successOptWithDataNoValidation(GiftCardModel(data));
  }

  async callback(getInfo, res): Promise<any> {
    return this.ipgService.callback(getInfo, res);
  }
}
