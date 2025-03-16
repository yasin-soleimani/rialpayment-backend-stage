import { Model } from 'mongoose';
import { Injectable, Inject } from '@vision/common';

@Injectable()
export class LoginGatewayServiceCore {
  constructor(@Inject('SocketModel') private readonly wsloginModel: Model<any>) {}
  async create(cidx: string, datax: string): Promise<any> {
    return await this.wsloginModel.create({ clientid: cidx, data: datax });
  }

  async update(cidx: string, datax: string): Promise<any> {
    return await this.wsloginModel
      .findOneAndUpdate({ clientid: cidx }, { $set: [{ clientid: cidx, data: datax }] })
      .exec();
  }

  async findByClient(Clientx, Datax): Promise<any> {
    return await this.wsloginModel.findOne({ $or: [{ clientid: Clientx }, { data: Datax }] }).exec();
  }

  async RemoveRecord(Clientx): Promise<any> {
    return await this.wsloginModel.findOneAndRemove({ clientid: Clientx }).exec();
  }
  async findByCid(datax: string): Promise<any> {
    return await this.wsloginModel.findOne({ data: datax }).exec();
  }

  loginSuccess(user: any, tokenx: any) {
    return {
      status: 200,
      success: true,
      message: 'کاربر با موفقیت وارد شد',
      token: tokenx,
      fullname: user.fullname || '',
      avatar: process.env.SITE_URL + user.avatar || '',
      account_no: user.account_no,
      cardno: user.card.cardno,
      profilestatus: user.profilestatus,
      greeting: '',
      wallet: user.accounts[0].balance,
      walletCurrency: user.accounts[0].currency,
      walletChart: [0, 0, 0, 0, 0, 5, 10, 8, 9, 0, 0, 0, 0, 0, 0],
      credit: user.accounts[1].balance,
      creditChart: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      discount: user.accounts[2].balance,
      discountChart: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      idm: user.accounts[3].balance,
      idmChart: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };
  }
}
