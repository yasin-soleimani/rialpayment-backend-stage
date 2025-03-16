import { Injectable, Inject } from '@vision/common';
import { Model, Types } from 'mongoose';
import { IdentifyCoreDto } from './dto/identify.dto';

@Injectable()
export class IdentifyCoreService {
  constructor(@Inject('IdentifyModel') private readonly identifyModel: any) {}

  async addnew(userid: string, front: string, back: string, nationalcode: string, cardno: string): Promise<any> {
    return this.identifyModel.create({
      user: userid,
      ninfront: front,
      ninback: back,
      nationalcode: nationalcode,
      cardno: cardno,
    });
  }

  async getUserLastUploadIdentifyData(userid: string): Promise<any> {
    return this.identifyModel.findOne({ user: userid }).sort({ createdAt: -1 });
  }

  async getLastUploadWithRejectionStatus(userid: string): Promise<any> {
    return this.identifyModel.aggregate([
      {
        $match: {
          user: Types.ObjectId(userid),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: 'useridentifyrejects',
          localField: 'user',
          foreignField: 'user',
          as: 'reject',
        },
      },
      {
        $project: {
          _id: 1,
          ninfront: 1,
          nationalcode: 1,
          status: 1,
          reject: 1,
        },
      },
    ]);
  }

  async getIdentifyList(userid: string, page: number): Promise<any> {
    return this.identifyModel.paginate({ user: userid }, { page, sort: { createdAt: -1 }, limit: 50 });
  }

  async changeStatus(userid: string, status: boolean): Promise<any> {
    return this.identifyModel.find({ user: userid }).then((res) => {
      for (const info of res) {
        this.identifyModel
          .findOneAndUpdate({ _id: info._id }, { status: status })
          .then((res) => console.log(res, 'res'));
      }

      return res;
    });
  }

  async getList(page: number): Promise<any> {
    let aggregate = this.identifyModel.aggregate();

    aggregate.match({
      $or: [{ status: false }, { status: { $exists: false } }],
    });
    aggregate.lookup({
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'userx',
    });
    aggregate.group({
      _id: '$userx._id',
      ninefront: { $last: '$ninfront' },
      nineback: { $last: '$ninback' },
      nationalcodex: { $last: '$nationalcode' },
      cardnox: { $last: '$cardno' },
      mobile: { $first: '$$ROOT.userx.mobile' },
      fullname: { $first: '$$ROOT.userx.fullname' },
      place: { $first: '$$ROOT.userx.place' },
      nationalcode: { $first: '$$ROOT.userx.nationalcode' },
      fathername: { $first: '$$ROOT.userx.fathername' },
      birthdate: { $first: '$$ROOT.userx.birthdate' },
      cardno: { $first: '$$ROOT.userx.cardno' },
    });
    var options = { page: page, limit: 50 };
    return this.identifyModel.aggregatePaginate(aggregate, options);

    // return this.identifyModel.paginate({ },
    //   { page , populate: 'user' ,sort : { createdAt : -1 }, limit : 50 }).catch( err => {
    //   console.log( err , 'err');
    //   return err;
    // })
  }
}
