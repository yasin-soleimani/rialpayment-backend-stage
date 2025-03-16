import { Inject, Injectable } from '@vision/common';
import { FilterQuery, Types } from 'mongoose';
import { AggregatePaginateModel, PaginateOptions, PaginateResult } from '../../utils/types.util';
import { CreateLeasingApplyDto } from './dto/create-leasing-apply.dto';
import { UpdateLeasingApplyDto } from './dto/update-leasing-apply.dto';
import { LeasingApplyStatusEnum } from './enums/leasing-apply-status.enum';
import { LeasingApply, LeasingApplyDocument, LeasingApplyFormField } from './interfaces/leasing-apply.interface';

@Injectable()
export class LeasingApplyCoreService {
  constructor(
    @Inject('LeasingApplyModel') private readonly leasingApplyModel: AggregatePaginateModel<LeasingApplyDocument>
  ) {}

  async getPendingOrDeclinedApplyByLeasingUser(userId: string): Promise<LeasingApplyDocument> {
    return this.leasingApplyModel
      .findOne({
        leasingUser: userId,
        status: { $nin: [LeasingApplyStatusEnum.ACCEPTED, LeasingApplyStatusEnum.ACCEPTED_BY_LEASING] },
      })
      .lean();
  }

  async getByApplicantAndLeasingUser(applicant: string, leasingUser: string): Promise<LeasingApplyDocument> {
    return this.leasingApplyModel.findOne({
      leasingUser,
      applicant,
      $or: [
        { status: LeasingApplyStatusEnum.PENDING },
        // { status: LeasingApplyStatusEnum.ACCEPTED },
        { status: LeasingApplyStatusEnum.ACCEPTED_BY_LEASING },
      ],
    });
  }

  async getList(page: number, aggregate: any): Promise<PaginateResult<LeasingApplyDocument>> {
    const options: PaginateOptions = {
      limit: 50,
      page,
    };
    const appliesAggregate = this.leasingApplyModel.aggregate(aggregate);
    return this.leasingApplyModel.aggregatePaginate(appliesAggregate, options);
  }

  async getAll(page: number): Promise<PaginateResult<LeasingApply>> {
    const options: PaginateOptions = {
      limit: 50,
      page,
      sort: { createdAt: -1 },
      populate: [
        {
          path: 'applicant',
          select: {
            fullname: 1,
            mobile: 1,
            nationalcode: 1,
            birthdate: 1,
            islegal: 1,
            legal: 1,
          },
        },
        {
          path: 'leasingOption',
        },
        {
          path: 'leasingUser',
          select: {
            fullname: 1,
            mobile: 1,
            nationalcode: 1,
            birthdate: 1,
            islegal: 1,
            legal: 1,
          },
        },
        {
          path: 'leasingInfo',
          select: {
            _id: 1,
            title: 1,
            description: 1,
            logo: 1,
          },
        },
      ],
    };
    const query: FilterQuery<LeasingApplyDocument> = {};
    return this.leasingApplyModel.paginate(query, options);
  }

  async getById(id: string): Promise<LeasingApplyDocument[]> {
    return this.leasingApplyModel.aggregate([
      {
        $match: {
          _id: Types.ObjectId(id),
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
          localField: 'leasingUser',
          foreignField: 'leasingUser',
          as: 'leasingInfo',
        },
      },
      {
        $unwind: {
          path: '$leasinginfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'applicant',
          foreignField: '_id',
          as: 'applicant',
        },
      },
      {
        $unwind: {
          path: '$applicant',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          leasingUser: 1,
          leasingOption: 1,
          status: 1,
          declineReasons: 1,
          createdAt: 1,
          updatedAt: 1,
          confirmDescription: 1,
          'form.title': 1,
          'form.key': 1,
          'form.type': 1,
          'form.value': 1,
          'applicant.avatar': { $concat: [process.env.SITE_URL, '$applicant.avatar'] },
          'applicant.birthdate': 1,
          'applicant.fathername': 1,
          'applicant.fullname': 1,
          'applicant.islegal': 1,
          'applicant.legal': 1,
          'applicant.mobile': 1,
          'applicant.nationalcode': 1,
          'applicant._id': 1,
          leasingInfo: 1,
        },
      },
    ]);
  }

