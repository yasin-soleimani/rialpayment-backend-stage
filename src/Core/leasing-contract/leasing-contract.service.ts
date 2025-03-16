import { Inject, Injectable } from '@vision/common';
import { FilterQuery } from 'mongoose';
import { AggregatePaginateModel, PaginateOptions } from '../../utils/types.util';
import { LeasingContractStatusEnum } from './enums/leasing-contract-status.enum';
import { LeasingContract, LeasingContractDocument } from './interfaces/leasing-contract.interface';

@Injectable()
export class LeasingContractCoreService {
  constructor(
    @Inject('LeasingContractModel')
    private readonly leasingContractModel: AggregatePaginateModel<LeasingContractDocument>
  ) {}

  async add(dto: LeasingContract): Promise<LeasingContractDocument> {
    return this.leasingContractModel.create(dto);
  }

  async getByLeasingUser(query: FilterQuery<LeasingContractDocument>): Promise<LeasingContractDocument[]> {
    return this.leasingContractModel
      .find(query)
      .populate({ path: 'leasingRef' })
      .populate({ path: 'leasingRef.clubUser', select: { fullname: 1, avatar: 1, mobile: 1, legal: 1, islegal: 1 } })
      .sort({
        status: -1,
      });
  }

  async getById(id: string): Promise<LeasingContractDocument> {
    return this.leasingContractModel.findById(id);
  }

  async delete(id: string): Promise<LeasingContractDocument> {
    return this.leasingContractModel.findOneAndUpdate({ _id: id }, { deleted: true }, { new: true });
  }

  async update(id: string, dto: Partial<LeasingContract>): Promise<LeasingContractDocument> {
    return this.leasingContractModel.findOneAndUpdate({ _id: id }, { $set: { ...dto } }, { new: true });
  }

  async getExpiredContractById(contractId: string): Promise<LeasingContract> {
    const now = new Date();
    return this.leasingContractModel.findOne({ _id: contractId, expiresAt: { $lte: now } }).lean();
  }

  async findCurrentlyActiveContractByLeasingUser(userId: string): Promise<LeasingContract> {
    const now = new Date();
    return this.leasingContractModel
      .findOne({
        leasingUser: userId,
        status: LeasingContractStatusEnum.ACCEPTED,
        expiresAt: { $gt: now },
        deleted: false,
      })
      .lean();
  }

  async getAll(page: number, aggregateQuery: any): Promise<LeasingContractDocument[]> {
    const options: PaginateOptions = {
      page,
      limit: 10,
    };
    const aggregate = this.leasingContractModel.aggregate(aggregateQuery);
    return this.leasingContractModel.aggregatePaginate(aggregate, options);
  }

  async decreaseLeasingContractRemain(leasingUser: string, amount: number): Promise<LeasingContract> {
    console.log({ leasingUser, amount });
    return this.leasingContractModel.findOneAndUpdate({ leasingUser }, { $inc: { remain: -amount } });
  }

  async getInvalidContractByLeasingRef(id: string): Promise<LeasingContract> {
    const now = new Date();
    console.log('now ', now);
    return this.leasingContractModel.findOne({
      leasingRef: id,
      status: LeasingContractStatusEnum.ACCEPTED,
      deleted: false,
      $or: [{ expiresAt: { $lte: now } }, { remain: { $eq: 0 } }],
    });
  }

  async getByLeasingRef(leasingRefId: string): Promise<LeasingContract[]> {
    return this.leasingContractModel
      .find({ leasingRef: leasingRefId })
      .populate({ path: 'leasingRef' })
      .populate({ path: 'leasingRef.clubUser', select: { fullname: 1, avatar: 1, mobile: 1, legal: 1, islegal: 1 } });
  }
}
