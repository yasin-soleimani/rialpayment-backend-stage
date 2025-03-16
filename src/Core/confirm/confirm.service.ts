import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';
import * as securePin from 'secure-pin';
import { GeneralService } from '../service/general.service';

@Injectable()
export class ConfirmCoreService {
  constructor(
    @Inject('ConfirmModel') private readonly confirmModel: Model<any>,
    private readonly generalService: GeneralService
  ) {}

  async newReq(mobile): Promise<any> {
    const randno = securePin.generatePinSync(4);
    const msg = 'کد فعال سازی شما :‌ ' + randno;
    this.generalService.AsanaksendSMS(
      process.env.ASANAK_USERNAME,
      process.env.ASANAK_PASSWORD,
      process.env.ASANAK_NUMBER,
      mobile,
      msg
    );
    return this.confirmModel.findOneAndUpdate(
      { mobile: mobile },
      { mobile: mobile, acode: randno },
      { new: true, upsert: true }
    );
  }

  async getAll(mobile: number): Promise<any> {
    return this.confirmModel.findOne({ mobile: mobile });
  }
}
