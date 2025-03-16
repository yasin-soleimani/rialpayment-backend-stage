import {
  Injectable,
  successOptWithDataNoValidation,
  InternalServerErrorException,
  successOpt,
  successOptWithPagination,
} from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { CoreGiftCardReportService } from '../../Core/giftCard/report/services/report.service';
import { CoreGiftCardSettingsService } from '../../Core/giftCard/settings/services/settings.service';
import { GroupCoreService } from '../../Core/group/group.service';
import { BackofficeGiftcardDto } from './dto/giftcard.dto';

@Injectable()
export class BackofficeGiftcardService {
  constructor(
    private readonly groupService: GroupCoreService,
    private readonly settingsService: CoreGiftCardSettingsService,
    private readonly reportService: CoreGiftCardReportService
  ) {}

  async getGroups(): Promise<any> {
    const data = await this.groupService.getGroupAll(process.env.GIFT_CARD_USER);

    let tmp = Array();
    for (const item of data) {
      const setting = await this.settingsService.getSettingByGroupId(item._id);
      tmp.push({
        _id: data._id,
        title: data.title,
        settings: setting,
      });
    }

    return successOptWithDataNoValidation(tmp);
  }

  async addNew(getInfo: BackofficeGiftcardDto): Promise<any> {
    const exist = await this.settingsService.getSettingByGroupId(getInfo.group);
    if (exist) throw new UserCustomException('برای گروه قبلا تنظیمات ایجاد شده است');

    const data = await this.settingsService.addNew(
      process.env.GIFT_CARD_USER,
      getInfo.group,
      getInfo.price,
      getInfo.discount
    );
    if (!data) throw new InternalServerErrorException();
    return successOpt();
  }

  async edit(getInfo: BackofficeGiftcardDto): Promise<any> {
    const data = await this.settingsService.edit(
      getInfo.id,
      process.env.GIFT_CARD_USER,
      getInfo.group,
      getInfo.price,
      getInfo.discount
    );

    if (!data) throw new InternalServerErrorException();
    return successOpt();
  }

  async changeStatus(id: string, status: boolean): Promise<any> {
    const data = await this.settingsService.changeStatus(id, status);
    if (!data) throw new InternalServerErrorException();
    return successOpt();
  }

  async filter(getInfo, page: number): Promise<any> {
    let query = {};
    var Value_match = new RegExp(getInfo.mobile);
    if (getInfo.mobile.length > 1) {
      query = { $regex: Value_match };
    }

    const data = await this.reportService.filter(query, page);
    return successOptWithPagination(data);
  }
}
