import { Model } from 'mongoose';
import { Injectable, Inject } from '@vision/common';
import { ApiPermCoreDto } from './dto/apiPerm.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';

@Injectable()
export class ApiPermCoreService {
  constructor(@Inject('ApiPermModel') private readonly ApiPermModel: Model<any>) {}

  async newPerm(getInfo: ApiPermCoreDto): Promise<any> {
    const newAcl = new this.ApiPermModel(getInfo);
    return newAcl.save();
  }

  async getList(): Promise<any> {
    return this.ApiPermModel.find();
  }

  async getInfo(usernamex: string, passwordx: string): Promise<any> {
    if (isEmpty(usernamex) || isEmpty(passwordx)) throw new FillFieldsException();
    return await this.ApiPermModel.findOne({ username: usernamex, password: passwordx });
  }

  async getUser(userid: string): Promise<any> {
    if (isEmpty(userid)) throw new UserNotfoundException();
    const acl = await this.ApiPermModel.findOne({ user: userid }).select({ _id: 0, __v: 0, user: 0 }).exec();
    if (!acl) return this.faildOpt();
    return this.successOpt(acl);
  }

  successOpt(datax) {
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      data: datax,
    };
  }

  faildOpt() {
    return {
      status: 401,
      success: false,
      message: 'متاسفانه دسترسی برای کاربر تعریف نشده است ',
      data: {},
    };
  }
}
