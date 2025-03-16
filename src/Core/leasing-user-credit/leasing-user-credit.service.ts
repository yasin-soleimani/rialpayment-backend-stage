import { Inject, Injectable } from '@vision/common';
import { AggregatePaginateModel, PaginateResult } from '../../utils/types.util';
import { LeasingUserCredit, LeasingUserCreditDocument } from './interfaces/leasing-user-credit.interface';
import { Types } from 'mongoose';

@Injectable()
export class LeasingUserCreditCoreService {
  constructor(
    @Inject('LeasingUserCreditModel')
    private readonly userCreditModel: AggregatePaginateModel<LeasingUserCreditDocument>
  ) {}

  async getUserCreditByLeasingOption(userId: string, leasingOption: string): Promise<LeasingUserCreditDocument> {
    return this.userCreditModel.findOne({ userId, leasingOption }).populate([
      {
        path: 'leasingOption',
      },
      {
        path: 'leasingApply',
      },
    ]);
  }

  async blockUserCredit(userCreditId: string): Promise<LeasingUserCreditDocument> {
    return this.userCreditModel.findOneAndUpdate({ _id: userCreditId }, { $set: { block: true } }, { new: true });
  }

  async unblockUserCredit(userCreditId: string): Promise<LeasingUserCreditDocument> {
    return this.userCreditModel.findOneAndUpdate({ _id: userCreditId }, { $set: { block: false } }, { new: true });
  }

