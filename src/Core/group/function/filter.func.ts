import { Types } from 'mongoose';

export const GroupAggregateFilter = (
  noname: number,
  users: number,
  search: string,
  mobile: string,
  groupId: string
) => {
  const ObjID = Types.ObjectId;
  let tmp = Array();

  tmp.push({ $match: { group: ObjID(groupId) } });

  if (users > 0) {
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
  }

  if (noname > 0) {
    tmp.push({
      $lookup: {
        from: 'cards',
        localField: 'card',
        foreignField: '_id',
        as: 'noname',
      },
    });
  }

  tmp.push({
    $addFields: {
      _id: { $arrayElemAt: ['$users._id', 0] },
      fullname: { $arrayElemAt: ['$users.fullname', 0] },
      mobile: { $arrayElemAt: ['$users.mobile', 0] },
      nationalcode: { $arrayElemAt: ['$users.nationalcode', 0] },
      birthdate: { $arrayElemAt: ['$users.birthdate', 0] },
      cardno: { $arrayElemAt: ['$cardinfo.cardno', 0] },
      secpin: { $arrayElemAt: ['$cardinfo.secpin', 0] },
      amount: { $arrayElemAt: ['$cardinfo.amount', 0] },
      cardId: { $arrayElemAt: ['$cardinfo._id', 0] },
      noname: { $arrayElemAt: ['$noname', 0] },
      mobileString: { $toString: { $toLong: { $arrayElemAt: ['$users.mobile', 0] } } },
      cardString: { $toString: { $toLong: { $arrayElemAt: ['$cardinfo.cardno', 0] } } },
      nonameString: { $toString: { $toLong: { $arrayElemAt: ['$noname.cardno', 0] } } },
    },
  });

  tmp.push({
    $match: {
      $or: [
        { mobileString: { $regex: mobile } },
        { nationalcode: { $regex: search } },
        { cardString: { $regex: search } },
        { nonameString: { $regex: search } },
      ],
    },
  });

  tmp.push({
    $project: {
      _id: 1,
      fullname: 1,
      mobile: 1,
      birthdate: 1,
      cardno: 1,
      secpin: 1,
      noname: 1,
      amount: 1,
      mobileString: 1,
      cardId: 1,
    },
  });

  return tmp;
};
