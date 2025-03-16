import { Injectable, Inject } from '@vision/common';
import { NationalInsuranceDto } from '../dto/insurance.dto';
import { NationalInsurancePersonCommonService } from './person.service';

@Injectable()
export class NationalInsuranceCommonService {
  constructor(
    @Inject('NationalInsuranceModel') private readonly insuranceModel: any,
    private readonly personService: NationalInsurancePersonCommonService
  ) {}

  async addPaid(invocieid: string, ipgid: string): Promise<any> {
    return this.insuranceModel.findOneAndUpdate(
      { invoiceid: invocieid },
      {
        paid: true,
        ipg: ipgid,
      }
    );
  }

  async getInfoById(id: string): Promise<any> {
    return this.insuranceModel.findOne({ _id: id }).populate('user').populate('persons');
  }

  async new(
    getInfo: NationalInsuranceDto,
    total: number,
    qty: number,
    invoiceid: string,
    category: string,
    company: string
  ): Promise<any> {
    return this.insuranceModel
      .create({
        user: getInfo.customerid,
        total: total,
        qty: qty,
        invoiceid: invoiceid,
        company: company,
        category: category,
      })
      .then(async (res) => {
        await this.personService.submit(getInfo.persons, res._id);
        return res;
      });
  }

  async getList(company: string, page: number): Promise<any> {
    return this.insuranceModel.paginate(
      {
        company: company,
        delete: false,
        paid: true,
      },
      { page: page, populate: 'user category ipg ', sort: { createdAt: -1 }, limit: 50 }
    );
  }
}
