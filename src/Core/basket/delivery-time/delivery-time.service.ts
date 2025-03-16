import { Inject, Injectable } from '@vision/common';
import { Model, Types } from 'mongoose';
import { BasketDeliveryTimeDto, UpdateDeliveryTimeDto } from './dto/delivery-time.dto';
import { BasketDeliveryTime } from './interfaces/delivery-time.interface';
import * as moment from 'jalali-moment';
import { BasketShopCoreService } from '../shop/service/shop.service';
@Injectable()
export class DeliveryTimeService {
  constructor(
    @Inject('BasketDeliveryTimeModel') private readonly basketDeliveryTimeModel: Model<BasketDeliveryTime>,
    private readonly basketShopCoreService: BasketShopCoreService
  ) {}

  async create(basketStoreId: string, dto: BasketDeliveryTimeDto): Promise<BasketDeliveryTime> {
    const data = {
      basketStore: basketStoreId,
      ...dto,
    };
    return this.basketDeliveryTimeModel.create(data);
  }

  async getById(deliveryTime: string): Promise<BasketDeliveryTime> {
    return this.basketDeliveryTimeModel.findOne({ _id: deliveryTime });
  }

  async update(
    basketStoreId: string,
    deliveryRangeId: string,
    dto: UpdateDeliveryTimeDto
  ): Promise<BasketDeliveryTime> {
    return this.basketDeliveryTimeModel.findOneAndUpdate(
      { _id: deliveryRangeId, basketStore: basketStoreId },
      { ...dto },
      { upsert: true, new: true }
    );
  }

  async getByBasketStoreId(store: any): Promise<BasketDeliveryTime[]> {
    const storeId = store._id;
    const storeUserId = store.user._id;
    const deliveryTimeout = store.deliveryTimeout ?? 0;
    const today = moment().toISOString();
    const daysToGoBack = deliveryTimeout > 0 ? 7 + deliveryTimeout : 6;
    const nDaysAgo = moment().add(-daysToGoBack, 'day').startOf('day').toISOString();

    const times = await this.basketDeliveryTimeModel.find({ basketStore: storeId }).lean();

    const temp = [];
    for (let i = 0; i < times.length; i++) {
      const element = times[i];
      const lastNDaysPurchasesCount = await this.basketShopCoreService.getLastNthDaysShopsByStoreId(
        storeUserId,
        element._id,
        today,
        nDaysAgo
      );

      temp.push({ ...element, purchasesCount: lastNDaysPurchasesCount });
    }

    return temp;
  }

  async getAvailableTimes(store: any): Promise<any[]> {
    const storeId = store._id;
    const storeUserId = store.user._id;
    const deliveryTimeout = store.deliveryTimeout ?? 0;

    const storeDeliveryTimes = await this.basketDeliveryTimeModel.find({ basketStore: storeId, status: true }).lean();
    if (storeDeliveryTimes.length === 0) {
      return storeDeliveryTimes;
    }

    const today = moment().toISOString();
    const daysToGoBack = deliveryTimeout > 0 ? 7 + deliveryTimeout : 6;
    const sevenDaysAgo = moment().add(-daysToGoBack, 'day').startOf('day').toISOString();

    const maxLength = storeDeliveryTimes.length;
    const tempResult = [];

    const nextPossibleSevenDays = [];
    for (let index = 0; index < 7; index++) {
      const thisDay = index + deliveryTimeout;
      const thisMoment = moment().locale('fa');
      const day = thisMoment.add(thisDay, 'day');
      nextPossibleSevenDays.push({
        date: day.toISOString(),
        day: day.isoWeekday(),
        isToday: thisDay === 0,
        time: thisMoment.format('HH:mm'),
        dayName: day.format('dddd'),
      });
    }

    for (let index = 0; index < maxLength; index++) {
      const element = storeDeliveryTimes[index];
      const deliveryTimeId = element._id;
      const lastSevenDaysPurchasesCount = await this.basketShopCoreService.getLastNthDaysShopsByStoreId(
        storeUserId,
        deliveryTimeId,
        today,
        sevenDaysAgo
      );

      const possibleDate = nextPossibleSevenDays.find((el) => el.day === element.day);

      let status = element.status && element.capacity > lastSevenDaysPurchasesCount;
      if (possibleDate.isToday) {
        const hour = parseInt(element.startTime.split(':')[0]);
        const currentHour = parseInt(possibleDate.time.split(':')[0]);

        if (hour > currentHour) {
          const data = {
            _id: deliveryTimeId,
            startTime: element.startTime,
            endTime: element.endTime,
            timeRange: element.startTime + ' - ' + element.endTime,
            status: status,
            day: element.day,
            date: possibleDate?.date,
            dayName: possibleDate?.dayName,
          };
          tempResult.push(data);
        }
      } else {
        const data = {
          _id: deliveryTimeId,
          startTime: element.startTime,
          endTime: element.endTime,
          timeRange: element.startTime + ' - ' + element.endTime,
          status: status,
          day: element.day,
          date: possibleDate?.date,
          dayName: possibleDate?.dayName,
        };
        tempResult.push(data);
      }
    }

    return tempResult;
  }
}
