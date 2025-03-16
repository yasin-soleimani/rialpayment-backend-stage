import { Inject, Injectable } from '@vision/common';
import { Types } from 'mongoose';

@Injectable()
export class CoreGroupSearch {
  constructor(
    @Inject('GroupUserModel') private readonly groupUserModel: any,
    @Inject('CardModel') private readonly cardModel: any
  ) {}

  async getSearch(userid: string, page: number, groupid: string, search: string, type: string): Promise<any> {
    switch (type) {
      case 'mobile': {
        const query = await this.mobileSearch(groupid, search, page);
        const aggregate = this.groupUserModel.aggregate(query);
        const options = { page, limit: 50 };
        return this.groupUserModel.aggregatePaginate(aggregate, options);
        break;
      }

      case 'nationalcode': {
        const query = await this.nationalCodeSearch(groupid, search, page);
        const aggregate = this.groupUserModel.aggregate(query);
        const options = { page, limit: 50 };
        return this.groupUserModel.aggregatePaginate(aggregate, options);
        break;
      }

      case 'card': {
        return await this.cardSearch(groupid, search, page);
        break;
      }
    }
  }

  /*async mobileSearch(groupid: string, search: string, page: number): Promise<any> {
    const ObjID = Types.ObjectId;
    let tmp = Array();
    tmp.push({ $match: { group: ObjID(groupid), user: { $exists: true } } });
    search = !isNaN(parseInt(search)) ? parseInt(search) + '' : '';
    /!*   if (!!search && typeof search !== 'undefined') {
      /!*const regSearch = new RegExp(search);
      tmp.push({
        $match: { mobileString: { $regex: regSearch, $options: 'i' } },
      });*!/
      tmp.push({
        $match: { '$users.mobile': search },
      });
    }*!/
    tmp.push({
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        pipeline: [
          !!search && typeof search !== 'undefined'
            ? {
                $match: { $expr: { $eq: ['$mobile', parseInt(search)] } },
              }
            : {},
        ],
        as: 'users',
      },
    });
    tmp.push({
      $lookup: {
        from: 'cards',
        localField: 'user',
        foreignField: 'user',
        as: 'cardinfo',
      },
    });
    tmp.push({
      $unwind: {
        path: '$users',
        preserveNullAndEmptyArrays: true,
      },
    });

    tmp.push({
      $addFields: {
        _id: '$users._id',
        fullname: '$users.fullname',
        mobile: '$users.mobile',
        nationalcode: '$users.nationalcode',
        birthdate: '$users.birthdate',
        avatar: '$users.avatar',
        cardno: { $arrayElemAt: ['$cardinfo.cardno', 0] },
        secpin: { $arrayElemAt: ['$cardinfo.secpin', 0] },
        amount: { $arrayElemAt: ['$cardinfo.amount', 0] },
        cardId: { $arrayElemAt: ['$cardinfo._id', 0] },
        noname: { $arrayElemAt: ['$noname', 0] },
        mobileString: { $toString: { $toLong: '$users.mobile' } },
        cardString: { $toString: { $toLong: { $arrayElemAt: ['$cardinfo.cardno', 0] } } },
        nonameString: { $toString: { $toLong: { $arrayElemAt: ['$noname.cardno', 0] } } },
      },
    });
    search = !isNaN(parseInt(search)) ? parseInt(search) + '' : '';
    if (!!search && typeof search !== 'undefined') {
      /!*const regSearch = new RegExp(search);
      tmp.push({
        $match: { mobileString: { $regex: regSearch, $options: 'i' } },
      });*!/
      tmp.push({
        $match: { mobileString: search },
      });
    }

    tmp.push({
      $project: {
        _id: 1,
        fullname: 1,
        mobile: 1,
        birthdate: 1,
        cardno: 1,
        secpin: 1,
        nationalcode: 1,
        noname: 1,
        amount: 1,
        avatar: 1,
        mobileString: 1,
        cardId: 1,
      },
    });
    return tmp;
  }*/

  async mobileSearch(groupid: string, search: string, page: number): Promise<any> {
    const ObjID = Types.ObjectId;
    let tmp = Array();
    tmp.push({ $match: { group: ObjID(groupid), user: { $exists: true } } });
    tmp.push({
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'users',
      },
    });
    tmp.push({
      $lookup: {
        from: 'cards',
        localField: 'user',
        foreignField: 'user',
        as: 'cardinfo',
      },
    });
    tmp.push({
      $unwind: {
        path: '$users',
        preserveNullAndEmptyArrays: true,
      },
    });

