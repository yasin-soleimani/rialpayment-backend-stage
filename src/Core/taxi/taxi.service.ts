import { Inject, Injectable } from '@vision/common';
import { Model, Types } from 'mongoose';
import { Taxi } from './interfaces/taxi.interface';

@Injectable()
export class TaxiCoreService {
  constructor(@Inject('TaxiModel') private readonly taxiModel: any | Model<Taxi>) {}

  async create(data: any): Promise<Taxi> {
    return this.taxiModel.create(data);
  }

  async update(taxiReqId: string, data: any): Promise<Taxi> {
    return this.taxiModel.findOneAndUpdate({ _id: taxiReqId }, { $set: data }, { new: true });
  }

  async getTaxiInquiryById(taxiInquiryId: string): Promise<Taxi> {
    return this.taxiModel.findOne({ _id: taxiInquiryId });
  }

  async getUserTaxiInquiryById(taxiInquiryId: string): Promise<Taxi[]> {
    return this.taxiModel.aggregate([
      {
        $match: {
          _id: Types.ObjectId(taxiInquiryId),
        },
      },
      {
        $project: {
          paid: 1,
          sepidPaid: 1,
          amount: 1,
          entityId: { $substrBytes: ['$entityId', 5, 20] },
          _id: 1,
          instituteId: 1,
          terminalID: 1,
          user: 1,
          referrer: 1,
          createdAt: 1,
          updatedAt: 1,
          'taxiInformation.firstName': 1,
          'taxiInformation.lastName': 1,
          'taxiInformation.identificationDesc': 1,
          'taxiInformation.imageUrl': 1,
          'taxiInformation.customData': 1,
        },
      },
    ]);
  }

  async getTaxiPaymentData(userid: string, page: number): Promise<Taxi> {
    const options = { page: page, limit: 20 };
    const aggregate = this.taxiModel.aggregate();
    aggregate.match({
      user: Types.ObjectId(userid),
      paid: true,
    });
    aggregate.sort({ createdAt: -1 });
    aggregate.project({
      paid: 1,
      sepidPaid: 1,
      amount: 1,
      entityId: { $substrBytes: ['$entityId', 5, 20] },
      _id: 1,
      instituteId: 1,
      terminalID: 1,
      user: 1,
      referrer: 1,
      createdAt: 1,
      updatedAt: 1,
      'taxiInformation.firstName': 1,
      'taxiInformation.lastName': 1,
      'taxiInformation.identificationDesc': 1,
      'taxiInformation.imageUrl': 1,
      'taxiInformation.customData': 1,
    });
    return this.taxiModel.aggregatePaginate(aggregate, options);
  }
}
