import { Injectable, Inject } from '@vision/common';
import { isEmpty, isNil } from '@vision/common/utils/shared.utils';
import { Model } from 'mongoose';
import { BillInquiryListDto } from '../dto/list.dto';

@Injectable()
export class BillInquiryCommonService {
  constructor(
    @Inject('BillInquiryModel') private readonly inuiqryModel: any,
    @Inject('BillInquiryListModel') private readonly listModel: Model<any>
  ) {}

  async submit(getInfo): Promise<any> {
    return this.inuiqryModel.create(getInfo);
  }

  async getList(userid: string): Promise<any> {
    return this.listModel.find({
      user: userid,
      status: true,
    });
  }

  async addNewList(getInfo: BillInquiryListDto): Promise<any> {
    return this.listModel.create(getInfo);
  }

  async delete(id: string): Promise<any> {
    return this.listModel.findOneAndUpdate({ _id: id }, { $set: { status: false } });
  }

  async getListInfoByUserIdAndBillId(billId: string, userid: string): Promise<any> {
    return this.listModel.findOne({
      id: billId,
      user: userid,
      status: true,
    });
  }

  async getListInfoByUserIdAndId(id: string, userid: string): Promise<any> {
    return this.listModel.findOne({
      _id: id,
      user: userid,
      status: true,
    });
  }
  async getPaidList(userid: string, page: number, type: number): Promise<any> {
    let query: any = { user: userid, paid: true };

    if (!isNil(type)) {
      query = {
        user: userid,
        paid: true,
        type: type,
      };
    }
    return this.inuiqryModel.paginate(query, { page, sort: { createdAt: -1 }, limit: 50 });
  }

  async getBillInfoById(id: string): Promise<any> {
    return this.inuiqryModel.findOne({ _id: id });
  }

  async update(id: string, getInfo: any): Promise<any> {
    return this.inuiqryModel.findOneAndUpdate(
      { _id: id },
      {
        $set: getInfo,
      }
    );
  }
}
