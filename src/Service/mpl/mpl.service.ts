import { Injectable, NotFoundException } from '@vision/common';
import { IpgParsianMplCoreService } from '../../Core/ipg/services/parsian/parsian-mpl.service';
import { MplDto } from './dto/mpl.dto';
import { MipgCoreService } from '../../Core/mipg/mipg.service';
import { UserService } from '../../Core/useraccount/user/user.service';
import { CardmanagementcoreService } from '../../Core/cardmanagement/cardmanagementcore.service';
import { SettingsService } from '../../Core/settings/service/settings.service';

@Injectable()
export class MplService {
  constructor(
    private readonly mplCoreService: IpgParsianMplCoreService,
    private readonly userService: UserService,
    private readonly settingsService: SettingsService,
    private readonly cardService: CardmanagementcoreService
  ) {}

  async newReq(getInfo: MplDto): Promise<any> {
    const data = await this.mplCoreService.submitReq(
      getInfo.mobile,
      getInfo.amount,
      getInfo.terminalid,
      getInfo.invoiceid,
      getInfo.hash,
      getInfo.pkg
    );
    const userInfo = await this.userService.getInfoByMobile(Number(getInfo.mobile));
    const cardsInfo = await this.cardService.getListCards(userInfo._id);
    const cards = this.cardModel(cardsInfo);
    const settings = await this.settingsService.get();
    const keyInfo = [settings.mpl.module || '', settings.mpl.exponent || ''];
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      token: data.token,
      title: data.title,
      logo: data.logo,
      data: keyInfo,
      cards: cards,
    };
  }

  async verify(getInfo: MplDto): Promise<any> {
    return this.mplCoreService.verify(
      getInfo.token,
      getInfo.orderid,
      getInfo.terminalno,
      getInfo.rrn,
      getInfo.pan,
      getInfo.status,
      getInfo.terminalid
    );
  }

  private cardModel(cards) {
    let tmp = Array();
    for (const info of cards) {
      tmp.push(info.cardno);
    }
    return tmp;
  }
}
