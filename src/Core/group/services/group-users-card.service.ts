import { Inject, Injectable } from '@vision/common';
import { Types } from 'mongoose';
import * as mongoose from 'mongoose';

@Injectable()
export class GroupCoreUsersCardsService {
  constructor(@Inject('GroupUserModel') private readonly groupUserModel: any) {}
  async calcs(groupId: string): Promise<any> {
    const data = await this.groupUserModel
      .find({ group: groupId })
      .populate({ path: 'user card', populate: 'card user' });
    let users = Array();
    let cards = Array();
    let cardId = Array();

    for (const item of data) {
      if (item.user) {
        users.push(item.user._id);
        cards.push(item.user.card.cardno);
        cardId.push(item.user.card._id);
      } else {
        if (item.card.user) {
          users.push(item.card.user._id);
          cards.push(item.card.cardno);
          cardId.push(item.card._id);
        } else {
          if (item.card) {
            cards.push(item.card.cardno);
            cardId.push(item.card._id);
          }
        }
      }
    }
    return [
      {
        users: users,
        cardsNo: cards,
        cardId: cardId,
      },
    ];
  }
  async calcsAll(groupIds: string[]): Promise<any> {
    const data = await this.groupUserModel
      .find({ group: { $in: groupIds } })
      .populate({ path: 'user card', populate: 'card user' });
    let users = Array();
    let cards = Array();
    let cardId = Array();

    for (const item of data) {
      if (item.user) {
        users.push(item.user._id);
        if (item.user.card) {
          cards.push(item.user.card.cardno);
          cardId.push(mongoose.Types.ObjectId(item.user.card._id));
        }
      } else {
        if (item.card)
          if (item.card.user) {
            users.push(item.card.user._id);
            cards.push(item.card.cardno);
            cardId.push(item.card._id);
          } else {
            if (item.card) {
              cards.push(item.card.cardno);
              cardId.push(mongoose.Types.ObjectId(item.card._id));
            }
          }
      }
    }
    return {
      users: users,
      cardsNo: cards,
      cardId: cardId,
    };
  }
  async getCalc(groupId: string): Promise<any> {
    return this.calcs(groupId);
    // let ObjID = Types.ObjectId;
    // const qry = await this.getQuery(groupId);
    // console.log(qry);
    // return this.groupUserModel.aggregate(qry);
  }

  async getCalcAll(groupIds: string[]): Promise<any> {
    return this.calcsAll(groupIds);
    // let ObjID = Types.ObjectId;
    // const qry = await this.getQuery(groupId);
    // console.log(qry);
    // return this.groupUserModel.aggregate(qry);
  }

  async getQuery(groupId: string): Promise<any> {
    const noname = await this.groupUserModel.count({ group: groupId, card: { $exists: true } });
    const userCount = await this.groupUserModel.count({ group: groupId, user: { $exists: true } });

    const ObjID = Types.ObjectId;
    let tmp = Array();

    tmp.push({ $match: { group: ObjID(groupId) } });

    if (userCount.length > 1) {
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
          path: '$userInfo',
        },
      });

      tmp.push({
        $unwind: {
          path: '$cardInfo',
        },
      });
    }

    if (noname.length > 1) {
      tmp.push({
        $lookup: {
          from: 'cards',
          localField: 'card',
          foreignField: '_id',
          as: 'noname',
        },
      });

      tmp.push({
        $unwind: {
          path: '$userInfo',
        },
      });
    }

    tmp.push({
      $group: {
        _id: null,
        users: {
          $push: '$userInfo._id',
        },
        cardsNo: {
          $push: {
            $cond: { if: { $exists: ['$cardInfo', true] }, then: '$cardInfo.cardno', else: '$noname.cardno' },
          },
        },
        cards: {
          $push: '$cardInfo._id',
        },
      },
    });

    return tmp;
  }
}

// ,{
//   $lookup: {
//     from: 'organizationnewcharges',
//     localField: 'userInfo._id',
//     foreignField: 'user',
//     as: 'userOrganization'
//   }
// },{
//   $lookup: {
//     from: 'organizationnewcharges',
//     localField: 'cardInfo._id',
//     foreignField: 'card',
//     as: 'cardOrganization'
//   },
// }

// [
//   { $match: { group: ObjID(groupId) } },
//   {
//     $lookup: {
//       from: 'users',
//       localField: 'user',
//       foreignField: '_id',
//       as: 'userInfo',
//     },
//   },
//   {
//     $lookup: {
//       from: 'cards',
//       localField: 'userInfo._id',
//       foreignField: 'user',
//       as: 'cardInfo',
//     },
//   },
//   {
//     $unwind: {
//       path: '$userInfo',
//     },
//   },
//   {
//     $unwind: {
//       path: '$cardInfo',
//     },
//   },
//   {
//     $group: {
//       _id: null,
//       users: {
//         $push: '$userInfo._id',
//       },
//       cardsNo: {
//         $push: '$cardInfo.cardno',
//       },
//       cards: {
//         $push: '$cardInfo._id',
//       },
//     },
//   },
// ]