  async getAllByLeasingUser(leasingUser: string): Promise<LeasingUserCreditDocument[]> {
    return this.userCreditModel.aggregate([
      {
        $match: {
          leasingUser: Types.ObjectId(leasingUser),
        },
      },
      {
        $lookup: {
          from: 'leasingoptions',
          localField: 'leasingOption',
          foreignField: '_id',
          as: 'leasingOption',
        },
      },
      {
        $unwind: {
          path: '$leasingOption',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'leasinginfos',
          localField: 'leasingOption.leasingUser',
          foreignField: 'leasingUser',
          as: 'leasingInfo',
        },
      },
      {
        $unwind: {
          path: '$leasingInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'leasinginstallments',
          let: {
            leasingUserCredit: '$_id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$leasingUserCredit', '$$leasingUserCredit'],
                    },
                    {
                      $eq: ['$paid', false],
                    },
                  ],
                },
              },
            },
          ],
          as: 'installments',
        },
      },
      {
        $addFields: {
          unpaidInstallments: {
            $size: '$installments',
          },
        },
      },
      {
        $project: {
          _id: 1,
          user: {
            fullname: 1,
            mobile: 1,
            avatar: { $concat: [process.env.SITE_URL, '$user.avatar'] },
            nationalcode: 1,
            islegal: 1,
            legal: 1,
            birthdate: 1,
          },
          amount: 1,
          createdAt: 1,
          updatedAt: 1,
          leasingInfo: {
            _id: 1,
            title: 1,
            description: 1,
            logo: { $concat: [process.env.SITE_URL, '$leasingInfo.logo'] },
          },
          totalInstallments: '$leasingOption.months',
          unpaidInstallments: 1,
          block: 1,
        },
      },
    ]);
  }

  async getById(id: string): Promise<LeasingUserCreditDocument> {
    return this.userCreditModel.findOne({ _id: id }).populate([
      {
        path: 'leasingOption',
      },
      {
        path: 'leasingApply',
      },
    ]);
  }

  async delete(id: string): Promise<LeasingUserCreditDocument> {
    return this.userCreditModel.findByIdAndDelete(id);
  }

  async createUserCredits(dto: LeasingUserCredit): Promise<LeasingUserCreditDocument> {
    return this.userCreditModel.create(dto);
  }

  async getAll(page: string): Promise<PaginateResult<LeasingUserCreditDocument>> {
    const aggregate = this.userCreditModel.aggregate([
      {
        $lookup: {
          from: 'leasingoptions',
          localField: 'leasingOption',
          foreignField: '_id',
          as: 'leasingOption',
        },
      },
      {
        $unwind: {
          path: '$leasingOption',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'leasinginfos',
          localField: 'leasingOption.leasingUser',
          foreignField: 'leasingUser',
          as: 'leasingInfo',
        },
      },
      {
        $unwind: {
          path: '$leasingInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'leasinginstallments',
          let: {
            leasingUserCredit: '$_id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$leasingUserCredit', '$$leasingUserCredit'],
                    },
                    {
                      $eq: ['$paid', false],
                    },
                  ],
                },
              },
            },
          ],
          as: 'installments',
        },
      },
      {
        $addFields: {
          unpaidInstallments: {
            $size: '$installments',
          },
        },
      },
      {
        $project: {
          _id: 1,
          user: {
            fullname: 1,
            mobile: 1,
            avatar: { $concat: [process.env.SITE_URL, '$user.avatar'] },
            nationalcode: 1,
            islegal: 1,
            legal: 1,
            birthdate: 1,
          },
          amount: 1,
          createdAt: 1,
          updatedAt: 1,
          leasingInfo: {
            _id: 1,
            title: 1,
            description: 1,
            logo: { $concat: [process.env.SITE_URL, '$leasingInfo.logo'] },
          },
          totalInstallments: '$leasingOption.months',
          unpaidInstallments: 1,
          block: 1,
        },
      },
    ]);

    const options = {
      page: Number(page),
      limit: 10,
      sort: {
        createdAt: -1,
      },
    };

    return this.userCreditModel.aggregatePaginate(aggregate, options);
  }

  async getAllUserCredits(userId: string): Promise<LeasingUserCreditDocument[]> {
    return this.userCreditModel.aggregate([
      {
        $match: {
          user: Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'leasingoptions',
          localField: 'leasingOption',
          foreignField: '_id',
          as: 'leasingOption',
        },
      },
      {
        $unwind: {
          path: '$leasingOption',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'leasinginfos',
          localField: 'leasingOption.leasingUser',
          foreignField: 'leasingUser',
          as: 'leasingInfo',
        },
      },
      {
        $unwind: {
          path: '$leasingInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'leasinginstallments',
          let: {
            leasingUserCredit: '$_id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$leasingUserCredit', '$$leasingUserCredit'],
                    },
                    {
                      $eq: ['$paid', false],
                    },
                  ],
                },
              },
            },
          ],
          as: 'installments',
        },
      },
      {
        $addFields: {
          unpaidInstallments: {
            $size: '$installments',
          },
        },
      },
      {
        $project: {
          _id: 1,
          user: 1,
          amount: 1,
          createdAt: 1,
          updatedAt: 1,
          leasingInfo: {
            _id: 1,
            title: 1,
            description: 1,
            logo: { $concat: [process.env.SITE_URL, '$leasingInfo.logo'] },
          },
          totalInstallments: '$leasingOption.months',
          unpaidInstallments: 1,
          block: 1,
        },
      },
    ]);
  }

  async decreaseUserCredits(userId: string, leasingOption: string, amount: number): Promise<LeasingUserCreditDocument> {
    return this.userCreditModel.findOneAndUpdate(
      { userId, leasingOption },
      { $inc: { amount: -amount } },
      { new: true }
    );
  }

  async increaseUserCredits(userId: string, leasingOption: string, amount: number): Promise<LeasingUserCreditDocument> {
    return this.userCreditModel.findOneAndUpdate(
      { userId, leasingOption },
      { $inc: { amount: amount } },
      { new: true }
    );
  }

  async decreaseUserCreditsById(userCreditId: string, amount: number): Promise<LeasingUserCreditDocument> {
    return this.userCreditModel.findOneAndUpdate({ _id: userCreditId }, { $inc: { amount: -amount } }, { new: true });
  }

  async increaseUserCreditsById(userCreditId: string, amount: number): Promise<LeasingUserCreditDocument> {
    return this.userCreditModel.findOneAndUpdate({ _id: userCreditId }, { $inc: { amount: amount } }, { new: true });
  }
  async getUserCreditList(userId: string, options: any): Promise<any> {
    return await this.userCreditModel.find({ user: userId, block: false, amount: { $gt: 100 } }).populate({
      path: 'leasingOption',
    });
  }
}