  async getByIdForUser(id: string): Promise<LeasingApply[]> {
    return this.leasingApplyModel.aggregate([
      {
        $match: {
          _id: Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: 'leasinginfos',
          localField: 'leasingUser',
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
        $project: {
          _id: 1,
          leasingUser: 1,
          applicant: 1,
          leasingOption: 1,
          status: 1,
          declineReasons: 1,
          createdAt: 1,
          updatedAt: 1,
          confirmDescription: 1,
          'leasingInfo._id': 1,
          'leasingInfo.title': 1,
          'leasingInfo.description': 1,
          'leasingInfo.logo': { $concat: [process.env.SITE_URL, '$leasingInfo.logo'] },
          'form.title': 1,
          'form.key': 1,
          'form.type': 1,
          'form.value': 1,
        },
      },
    ]);
  }

  async create(dto: CreateLeasingApplyDto): Promise<LeasingApplyDocument> {
    return this.leasingApplyModel.create({ ...dto, deleted: false, declineReasons: [] });
  }

  async deleteApplyDocument(id: string): Promise<LeasingApplyDocument> {
    return this.leasingApplyModel.findOneAndUpdate({ _id: id }, { $set: { deleted: true } }, { new: true });
  }

  async updateByApplicant(
    userId: any,
    leasingApplyId: string,
    dto: LeasingApplyFormField
  ): Promise<LeasingApplyDocument> {
    return this.leasingApplyModel.findOneAndUpdate(
      { _id: leasingApplyId, applicant: userId, 'form.key': dto.key },
      {
        $set: {
          'form.$.value': dto.value,
          status: LeasingApplyStatusEnum.PENDING,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
  }

  async getByApplicant(userId: string): Promise<LeasingApply[]> {
    return this.leasingApplyModel.aggregate([
      {
        $match: {
          applicant: Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'leasinginfos',
          localField: 'leasingUser',
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
        $sort: {
          createdAt: -1,
        },
      },
      {
        $project: {
          _id: 1,
          leasingUser: 1,
          leasingOption: 1,
          status: 1,
          declineReasons: 1,
          createdAt: 1,
          updatedAt: 1,
          confirmDescription: 1,
          'leasingInfo._id': 1,
          'leasingInfo.title': 1,
          'leasingInfo.description': 1,
          'leasingInfo.logo': { $concat: [process.env.SITE_URL, '$leasingInfo.logo'] },
          'form.title': 1,
          'form.key': 1,
          'form.type': 1,
          'form.value': 1,
          'form.required': 1,
        },
      },
    ]);
  }

  async updateStatus(id: string, dto: UpdateLeasingApplyDto): Promise<LeasingApplyDocument> {
    switch (dto.status) {
      case LeasingApplyStatusEnum.ACCEPTED:
        return this.acceptApplication(id);
      case LeasingApplyStatusEnum.ACCEPTED_BY_LEASING:
        // mark the document as __ACCEPTED_By_LEASING__
        return this.acceptApplicationByLeasing(id, dto.message);
      case LeasingApplyStatusEnum.DECLINED:
        // mark the document as __DECLINED__ and push declineReasons to the reasons array
        return this.declineApplication(id, dto.message);
      case LeasingApplyStatusEnum.PENDING:
      default:
        // mark the document as __PENDING__
        return this.pendApplication(id);
    }
  }

  private async acceptApplication(id: string): Promise<LeasingApplyDocument> {
    return this.leasingApplyModel
      .findOneAndUpdate({ _id: id }, { $set: { status: LeasingApplyStatusEnum.ACCEPTED, isOnProgress: true } })
      .populate([
        {
          path: 'leasingOption',
        },
        {
          path: 'leasingUser',
        },
        {
          path: 'applicant',
        },
      ]);
  }

  private async acceptApplicationByLeasing(id: string, message: string): Promise<LeasingApplyDocument> {
    return this.leasingApplyModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          status: LeasingApplyStatusEnum.ACCEPTED_BY_LEASING,
          confirmDescription: { message: message, date: new Date() },
        },
      },
      { new: true }
    );
  }

  private async pendApplication(id: string): Promise<LeasingApplyDocument> {
    return this.leasingApplyModel.findOneAndUpdate(
      { _id: id },
      { $set: { status: LeasingApplyStatusEnum.PENDING } },
      { new: true }
    );
  }

  private async declineApplication(id: string, rejectionMessage: string): Promise<LeasingApplyDocument> {
    return this.leasingApplyModel.findOneAndUpdate(
      { _id: id },
      {
        $set: { status: LeasingApplyStatusEnum.DECLINED },
        $push: { declineReasons: { $each: [{ message: rejectionMessage, date: new Date() }], $position: 0 } },
      },
      { new: true }
    );
  }

  async setInvoiceId(applyId: string, invoiceid: any): Promise<LeasingApply> {
    return this.leasingApplyModel.findOneAndUpdate({ _id: applyId }, { $set: { invoiceid } }, { new: true });
  }

  async getByInvoiceId(invoiceId: string): Promise<LeasingApply> {
    return this.leasingApplyModel.findOne({ invoiceId }).populate([
      {
        path: 'leasingOption',
      },
      {
        path: 'leasingUser',
      },
      {
        path: 'applicant',
      },
    ]);
  }

  async setAsPaid(id: string): Promise<LeasingApplyDocument> {
    return this.leasingApplyModel.findOneAndUpdate({ _id: id }, { $set: { paidByLeasing: true } }, { new: true });
  }
}
