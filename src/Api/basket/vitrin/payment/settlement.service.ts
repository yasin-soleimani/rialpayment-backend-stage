import { Injectable } from '@vision/common';
import { BasketProductService } from '../../../../Core/basket/products/services/product.service';
import { BasketShopCoreService } from '../../../../Core/basket/shop/service/shop.service';
import { BasketVitrinLisenceService } from '../services/lisence.service';
import { BasketVitrinSmsNotifService } from '../services/sms-notif.service';
import * as momentjs from 'jalali-moment';

@Injectable()
export class VitrinPaymentSettlementApiService {
  constructor(
    private readonly productService: BasketProductService,
    private readonly basketShopService: BasketShopCoreService,
    private readonly basketLisenceService: BasketVitrinLisenceService,
    private readonly smsService: BasketVitrinSmsNotifService
  ) {}

  async actionIPG(shopInfo, payInfo, storeInfo): Promise<any> {
    await this.action(shopInfo);
    this.basketShopService.setPaid(shopInfo._id, true);
    this.basketShopService.setInvoiceId(shopInfo._id, payInfo.invoiceid);

    const deliveryTime =
      shopInfo?.deliveryOption && shopInfo.deliveryOption.title && shopInfo.deliveryOption.title.includes('پیک')
        ? `${momentjs(shopInfo?.deliveryDate).locale('fa').format('dddd jDD-jMM-jYYYY')} ${
            shopInfo?.deliveryTime?.startTime
          } - ${shopInfo?.deliveryTime.endTime}`
        : 'بین ۳ تا ۷ روز کاری از زمان ثبت سفارش';

    // send sms to buyer and seller
    console.log(storeInfo.mobiles);
    if (storeInfo.mobiles.length > 0)
      for (const index in storeInfo.mobiles)
        setTimeout(
          async () => {
            try {
              this.smsService.sendSmsToSeller(
                storeInfo.title,
                storeInfo.mobiles[index],
                payInfo.invoiceid,
                deliveryTime
              );
            } catch (e) {}
          },
          //@ts-ignore
          index * 2000
        );
    else this.smsService.sendSmsToSeller(storeInfo.title, storeInfo.user.mobile, payInfo.invoiceid, deliveryTime);
    const timeout = setTimeout(() => {
      this.smsService.sendSmsToBuyer(
        storeInfo.title,
        shopInfo.user.mobile,
        payInfo.invoiceid,
        deliveryTime,
        storeInfo.tels.length > 0 ? storeInfo.tels[0].tel : '09363677791'
      );
      clearTimeout(timeout);
    }, 19000);
  }

  async actionInAppPurchase(shopInfo, invoiceid, storeInfo): Promise<any> {
    await this.action(shopInfo);
    this.basketShopService.setPaid(shopInfo._id, true);
    this.basketShopService.setInvoiceId(shopInfo._id, invoiceid);

    const deliveryTime =
      shopInfo?.deliveryOption && shopInfo.deliveryOption.title && shopInfo.deliveryOption.title.includes('پیک')
        ? `${momentjs(shopInfo?.deliveryDate).locale('fa').format('dddd jDD-jMM-jYYYY')} ${
            shopInfo?.deliveryTime?.startTime
          } - ${shopInfo?.deliveryTime.endTime}`
        : 'بین ۳ تا ۷ روز کاری از زمان ثبت سفارش';

    // send sms to buyer and seller
    console.log(storeInfo.mobiles);
    if (storeInfo.mobiles.length > 0)
      for (const index in storeInfo.mobiles)
        setTimeout(
          () => {
            try {
              console.log('-------------->inSms<----------------', new Date().getTime());
              this.smsService.sendSmsToSeller(storeInfo.title, storeInfo.mobiles[index], invoiceid, deliveryTime);
            } catch (e) {}
          },
          //@ts-ignore
          index * 2000
        );
    else this.smsService.sendSmsToSeller(storeInfo.title, storeInfo.user.mobile, invoiceid, deliveryTime);
    const timeout = setTimeout(() => {
      this.smsService.sendSmsToBuyer(
        storeInfo.title,
        shopInfo.user.mobile,
        invoiceid,
        deliveryTime,
        storeInfo.tels.length > 0 ? storeInfo.tels[0].tel : '09363677791'
      );
      clearTimeout(timeout);
    }, 19000);
    return deliveryTime;
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
