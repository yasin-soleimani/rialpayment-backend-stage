import { Injectable, Inject } from '@vision/common';

@Injectable()
export class CreditorSubjectCoreService {
  constructor(@Inject('CreditorSubjectModel') private readonly subjectModel: any) {}

  async addNew(user: string, title: string, ref: string, name: string, group, percent: number): Promise<any> {
    return this.subjectModel.create({ user, title, ref, name, group, percent });
  }

  async getInfoById(id: string): Promise<any> {
    return this.subjectModel.findOne({ _id: id }).populate('group');
  }

  async changeStatus(id: string, status: boolean): Promise<any> {
    return this.subjectModel.findOneAndUpdate(
      {
        _id: id,
      },
      { $set: { status } }
    );
  }

  async delete(id: string): Promise<any> {
    return this.subjectModel.findOneAndUpdate({ _id: id }, { $set: { visible: false } });
  }

  async getList(user: string, page: number): Promise<any> {
    return this.subjectModel.paginate(
      { user, visible: true },
      { page, populate: 'group', sort: { createdAt: -1 }, limite: 50 }
    );
  }
}
