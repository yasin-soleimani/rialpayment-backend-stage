import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  successOptWithDataNoValidation,
} from '@vision/common';
import { BasketAddWinnerApiDto } from '../../../Api/basket/lottery/dto/winner.dto';

@Injectable()
export class BasketLotteryService {
  constructor(@Inject('BasketLotteryModel') private readonly lotteryModel: any) {}

  async createLottery(data) {
    return this.lotteryModel.create(data);
  }

  async getLotteriesByStore(store_id: string, masked = false) {
    if (masked) {
      const lottery = await this.lotteryModel.find({ store: store_id });
      if (lottery) return lottery.getMaskedMobiles();
      else return null;
    } else return this.lotteryModel.find({ store: store_id });
  }
  async getLotteryByStoreAndId(store_id: string, id: string, masked = false) {
    if (masked) {
      const lottery = await this.lotteryModel.findOne({ store: store_id, _id: id });
      if (lottery) return lottery.getMaskedMobiles();
      else return null;
    } else return this.lotteryModel.findOne({ store: store_id, _id: id });
  }

  async pushLottery(data: BasketAddWinnerApiDto, id: string, store_id: string) {
    const lottery = await this.lotteryModel.findOneAndUpdate(
      { _id: id, store: store_id },
      { $push: { winners: data } },
      { new: true }
    );
    return lottery;
  }

  async getLotteryByStoreAndDate(store_id: string, month, year, masked = false) {
    if (masked) {
      const lottery = await this.lotteryModel.findOne({ store: store_id, month, year }).sort({ createdAt: -1 });
      if (lottery) return lottery.getMaskedMobiles();
      else return null;
    } else return this.lotteryModel.findOne({ store: store_id, month, year }).sort({ createdAt: -1 });
  }
}
