import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  successOpt,
  successOptWithDataNoValidation,
} from '@vision/common';
import { BasketLotteryService } from '../../../Core/basket/lottery/lottery.service';
import mongoose from 'mongoose';
import { BasketStoreCoreService } from '../../../Core/basket/store/basket-store.service';
import { BasketAddLotteryApiDto } from './dto/add-lottery.dto';
import { BasketAddWinnerApiDto } from './dto/winner.dto';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';

@Injectable()
export class BasketLotteryApiService {
  constructor(
    private readonly lotteryModel: BasketLotteryService,
    private readonly storeModel: BasketStoreCoreService,
    private readonly usersService: UserService
  ) {}

  async createLottery(data: BasketAddLotteryApiDto, userid: string) {
    const store = await this.storeModel.getInfo(userid);
    if (!store) throw new NotFoundException('فروشگاه یافت نشد');
    const lotteryExist = await this.lotteryModel.getLotteryByStoreAndDate(store._id, data.month, data.year, false);
    console.log(lotteryExist);
    if (!!lotteryExist) throw new BadRequestException('قبلا برای این تاریخ یک قرعه کشی ثبت شده است');
    const lotteryData = {
      store: store._id,
      month: data.month,
      year: data.year,
      winners: [],
    };
    this.lotteryModel.createLottery(lotteryData);
    return successOpt();
  }

  async getLotteries(userid: string) {
    const store = await this.storeModel.getInfo(userid);
    if (!store) throw new NotFoundException('فروشگاه یافت نشد');
    const lotteries = await this.lotteryModel.getLotteriesByStore(store._id);
    return successOptWithDataNoValidation(lotteries);
  }

  async getLotteryWithMobiles(userid: string, lottery: string) {
    const store = await this.storeModel.getInfo(userid);
    if (!store) throw new NotFoundException('فروشگاه یافت نشد');
    const lotteryData = await this.lotteryModel.getLotteryByStoreAndId(store._id, lottery);
    return successOptWithDataNoValidation(lotteryData);
  }

  async addWinner(data: BasketAddWinnerApiDto, userid: string, lottery: string) {
    const store = await this.storeModel.getInfo(userid);
    if (!store) throw new NotFoundException('فروشگاه یافت نشد');
    const lotteryData = await this.lotteryModel.getLotteryByStoreAndId(store._id, lottery);
    if (!lotteryData) throw new NotFoundException('قرعه کشی یافت نشد');
    if (!data.mobile || !data.amount) throw new FillFieldsException();
    const user = await this.usersService.findByMobileUser(data.mobile);
    console.log(user.fullname);
    if (!!user && !!user.fullname) data.fullName = user.fullname;
    else data.fullName = '';
    return successOptWithDataNoValidation(await this.lotteryModel.pushLottery(data, lottery, store._id));
  }
}
