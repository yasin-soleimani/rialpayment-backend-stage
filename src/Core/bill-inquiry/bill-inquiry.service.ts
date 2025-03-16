import { Injectable, successOptWithPagination } from '@vision/common';
import { BillInquiryGasCoreService } from './services/gas.service';
import { BillInquiryTypeConst } from './const/type.const';
import { BillInquiryWaterCoreService } from './services/water.service';
import { BillInquiryElectricCoreService } from './services/electric.service';
import { BillInqiuryCarCrimeService } from './services/car-crime.service';
import { BillInquiryMCICoreService } from './services/mci.service';
import { BillInquiryListCoreService } from './services/list.service';
import { BillInquiryCommonService } from './services/common.service';
import { BillInquiryPhoneCoreService } from './services/phone.service';

@Injectable()
export class BillInquiryCoreService {
  constructor(
    private readonly listService: BillInquiryListCoreService,
    private readonly gasService: BillInquiryGasCoreService,
    private readonly waterService: BillInquiryWaterCoreService,
    private readonly electricService: BillInquiryElectricCoreService,
    private readonly mciService: BillInquiryMCICoreService,
    private readonly cardCrimeService: BillInqiuryCarCrimeService,
    private readonly commonService: BillInquiryCommonService,
    private readonly phoneService: BillInquiryPhoneCoreService
  ) {}

  async getPaidList(userid: string, page: number, type: number): Promise<any> {
    const data = await this.commonService.getPaidList(userid, page, type);
    return successOptWithPagination(data);
  }

  async play(userid: string, type: number, id: string, title: string, isSave: boolean, referer: string): Promise<any> {
    this.isSave(userid, type, id, title, isSave);
    switch (Number(type)) {
      case BillInquiryTypeConst.Gas: {
        return this.gasService.getInfo(userid, type, id, referer);
      }

      case BillInquiryTypeConst.Water: {
        return this.waterService.getInfo(userid, type, id, referer);
      }

      case BillInquiryTypeConst.Electric: {
        return this.electricService.getInfo(userid, type, id, referer);
      }

      case BillInquiryTypeConst.MCI: {
        return this.mciService.getInfo(userid, type, id, referer);
      }

      case BillInquiryTypeConst.Phone: {
        return this.phoneService.getInfo(userid, type, id, referer);
      }

      case BillInquiryTypeConst.CarCrime: {
        return this.cardCrimeService.getInfo(userid, type, id, referer);
      }
    }
  }

  private async isSave(userid: string, type: number, id: string, title: string, isSave: boolean): Promise<any> {
    console.log(userid, 'userid');
    if (isSave == true) {
      await this.listService.addNew({
        id,
        user: userid,
        title,
        type,
      });
    }
  }
}
