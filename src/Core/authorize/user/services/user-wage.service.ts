import { Injectable, Inject } from '@vision/common';

@Injectable()
export class AuthorizeUserWageService {
  constructor(@Inject('AuthorizeUserWageModel') private readonly wageModel: any) {}

  async addNew(
    userid: string,
    loginstatus: boolean,
    loginwage: number,
    loginwagefrom: number,
    paystatus: boolean,
    paytype: number,
    paywage: number,
    paywagefrom: number
  ): Promise<any> {
    return this.wageModel.create({
      user: userid,
      login: {
        status: loginstatus,
        wagefrom: loginwagefrom,
        wage: loginwage,
      },
      pay: {
        status: paystatus,
        wagetype: paytype,
        wagefrom: paywagefrom,
        wage: paywage,
      },
    });
  }

  async getLast(userid: string): Promise<any> {
    return this.wageModel
      .findOne({
        user: userid,
      })
      .sort({ createdAt: -1 });
  }
}
