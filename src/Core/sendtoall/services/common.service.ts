import { Injectable, Inject } from '@vision/common';

@Injectable()
export class SendtoallCommonService {
  constructor(@Inject('SendtoallModel') private readonly sendModel: any) { }

  async addNew(
    userid: string,
    message: string,
    type: number,
    mobile: number,
    fcm: string,
    groupname: string,
    gid: string,
    ref: string,
    provider: string,
    username: string,
    password: string,
    sourceno: string,
    status: string
  ): Promise<any> {
    return this.sendModel.create({
      user: userid,
      message: message,
      type: type,
      mobile: mobile,
      fcm: fcm,
      groupname: groupname,
      gid: gid,
      ref: ref,
      provider: provider,
      username: username,
      password: password,
      sourceno: sourceno,
      status: status,
    });
  }

  async getList(userid: string, page, gid: string): Promise<any> {
    return this.sendModel.paginate(
      { ref: userid, gid: gid },
      { page: page, populate: 'user', sort: { createdAt: -1 }, limit: 50 }
    );
  }

  async getPaginateQuery(query: string, page: number): Promise<any> {
    return this.sendModel.paginate(query, { page: page, populate: 'user', sort: { createdAt: -1 }, limit: 50 });
  }
}
