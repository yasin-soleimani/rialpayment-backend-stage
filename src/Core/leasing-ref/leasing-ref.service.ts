import { Inject, Injectable } from '@vision/common';
import { LeasingRefReformDto } from '../../Api/leasing-ref/dto/leasing-ref-reform.dto';
import { AggregatePaginateModel } from '../../utils/types.util';
import { LeasingRefStatusEnum } from './enums/leasing-ref-status.enum';
import { LeasingRef } from './interfaces/leasing-ref.interface';

@Injectable()
export class LeasingRefCoreService {
  constructor(@Inject('LeasingRefModel') private readonly leasingRefModel: AggregatePaginateModel<LeasingRef>) {}

  async getDeclinedById(leasingRefId: string): Promise<LeasingRef> {
    return this.leasingRefModel.findOne({ _id: leasingRefId, status: LeasingRefStatusEnum.DECLINED }).lean();
  }

  async setNewReformMessage(leasingRefId: string, dto: LeasingRefReformDto): Promise<LeasingRef> {
    return this.leasingRefModel.findOneAndUpdate(
      {
        _id: leasingRefId,
      },
      {
        $set: { status: LeasingRefStatusEnum.PENDING },
        $push: { reformsDescriptions: { message: dto.message, date: new Date() } },
      },
      { new: true }
    );
  }

  async getByLeasingUserAndClubUser(clubUser: any, leasingUser: string): Promise<LeasingRef> {
    return this.leasingRefModel.findOne({
      leasingUser,
      clubUser,
    });
  }

  async create(clubUser: string, leasingUser: string): Promise<LeasingRef> {
    const data = {
      clubUser,
      leasingUser,
      status: 'pending',
    };
    return this.leasingRefModel.create(data);
  }

  async updateShow(id: string, show: boolean): Promise<LeasingRef> {
    return this.leasingRefModel.findOneAndUpdate({ _id: id }, { $set: { show: show } }, { new: true });
  }

  async getByLeasingUser(leasingUser: string): Promise<LeasingRef> {
    return this.leasingRefModel.findOne({ leasingUser }).lean();
  }

  async getActiveLeasingRefsByLeasingUser(leasingUser: string): Promise<LeasingRef[]> {
    return this.leasingRefModel
      .find({ leasingUser, show: true })
      .populate([
        {
          path: 'clubUser',
          select: {
            fullname: 1,
            avatar: 1,
            islegal: 1,
            legal: 1,
            mobile: 1,
          },
        },
      ])
      .select({
        clubUser: 1,
        _id: 1,
        leasingUser: 1,
        status: 1,
      })
      .lean();
  }

  async getListForLeasingManager(clubUser: string): Promise<LeasingRef[]> {
    return (
      this.leasingRefModel
        // .find({ $or: [{ clubUser: clubUser }, { public: true }] })
        .find({ $or: [{ clubUser: clubUser }] })
        .populate({
          path: 'leasingUser',
          select: {
            mobile: 1,
            avatar: 1,
            nationalcode: 1,
            fullname: 1,
            fathername: 1,
            legal: 1,
            islegal: 1,
            birthdate: 1,
          },
        })
        .populate({
          path: 'declineReasons.rejectedBy',
          select: {
            fullname: 1,
          },
        })
        .lean()
    );
  }

