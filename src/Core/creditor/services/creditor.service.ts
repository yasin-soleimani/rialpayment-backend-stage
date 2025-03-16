import { Injectable, Inject } from '@vision/common';

@Injectable()
export class CreditorCoreService {
  constructor(@Inject('CreditorModel') private readonly creditorModel: any) {}

  async getInfoById(id: string): Promise<any> {
    return this.creditorModel.findOne({ _id: id });
  }

  async addNew(subject, amount, description, date, type): Promise<any> {
    return this.creditorModel.create({
      subject,
      amount,
      description,
      date,
      type,
    });
  }

  async changeStatus(id: string, status: boolean): Promise<any> {
    return this.creditorModel.findOneAndUpdate({ _id: id }, { $set: { status } });
  }

  async delete(id: string): Promise<any> {
    return this.creditorModel.findOneAndUpdate({ _id: id }, { visible: false });
  }

  async getList(subject: string, page: number): Promise<any> {
    return this.creditorModel.paginate({ subject, visible: true }, { page, sort: { createdAt: -1 }, limit: 50 });
  }

  async getListBySubjectId(id: string, type: number): Promise<any> {
    return this.creditorModel.find({
      subject: id,
      type,
      visible: true,
      status: true,
    });
  }
}
