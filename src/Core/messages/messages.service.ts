import { Injectable, Inject } from '@vision/common';

@Injectable()
export class MessagesCoreService {
  constructor(@Inject('MessagesModel') private readonly messageModel: any) {}

  async submit(from: string, to: string, title: string, description: string, type: number): Promise<any> {
    return this.messageModel.create({
      from: from,
      to: to,
      title: title,
      description: description,
      type: type,
    });
  }

  async viewMessage(id: string, userid: string): Promise<any> {
    return this.messageModel.findOneAndUpdate(
      {
        $and: [{ _id: id }, { to: userid }],
      },
      {
        isread: true,
      }
    );
  }

  async listMessages(userid, page): Promise<any> {
    const query = {
      to: userid,
    };
    return this.messageModel.paginate(query, { page: page, sort: { createdAt: -1 }, populate: 'to from', limit: 50 });
  }

  async getUnreadMessages(userid: string): Promise<any> {
    return this.messageModel.count({ $and: [{ to: userid }, { isread: false }] });
  }
}
