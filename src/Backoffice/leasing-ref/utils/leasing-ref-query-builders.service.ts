import { Injectable } from '@vision/common';
import { isNil } from '@vision/common/utils/shared.utils';
import { GetAllLeasingRefsFilters } from '../dto/leasing-ref-filters.dto';

@Injectable()
export class BackofficeLeasingRefQueryBuilderService {
  async getAllLeasingRefQueryBuilders(filters: GetAllLeasingRefsFilters): Promise<Array<any>> {
    const aggregate = [];
    aggregate.push(
      {
        $lookup: {
          from: 'users',
          localField: 'clubUser',
          foreignField: '_id',
          as: 'clubUser',
        },
      },
      {
        $unwind: {
          path: '$clubUser',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'leasingUser',
          foreignField: '_id',
          as: 'leasingUser',
        },
      },
      {
        $unwind: {
          path: '$leasingUser',
          preserveNullAndEmptyArrays: true,
        },
      }
    );
    if (!isNil(filters.q) && filters.q) {
      const regex = new RegExp(`${filters.q}`);
      aggregate.push({
        $addFields: {
          'clubUser.convertedMobile': { $toString: { $toLong: '$clubUser.mobile' } },
          'leasingUser.convertedMobile': { $toString: { $toLong: '$leasingUser.mobile' } },
        },
      });
      aggregate.push({
        $match: {
          $or: [
            { 'clubUser.convertedMobile': { $regex: regex } },
            { 'leasingUser.convertedMobile': { $regex: regex } },
            { 'clubUser.nationalcode': { $regex: regex } },
            { 'leasingUser.nationalcode': { $regex: regex } },
            { 'clubUser.fullname': { $regex: regex } },
            { 'leasingUser.fullname': { $regex: regex } },
          ],
        },
      });
    }
    if (!isNil(filters.status)) {
      aggregate.push({
        $match: {
          status: filters.status,
        },
      });
    }

    aggregate.push({
      $sort: {
        createdAt: -1,
      },
    });

    aggregate.push({
      $project: {
        _id: 1,
        status: 1,
        show: 1,
        public: 1,
        clubUser: {
          _id: '5bf63b7957eaed4600b77cb2',
          mobile: 1,
          nationalcode: 1,
          birthdate: 1,
          fullname: 1,
          account_no: 1,
          islegal: 1,
          legal: 1,
        },
        leasingUser: {
          _id: '5bf63b7957eaed4600b77cb2',
          mobile: 1,
          nationalcode: 1,
          birthdate: 1,
          fullname: 1,
          account_no: 1,
          islegal: 1,
          legal: 1,
        },
        declineReasons: 1,
        reformsDescriptions: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    });
    return aggregate;
  }
}
