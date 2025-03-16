import { Inject, Injectable, NotFoundException } from '@vision/common';
import { NationalCoreDto } from '../dto/national.dto';
import { visaTypeList } from '../const/common.const';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { CardcounterService } from '../../useraccount/cardcounter/cardcounter.service';
import * as luhn from 'cc-luhn';

@Injectable()
export class NationalCommonService {
  constructor(
    @Inject('NationalModel') private readonly nationalModel: any,
    @Inject('NationalDocsModel') private readonly nationalDocsModel: any,
    private readonly cardCounter: CardcounterService
  ) {}

  async new(getInfo: NationalCoreDto): Promise<any> {
    if (getInfo.id) {
      let id;
      id = getInfo.id;
      delete getInfo.id;
      return this.nationalModel.findOneAndUpdate({ _id: id }, getInfo);
    }
    return this.nationalModel.create(getInfo);
  }

  async getInfo(id: string): Promise<any> {
    return this.nationalModel.findOne({ _id: id });
  }

  async getInfoByIdCode(idcode): Promise<any> {
    return this.nationalModel.findOne({ idcode: idcode });
  }

  async update(id: string, getInfo: NationalCoreDto): Promise<any> {
    return this.nationalModel.findOneAndUpdate({ _id: id, delete: false }, getInfo);
  }

  async remove(id: string): Promise<any> {
    return this.nationalModel.findOneAndUpdate({ _id: id, delete: false }, { delete: true });
  }

  async getListAll(query, page): Promise<any> {
    return this.nationalModel.paginate(query, { page, populate: 'docs', sort: { createdAt: -1 }, limit: 50 });
  }

  async setData(user: string, field: string, img: string): Promise<any> {
    return this.nationalDocsModel.findOneAndUpdate(
      { user: user, field: field },
      { user: user, field: field, img: img },
      { new: true, upsert: true }
    );
  }

  async changeStatus(id: string, status: number, description: string): Promise<any> {
    return this.nationalModel
      .findOneAndUpdate(
        { _id: id },
        { status: status, description: { $push: { date: new Date(), desc: description } } }
      )
      .then(async (res) => {
        if (status == 2 && !res.idcode) {
          const cid = await this.cardCounter.getNationalIdCode();
          const cidStr = cid.idcode.toString();
          const idcode = cidStr.padStart(7, '0');
          const chkSum = luhn(idcode);
          const final = idcode + chkSum;
          console.log(final, 'final');
          await this.nationalModel.findOneAndUpdate({ _id: id }, { idcode: final });
        }
        return res;
      });
  }

  selectVisaType(getInfo: NationalCoreDto) {
    switch (getInfo.visatype) {
      case visaTypeList.Amayesh: {
        if (isEmpty(getInfo.amayesh)) throw new FillFieldsException();
        break;
      }

      case visaTypeList.PassportAndAmayesh: {
        if (isEmpty(getInfo.amayesh) || isEmpty(getInfo.passport)) throw new FillFieldsException();
        break;
      }

      case visaTypeList.Visa: {
        if (isEmpty(getInfo.passport)) throw new FillFieldsException();
      }
    }
  }
}