    tmp.push({
      $addFields: {
        _id: '$users._id',
        fullname: '$users.fullname',
        mobile: '$users.mobile',
        nationalcode: '$users.nationalcode',
        birthdate: '$users.birthdate',
        avatar: '$users.avatar',
        cardno: { $arrayElemAt: ['$cardinfo.cardno', 0] },
        secpin: { $arrayElemAt: ['$cardinfo.secpin', 0] },
        amount: { $arrayElemAt: ['$cardinfo.amount', 0] },
        cardId: { $arrayElemAt: ['$cardinfo._id', 0] },
        noname: { $arrayElemAt: ['$noname', 0] },
        mobileString: { $toString: { $toLong: '$users.mobile' } },
        cardString: { $toString: { $toLong: { $arrayElemAt: ['$cardinfo.cardno', 0] } } },
        nonameString: { $toString: { $toLong: { $arrayElemAt: ['$noname.cardno', 0] } } },
      },
    });
    search = !isNaN(parseInt(search)) ? parseInt(search) + '' : '';
    if (!!search && typeof search !== 'undefined') {
      /*const regSearch = new RegExp(search);
      tmp.push({
        $match: { mobileString: { $regex: regSearch, $options: 'i' } },
      });*/
      tmp.push({
        $match: { mobileString: search },
      });
    }

    tmp.push({
      $project: {
        _id: 1,
        fullname: 1,
        mobile: 1,
        birthdate: 1,
        cardno: 1,
        secpin: 1,
        nationalcode: 1,
        noname: 1,
        amount: 1,
        avatar: 1,
        mobileString: 1,
        cardId: 1,
      },
    });
    return tmp;
  }

  async nationalCodeSearch(groupid: string, search: string, page: number): Promise<any> {
    const ObjID = Types.ObjectId;
    let tmp = Array();
    tmp.push({ $match: { group: ObjID(groupid), user: { $exists: true } } });
    tmp.push({
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'users',
      },
    });
    tmp.push({
      $lookup: {
        from: 'cards',
        localField: 'user',
        foreignField: 'user',
        as: 'cardinfo',
      },
    });
    tmp.push({
      $unwind: {
        path: '$users',
        preserveNullAndEmptyArrays: true,
      },
    });

    tmp.push({
      $addFields: {
        _id: '$users._id',
        fullname: '$users.fullname',
        mobile: '$users.mobile',
        nationalcode: '$users.nationalcode',
        birthdate: '$users.birthdate',
        avatar: '$users.avatar',
        cardno: { $arrayElemAt: ['$cardinfo.cardno', 0] },
        secpin: { $arrayElemAt: ['$cardinfo.secpin', 0] },
        amount: { $arrayElemAt: ['$cardinfo.amount', 0] },
        cardId: { $arrayElemAt: ['$cardinfo._id', 0] },
        noname: { $arrayElemAt: ['$noname', 0] },
        mobileString: { $toString: { $toLong: '$users.mobile' } },
        cardString: { $toString: { $toLong: { $arrayElemAt: ['$cardinfo.cardno', 0] } } },
        nonameString: { $toString: { $toLong: { $arrayElemAt: ['$noname.cardno', 0] } } },
      },
    });
    if (!!search && typeof search !== 'undefined') {
      /*const regSearch = new RegExp(search);
      tmp.push({
        $match: { nationalcode: { $regex: regSearch, $options: 'i' } },
      });*/
      tmp.push({
        $match: { nationalcode: search },
      });
    }
    tmp.push({
      $project: {
        _id: 1,
        fullname: 1,
        nationalcode: 1,
        mobile: 1,
        birthdate: 1,
        cardno: 1,
        secpin: 1,
        noname: 1,
        amount: 1,
        mobileString: 1,
        avatar: 1,
        cardId: 1,
      },
    });
    return tmp;
  }

  async cardSearch(groupid: string, search: string, page: number): Promise<any> {
    const cardInfo = await this.cardModel.findOne({ cardno: search }).populate('user');
    if (!cardInfo) return { docs: [] };

    if (cardInfo.user) {
      const groupInfo = await this.groupUserModel.find({ group: groupid, user: cardInfo.user._id });
      if (!groupInfo) return { docs: [] };

      return {
        docs: [
          {
            _id: cardInfo.user._id,
            fullname: cardInfo.user.fullname,
            mobile: cardInfo.user.mobile,
            birthdate: cardInfo.user.birthdate,
            nationalcode: cardInfo.user.nationalcode,
            cardno: cardInfo.cardno,
            secpin: cardInfo.secpin,
            noname: null,
            amount: cardInfo.amount,
            avatar: cardInfo.user.avatar,
            card: cardInfo,
            mobileString: '0' + cardInfo.user.mobile,
            cardId: cardInfo._id,
          },
        ],
      };
    } else {
      const groupInfo = await this.groupUserModel.find({ group: groupid, card: cardInfo._id });
      if (!groupInfo) return { docs: [] };

      return {
        docs: [
          {
            _id: cardInfo._id,
            fullname: null,
            mobile: null,
            birthdate: null,
            cardno: cardInfo.cardno,
            secpin: cardInfo.secpin,
            nationalcode: null,
            noname: cardInfo,
            amount: cardInfo.amount,
            avatar: '',
            mobileString: null,
            cardId: cardInfo._id,
          },
        ],
      };
    }
  }
}