  async getPublicLeasingRefsForApplicant(): Promise<LeasingRef[]> {
    return this.leasingRefModel.aggregate<LeasingRef>([
      {
        $match: {
          $and: [{ public: true }, { show: true }, { status: LeasingRefStatusEnum.ACCEPTED }],
        },
      },
      {
        $lookup: {
          from: 'leasinginfos',
          localField: 'leasingUser',
          foreignField: 'leasingUser',
          as: 'info',
        },
      },
      {
        $unwind: { path: '$info', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'leasingforms',
          let: { leasingUser: '$leasingUser' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$leasingUser', '$$leasingUser'] }, { $eq: ['$deleted', false] }],
                },
              },
            },
          ],
          as: 'forms',
        },
      },
      {
        $project: {
          _id: 1,
          logo: { $concat: [process.env.SITE_URL, '$info.logo'] },
          title: '$info.title',
          description: '$info.description',
          'forms._id': 1,
          'forms.description': 1,
          'forms.required': 1,
          'forms.title': 1,
          'forms.type': 1,
          'forms.key': 1,
          'forms.createdAt': 1,
          'forms.updatedAt': 1,
        },
      },
    ]);
  }

  async getByClubUserForApplicant(clubUser: string): Promise<LeasingRef[]> {
    return this.leasingRefModel.aggregate<LeasingRef>([
      {
        $match: {
          $or: [
            {
              clubUser: clubUser,
              show: true,
              status: LeasingRefStatusEnum.ACCEPTED,
            },
            {
              public: true,
              show: true,
              status: LeasingRefStatusEnum.ACCEPTED,
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'leasinginfos',
          localField: 'leasingUser',
          foreignField: 'leasingUser',
          as: 'info',
        },
      },
      {
        $unwind: { path: '$info', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'leasingforms',
          let: { leasingUser: '$leasingUser' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$leasingUser', '$$leasingUser'] }, { $eq: ['$deleted', false] }],
                },
              },
            },
          ],
          as: 'forms',
        },
      },
      {
        $project: {
          _id: 1,
          logo: { $concat: [process.env.SITE_URL, '$info.logo'] },
          title: '$info.title',
          description: '$info.description',
          leasingUser: 1,
          'forms._id': 1,
          'forms.description': 1,
          'forms.required': 1,
          'forms.title': 1,
          'forms.type': 1,
          'forms.key': 1,
          'forms.createdAt': 1,
          'forms.updatedAt': 1,
        },
      },
    ]);
  }

  async getById(id: string): Promise<LeasingRef> {
    return this.leasingRefModel
      .findById(id)
      .populate({
        path: 'clubUser',
      })
      .populate({
        path: 'leasingUser',
      });
  }

  async getAll(page: number, aggregate: any[]): Promise<LeasingRef[]> {
    const options = { page: page, limit: 50 };
    const aggregation = this.leasingRefModel.aggregate<LeasingRef>(aggregate);
    return this.leasingRefModel.aggregatePaginate(aggregation, options);
  }

  async updateLeasingRefStatus(
    id: string,
    userId: string,
    status: LeasingRefStatusEnum,
    rejectionMessage: string
  ): Promise<LeasingRef> {
    switch (status) {
      case LeasingRefStatusEnum.ACCEPTED:
        // mark the document as __ACCEPTED__
        return this.acceptApplication(id);
      case LeasingRefStatusEnum.DECLINED:
        // mark the document as __DECLINED__ and push declineReasons to the reasons array
        return this.declineApplication(id, userId, rejectionMessage);
      case LeasingRefStatusEnum.PENDING:
      default:
        // mark the document as __PENDING__
        return this.pendApplication(id);
    }
  }

  private async acceptApplication(id: string): Promise<LeasingRef> {
    return this.leasingRefModel.findOneAndUpdate(
      { _id: id },
      { $set: { status: LeasingRefStatusEnum.ACCEPTED } },
      { new: true }
    );
  }

  private async pendApplication(id: string): Promise<LeasingRef> {
    return this.leasingRefModel.findOneAndUpdate(
      { _id: id },
      { $set: { status: LeasingRefStatusEnum.PENDING } },
      { new: true }
    );
  }

  private async declineApplication(id: string, userId: string, rejectionMessage: string): Promise<LeasingRef> {
    return this.leasingRefModel.findOneAndUpdate(
      { _id: id },
      {
        $set: { status: LeasingRefStatusEnum.DECLINED },
        $push: { declineReasons: { rejectedBy: userId, message: rejectionMessage, date: new Date() } },
      },
      { new: true }
    );
  }
}
