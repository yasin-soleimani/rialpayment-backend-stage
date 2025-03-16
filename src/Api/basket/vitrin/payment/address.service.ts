import { Injectable } from '@vision/common';
import { BasketAddressCoreService } from '../../../../Core/basket/shop/service/shop-address.service';
import { BasketShopCoreService } from '../../../../Core/basket/shop/service/shop.service';

@Injectable()
export class VitrinAddressApiService {
  constructor(
    private readonly basketAddressService: BasketAddressCoreService,
    private readonly basketShopService: BasketShopCoreService
  ) {}

  async addAdress(
    getInfo,
    merchantInfo,
    userid,
    tmpArray,
    total,
    referer,
    issuedDeliveryPrice,
    deliveryTime
  ): Promise<any> {
    let addressId = null;
    if (getInfo.addrid) {
      addressId = getInfo.addrid;
    } else {
      const addr = typeof getInfo.addr === 'string' ? JSON.parse(getInfo.addr) : getInfo.addr;
      if (getInfo.addr.location) {
        getInfo.addr.location.type = 'Point';
      }
      const addInfo = await this.basketAddressService.addNew(
        addr.province,
        addr.city,
        addr.address,
        addr.postalcode ?? '',
        addr.fullname,
        addr.mobile,
        userid,
        addr.location
      );
      addressId = addInfo._id;
    }

    const data = this.basketShopService.model(
      merchantInfo._id,
      userid,
      tmpArray,
      addressId,
      total,
      getInfo.devicetype,
      referer,
      deliveryTime,
      issuedDeliveryPrice,
      getInfo.deliveryOption,
      getInfo.cashOnDelivery
    );

    return data;
  }
}
