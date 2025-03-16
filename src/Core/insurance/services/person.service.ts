import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';
import { NationalInsurancePersonDto } from '../dto/insurance-person.dto';

@Injectable()
export class NationalInsurancePersonCommonService {
  constructor(@Inject('NationalInsurancePersonModel') private readonly personModel: Model<any>) {}

  private async new(getInfo: NationalInsurancePersonDto): Promise<any> {
    return this.personModel.create(getInfo);
  }

  async submit(getInfo: [NationalInsurancePersonDto], insuranceid: string): Promise<any> {
    let counter = 0;
    for (const info of getInfo) {
      info.insurance = insuranceid;
      await this.new(info).then((res) => {
        counter++;
      });
    }

    return counter;
  }
}
