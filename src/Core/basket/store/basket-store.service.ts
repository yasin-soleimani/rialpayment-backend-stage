import { Inject, Injectable } from '@vision/common';
import { Model } from 'mongoose';
import { UpdateStoreTransmissionSettingsDto } from '../../../Api/basket/store/dto/update-store-transmission-settings.dto';
import { BasketStoreCoreDto } from './dto/basket-store.dto';
import { imageTransform } from '@vision/common/transform/image.transform';
import { BasketStoreInfo } from '../../../Api/basket/store/model/store-info.model';

@Injectable()
export class BasketStoreCoreService {
  constructor(@Inject('BasketStoreModel') private readonly storeModel: Model<any>) {}

  async addNew(getInfo: BasketStoreCoreDto): Promise<any> {
    return this.storeModel.create(getInfo);
  }

  async getAll(): Promise<any> {
    return this.storeModel.find({ status: true });
  }

  async getInfo(userid: string): Promise<any> {
    return this.storeModel.findOne({ user: userid }).populate('user').populate('mipg').sort({ createdAt: -1 });
  }

  async getInfoLean(userid: string): Promise<any> {
    return this.storeModel.findOne({ user: userid }).populate('user').populate('mipg').sort({ createdAt: -1 }).lean();
  }

  async getInfoByNickname(nickname: string): Promise<any> {
    return this.storeModel.findOne({ nickname: nickname }).populate('user').populate('mipg').sort({ createdAt: -1 });
  }

  async getInfoByNicknameLean(nickname: string): Promise<any> {
    return this.storeModel
      .findOne({ nickname: nickname })
      .populate('user')
      .populate('mipg')
      .sort({ createdAt: -1 })
      .lean();
  }

  async update(getInfo: BasketStoreCoreDto): Promise<any> {
    return this.storeModel.findOneAndUpdate(
      {
        user: getInfo.user,
      },
      getInfo
    );
  }

  async pushBanner(getInfo): Promise<any> {
    return this.storeModel
      .findOneAndUpdate(
        {
          user: getInfo.user,
        },
        {
          // @ts-ignore
          $push: { banners: { img: getInfo.banners } },
        },
        { new: true }
      )
      .lean();
  }
  async removeBanner(userid: string, bannerid: string): Promise<any> {
    const store = await this.storeModel.findOne({ user: userid, 'banners._id': bannerid });
    if (!!store) {
      const objWithIdIndex = store.banners.findIndex((obj) => obj._id.toString() === bannerid);
      if (objWithIdIndex > -1) {
        store.banners.splice(objWithIdIndex, 1);
      }
      await store.save();

      const stores: any = await this.storeModel.findOne({ user: userid }).lean();
      const bannersArray = [];
      for (const bannera of stores.banners) {
        console.log(bannera);
        bannersArray.push({ ...bannera, img: imageTransform(bannera.img) });
      }
      stores.banners = [...bannersArray];
      return BasketStoreInfo(stores);
    } else return null;
  }

  async updateTransmissionSettings(getInfo: UpdateStoreTransmissionSettingsDto): Promise<any> {
    return this.storeModel.findOneAndUpdate(
      {
        user: getInfo.user,
      },
      getInfo
    );
  }

  async setIpg(userid: string, mipgid: string): Promise<any> {
    return this.storeModel.findOneAndUpdate(
      {
        user: userid,
      },
      {
        mipg: mipgid,
      }
    );
  }

  async changeStatus(userid: string, status: boolean): Promise<any> {
    return this.storeModel.findOneAndUpdate(
      {
        user: userid,
      },
      {
        status: status,
      }
    );
  }

  async checkNickname(nickname: string): Promise<any> {
    return this.storeModel.findOne({
      nickname: nickname,
    });
  }

  async getInfoById(storeId: string): Promise<any> {
    return this.storeModel.findOne({
      _id: storeId,
    });
  }
}
