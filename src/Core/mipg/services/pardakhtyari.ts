import { Inject, Injectable, InternalServerErrorException, successOpt } from '@vision/common';
import { MipgPardakhtyariDto } from '../dto/pardakhtyari.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { invalidUserPassException } from '@vision/common/exceptions/invalid-userpass.exception';
import { Model } from 'mongoose';

@Injectable()
export class MipgPardakhtyariService {
  constructor(
    @Inject('MipgPardakhtyariModel') private readonly pardakhtyariModel: Model<any>,
    @Inject('MipgModel') private readonly mipgModel: any
  ) {}

  async addNew(getInfo: MipgPardakhtyariDto, userid): Promise<any> {
    const total = await this.count(userid, getInfo.mipg);
    if (total >= 3) throw new UserCustomException('شما مجاز به ثبت بیش از ۳ ترمینال نمی باشید');
    const mipgInfo = await this.mipgModel.findOne({ _id: getInfo.mipg });
    if (!mipgInfo) throw new UserCustomException('ترمینال مورد نظر یافت نشد');
    getInfo.user = mipgInfo.user;
    getInfo.sheba = this.splitSheba(getInfo.sheba);
    return this.pardakhtyariModel.create(getInfo);
  }

  private splitSheba(sheba) {
    const splited = sheba.split(',');
    let tmpArray = Array();

    for (let item in splited) {
      tmpArray.push(splited[item]);
    }

    return tmpArray;
  }

  async getList(id: string): Promise<any> {
    const data = await this.pardakhtyariModel
      .find({
        mipg: id,
      })
      .populate('psp');

    let tmpArray = Array();

    for (let item in data) {
      tmpArray.push({
        _id: data[item]._id,
        sheba: data[item].sheba,
        psp: {
          name: data[item].psp.name,
          _id: data[item].psp._id,
        },
        username: data[item].username,
        iv: data[item].iv,
        key: data[item].key,
        configid: data[item].configid,
        acceptorid: data[item].acceptorid,
        terminalid: data[item].terminalid,
        default: data[item].default,
      });
    }

    return tmpArray;
  }

  async edit(getInfo: MipgPardakhtyariDto): Promise<any> {
    return this.pardakhtyariModel.findOneAndUpdate({ _id: getInfo.id }, getInfo);
  }

  async remove(id: string): Promise<any> {
    return this.pardakhtyariModel.findOneAndRemove({
      _id: id,
    });
  }

  private async count(userid: string, mipg: string): Promise<any> {
    return this.pardakhtyariModel
      .find({
        user: userid,
        mipg: mipg,
      })
      .count();
  }

  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<any> {
    const data = await this.pardakhtyariModel.findOne({
      _id: id,
    });
    if (!data) throw new UserCustomException('ترمینال یافت نشد');
    if (oldPassword != data.password) throw new invalidUserPassException();

    return this.pardakhtyariModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        password: newPassword,
      }
    );
  }

  async makeDefault(id: string): Promise<any> {
    const data = await this.pardakhtyariModel.findOne({
      _id: id,
    });
    if (!data) throw new InternalServerErrorException();

    const res = await this.pardakhtyariModel
      .updateMany(
        {
          mipg: data.mipg,
        },
        {
          $set: { default: false },
        }
      )
      .then((res) => {
        console.log(res, 'update res');
        if (res) {
          return this.pardakhtyariModel.findOneAndUpdate({ _id: id }, { default: true });
        } else {
          throw new InternalServerErrorException();
        }
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });

    if (!res) throw new InternalServerErrorException();

    return successOpt();
  }
}
