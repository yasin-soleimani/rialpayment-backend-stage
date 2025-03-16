import { Inject, Injectable } from '@vision/common';
import { Model } from 'mongoose';
import { MerchantShareModel, MerchantShareModelSchema } from '../interfaces/merchantShare-model';
import * as mongoose from 'mongoose';

@Injectable()
export class MerchantShareService {
  constructor(@Inject('MerchantShareModel') private readonly merchantShareModel: Model<MerchantShareModelSchema>) {
    // this.addShare('6285f87232505255ad827c4d', '5b7970aba44f9b6ad76e1d3d');
  }

  async addShare(user: string, toUser: string, merchants: string[]): Promise<boolean> {
    for (const merchant of merchants) {
      const data = await this.merchantShareModel.findOne({
        shareFromUser: user,
        shareToUser: toUser,
        sharedMerchant: merchant,
        deleted: false,
      });
      if (!!data) continue;
      this.merchantShareModel.create({ shareFromUser: user, shareToUser: toUser, sharedMerchant: merchant });
    }
    return true;
  }

  async getSharesByToId(to: string) {
    return this.merchantShareModel.find({ shareToUser: to, accepted: true, deleted: false });
  }

  async findShares(
    from: string | null = null,
    to: string | null = null,
    merchantId: null | string = null
  ): Promise<MerchantShareModel[]> {
    if (!!from) {
      const aggArray = [];
      if (merchantId)
        aggArray.push({
          $match: {
            shareFromUser: mongoose.Types.ObjectId(from),
            deleted: false,
            sharedMerchant: mongoose.Types.ObjectId(merchantId),
            accepted: true,
          },
        });
      else
        aggArray.push({
          $match: {
            shareFromUser: mongoose.Types.ObjectId(from),
            deleted: false,
          },
        });
      aggArray.push(
        {
          $lookup: { from: 'users', localField: 'shareFromUser', foreignField: '_id', as: 'shareFromUser' },
        },
        {
          $unwind: {
            path: '$shareFromUser',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: { from: 'users', localField: 'shareToUser', foreignField: '_id', as: 'shareToUser' },
        },
        {
          $unwind: {
            path: '$shareToUser',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: 'customerclubs',
            localField: 'shareFromUser._id',
            foreignField: 'owner',
            as: 'clubInfoFrom',
          },
        },
        {
          $unwind: {
            path: '$clubInfoFrom',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: { from: 'customerclubs', localField: 'shareToUser._id', foreignField: 'owner', as: 'clubInfoTo' },
        },
        {
          $unwind: {
            path: '$clubInfoTo',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: { from: 'merchants', localField: 'sharedMerchant', foreignField: '_id', as: 'sharedMerchant' },
        },
        {
          $unwind: {
            path: '$sharedMerchant',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $group: {
            _id: '$shareToUser',
            merchants: {
              $push: {
                merchant: '$sharedMerchant',
                shareId: '$_id',
                accepted: '$accepted',
                deleted: '$deleted',
                deleteRequested: '$deleteRequested',
              },
            },
            shareFrom: { $push: '$shareFromUser' },
          },
        },
        {
          $addFields: {
            shareToUser: '$_id',
            clubInfoTo: '$clubInfoTo',
            clubInfoFrom: '$clubInfoFrom',
            shareFromUser: { $slice: ['$shareFrom', 0, 1] },
          },
        },
        {
          $unwind: {
            path: '$shareFromUser',
            preserveNullAndEmptyArrays: true,
          },
        }
      );
      return this.merchantShareModel.aggregate(aggArray);
    } else if (!!to) {
      return this.merchantShareModel.aggregate([
        {
          $match: {
            shareToUser: mongoose.Types.ObjectId(to),
            deleted: false,
          },
        },
        {
          $lookup: { from: 'users', localField: 'shareFromUser', foreignField: '_id', as: 'shareFromUser' },
        },
        {
          $unwind: {
            path: '$shareFromUser',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: { from: 'users', localField: 'shareToUser', foreignField: '_id', as: 'shareToUser' },
        },
        {
          $unwind: {
            path: '$shareToUser',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: 'customerclubs',
            localField: 'shareFromUser._id',
            foreignField: 'owner',
            as: 'clubInfoFrom',
          },
        },
        {
          $unwind: {
            path: '$clubInfoFrom',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: { from: 'customerclubs', localField: 'shareToUser._id', foreignField: 'owner', as: 'clubInfoTo' },
        },
        {
          $unwind: {
            path: '$clubInfoTo',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: { from: 'merchants', localField: 'sharedMerchant', foreignField: '_id', as: 'sharedMerchant' },
        },
        {
          $unwind: {
            path: '$sharedMerchant',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $group: {
            _id: '$shareFromUser',
            merchants: {
              $push: {
                merchant: '$sharedMerchant',
                accepted: '$accepted',
                shareId: '$_id',
                deleted: '$deleted',
                deleteRequested: '$deleteRequested',
              },
            },
            shareTo: { $push: '$shareToUser' },
          },
        },
        {
          $addFields: {
            shareFromUser: '$_id',
            clubInfoTo: '$clubInfoTo',
            clubInfoFrom: '$clubInfoFrom',
            shareToUser: { $slice: ['$shareTo', 0, 1] },
          },
        },
        {
          $unwind: {
            path: '$shareToUser',
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);
    } else return [];
  }

  async getShareRequestedForAccept(_id: string) {
    return this.merchantShareModel.findOne({ _id, deleted: false, accepted: false }).populate('sharedMerchant');
  }

  async doAcceptShare(_id: string) {
    return this.merchantShareModel.findOneAndUpdate({ _id, deleted: false, accepted: false }, { accepted: true });
  }

  async getDeleteRequestedShare(_id: string) {
    return this.merchantShareModel.findOne({ _id, deleted: false, deleteRequested: true }).populate('sharedMerchant');
  }

  async doDeleteShare(_id: string) {
    return this.merchantShareModel.findOneAndUpdate({ _id, deleted: false, deleteRequested: true }, { deleted: true });
  }

  async getMerchantSharesIn(merchants: any[], type = 0) {
    const aggrArray = [];
    switch (type) {
      case 1:
        aggrArray.push({ $match: { sharedMerchant: { $in: merchants }, deleted: false, accepted: false } });
        break;
      case 2:
        aggrArray.push({ $match: { sharedMerchant: { $in: merchants }, deleted: false, accepted: true } });
        break;
      case 3:
        aggrArray.push({ $match: { sharedMerchant: { $in: merchants }, deleted: false, deleteRequested: true } });
        break;
      case 0:
      default:
        aggrArray.push({ $match: { sharedMerchant: { $in: merchants }, deleted: false } });
    }
    aggrArray.push(
      {
        $lookup: { from: 'merchants', localField: 'sharedMerchant', foreignField: '_id', as: 'sharedMerchant' },
      },
      {
        $unwind: {
          path: '$sharedMerchant',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: { from: 'users', localField: 'shareFromUser', foreignField: '_id', as: 'shareFromUser' },
      },
      {
        $unwind: {
          path: '$shareFromUser',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: { from: 'users', localField: 'shareToUser', foreignField: '_id', as: 'shareToUser' },
      },
      {
        $unwind: {
          path: '$shareToUser',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'customerclubs',
          localField: 'shareFromUser._id',
          foreignField: 'owner',
          as: 'clubInfoFrom',
        },
      },
      {
        $unwind: {
          path: '$clubInfoFrom',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: { from: 'customerclubs', localField: 'shareToUser._id', foreignField: 'owner', as: 'clubInfoTo' },
      },
      {
        $unwind: {
          path: '$clubInfoTo',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { createdAt: -1 } }
    );
    return this.merchantShareModel.aggregate(aggrArray);
  }

  async findShare(from: string, to: string): Promise<MerchantShareModel> {
    return this.merchantShareModel
      .findOne({ shareFromUser: from, shareToUser: to })
      .populate('shareFromUser shareToUser');
  }

  async removeShare(_id: string, from: string): Promise<MerchantShareModel> {
    return this.merchantShareModel.findOneAndUpdate({ _id, shareFromUser: from }, { deleteRequested: true });
  }
}
