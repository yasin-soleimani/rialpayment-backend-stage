import { Injectable, successOptWithDataNoValidation, Inject } from '@vision/common';
import { GroupCoreService } from '../../../../Core/group/group.service';
import { Types } from 'mongoose';
import { GroupCoreUsersCardsService } from '../../../../Core/group/services/group-users-card.service';

@Injectable()
export class AnalyzeCardCoreService {
  constructor(
    private readonly groupService: GroupCoreService,
    @Inject('CardModel') private readonly cardModel: any,
    private readonly groupUsersService: GroupCoreUsersCardsService
  ) {}

  async getGroupList(userid: string): Promise<any> {
    return this.groupService.getGroupNames(userid);
  }

  async cardAmountWithZeroAmount(groupid): Promise<any> {
    return this.cardModel.count({
      amount: { $lte: 1000 },
      group: groupid,
    });
  }

  async getUsedCard(cardId: number, firstCharge: number): Promise<any> {
    return this.cardModel.count({
      cardno: cardId,
      amount: { $lt: firstCharge },
    });
  }

  async getCalcTotal(groupid: string): Promise<any> {
    let ObjID = Types.ObjectId;
    let aggregate = this.cardModel.aggregate();
    aggregate.match({
      group: ObjID(groupid),
    });

    aggregate.group({
      _id: null,
      amount: { $sum: '$amount' },
      cards: {
        $push: '$cardno',
      },
      cardsId: {
        $push: '$_id',
      },
    });

    return aggregate;
  }

  async getCardsList(groupid: string): Promise<any> {
    return this.groupUsersService.getCalc(groupid);
  }
}
