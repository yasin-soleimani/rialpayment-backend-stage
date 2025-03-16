import { Injectable, InternalServerErrorException } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { GeneralService } from '../../../service/general.service';
import { CoreGiftCardReportCommonService } from './common.service';

@Injectable()
export class CoreGiftCardReportService {
  constructor(
    private readonly commonService: CoreGiftCardReportCommonService,
    private readonly generalService: GeneralService
  ) {}

  async addCard(id: string, cardId: string, price: number, discount: number): Promise<any> {
    return this.commonService.addCard(id, cardId, price, discount);
  }

  async submit(mobile: string, groupId: string): Promise<any> {
    const data = await this.commonService.setMobile(mobile, groupId);
    if (!data) throw new InternalServerErrorException();

    const msg = 'کد تایید : ' + data.code;
    this.generalService.AsanaksendSMS('', '', '', mobile, msg);

    return data;
  }

  async verify(mobile: string, code: string): Promise<any> {
    const data = await this.commonService.getLastByMobile(mobile);
    if (data.code != code) throw new UserCustomException('کد اعتبار سنجی اشتباه است');

    return data;
  }

  async getInfoById(id: string): Promise<any> {
    return this.commonService.getInfoById(id);
  }
  async setTerminal(id: string, terminal: string, ip: string): Promise<any> {
    return this.commonService.setTerminal(id, terminal, ip);
  }

  async filter(query, page: number): Promise<any> {
    return this.commonService.filter(query, page);
  }
}
