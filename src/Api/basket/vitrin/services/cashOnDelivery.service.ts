import { BasketStoreCoreService } from '../../../../Core/basket/store/basket-store.service';
import { UserService } from '../../../../Core/useraccount/user/user.service';
import { DeliveryTimeService } from '../../../../Core/basket/delivery-time/delivery-time.service';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { BasketProductService } from '../../../../Core/basket/products/services/product.service';
import { BasketVitrinLisenceService } from './lisence.service';
import { BasketShopCoreService } from '../../../../Core/basket/shop/service/shop.service';
import { generateRandomChar } from '@vision/common/services/generate-random-char.service';
import * as momentjs from 'jalali-moment';
import { BasketVitrinSmsNotifService } from './sms-notif.service';
import { Injectable, successOptWithDataNoValidation } from '@vision/common';

@Injectable()
export class VitrinCashOnDeliveryApiService {
  constructor(
    private readonly storeService: BasketStoreCoreService,
    private readonly userService: UserService,
    private readonly deliveryTimeCoreService: DeliveryTimeService,
    private readonly productService: BasketProductService,
    private readonly basketLisenceService: BasketVitrinLisenceService,
    private readonly basketShopService: BasketShopCoreService,
    private readonly smsService: BasketVitrinSmsNotifService
  ) {}
  async setCashOnDelivery(getInfo, storeInfo, res) {
    await this.checkStore(getInfo);
    res.deliveryTime = await this.deliveryTimeCoreService.getById(res.deliveryTime);
    res.user = await this.userService.getInfoByUserid(res.user);
    await this.action(res);
    const rand = new Date().getTime();
    const invoiceid = '' + rand;
    this.basketShopService.setInvoiceId(res._id, invoiceid);
    const deliveryTime =
      res?.deliveryOption && res.deliveryOption.title && res.deliveryOption.title.includes('پیک')
        ? `${momentjs(res?.deliveryDate).locale('fa').format('dddd jDD-jMM-jYYYY')} ${res?.deliveryTime?.startTime} - ${
            res?.deliveryTime.endTime
          }`
        : 'بین ۳ تا ۷ روز کاری از زمان ثبت سفارش';

    // send sms to buyer and seller
    console.log(storeInfo.mobiles);
    if (storeInfo.mobiles.length > 0)
      for (const index in storeInfo.mobiles)
        setTimeout(
          () => {
            try {
              console.log('-------------->inSms<----------------', new Date().getTime());
              this.smsService.sendSmsToSeller(storeInfo.title, storeInfo.mobiles[index], invoiceid, deliveryTime, true);
            } catch (e) {}
          },
          //@ts-ignore
          index * 2000
        );
    else this.smsService.sendSmsToSeller(storeInfo.title, storeInfo.user.mobile, invoiceid, deliveryTime, true);
    const timeout = setTimeout(() => {
      this.smsService.sendSmsToBuyer(
        storeInfo.title,
        res.user.mobile,
        invoiceid,
        deliveryTime,
        storeInfo.tels.length > 0 ? storeInfo.tels[0].tel : '09363677791',
        true
      );
      clearTimeout(timeout);
    }, 19000);
    const data = {
      success: true,
      status: true,
      amount: res.total,
      refid: invoiceid,
      deliveryTime: deliveryTime,
      type: 3,
    };
    return successOptWithDataNoValidation(data);
  }

  async checkStore(getInfo) {
    const userInfo = await this.userService.getInfoByAccountNo(getInfo.account_no);
    if (!userInfo) throw new UserNotfoundException();

    const storeInfo = await this.storeService.getInfo(userInfo._id);
    if (!storeInfo) throw new UserCustomException('فروشگاه یافت نشد', false, 404);

    if (storeInfo.status === false) throw new UserCustomException('فروشگاه غیرفعال می باشد');
  }

  private async action(shopInfo): Promise<any> {
    for (const info of shopInfo.basket) {
      if (info.type == 3) {
        this.basketLisenceService.setSold(shopInfo._id);
      }
      if (info.type == 1) {
        if (info.details) {
          this.productService.updateDetailQty(info.id, info.details._id, info.details.qty);
        } else {
          this.productService.updateQty(info.id, info.qty);
        }
      }
    }
  }
}
