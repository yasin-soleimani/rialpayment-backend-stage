import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class PlatnoCoreService {
  constructor(@Inject('PlatnoModel') private readonly platnoModel: Model<any>) {}

  async add(platno, userid): Promise<any> {
    const regex = /^([0-9]{2})([ا-ی\s]{1,3})([0-9]{3})-([0-9]{2})$/;
    if (regex.test(platno)) {
      const data = platno.match(regex);
      return this.platnoModel.create({ platno: platno, user: userid });
    } else {
      throw new UserCustomException('قالب بندی شماره پلاک صحیح نمی باشد', false, 500);
    }
  }

  async getList(userid): Promise<any> {
    const data = await this.platnoModel.find({ user: userid }).select({ __v: 0, user: 0, status: 0 });
    let tempArray = Array();
    if (data) {
      for (let i = 0; i < data.length; i++) {
        const regex = /^([0-9]{2})([ا-ی\s]{1,3})([0-9]{3})-([0-9]{2})$/;
        if (regex.test(data[i].platno)) {
          const datax = data[i].platno.match(regex);
          tempArray.push({ _id: data[i]._id, p1: datax[1], p2: datax[2], p3: datax[3], p4: datax[4] });
        }
      }

      return tempArray;
    } else {
      return null;
    }
  }

  async remove(pid, userid): Promise<any> {
    return this.platnoModel.findOneAndRemove({ _id: pid, user: userid });
  }

  async edit(pid, userid, platno): Promise<any> {
    return this.platnoModel.findOneAndUpdate({ _id: pid, user: userid }, { platno: platno });
  }

  async changestatus(pid, userid, status): Promise<any> {
    return this.platnoModel.findOneAndUpdate({ _id: pid, user: userid }, { status: status });
  }

  async findPlatTajik(plateno: string): Promise<any> {
    return this.platnoModel.findOne({ platno: plateno });
  }
}
