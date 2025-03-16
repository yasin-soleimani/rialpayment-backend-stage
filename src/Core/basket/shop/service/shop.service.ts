import { Inject, Injectable } from '@vision/common';
import { ProductSoldStatusEnum } from '../../store/enum/product-sold-status-enum';

@Injectable()
export class BasketShopCoreService {
  constructor(@Inject('BasketShopModel') private readonly shopModel: any) {}

  async addShop(getInfo): Promise<any> {
    return this.shopModel.create(getInfo);
  }

  async changeStatus(id, userid, status: ProductSoldStatusEnum): Promise<any> {
    const shopModel = await this.shopModel.findOne({
      _id: id,
      merchantuser: userid,
    });
    if (!!shopModel) {
      status = parseInt(status + '');
      shopModel.status = status;
      if (status === ProductSoldStatusEnum.DELIVERED && shopModel.cashOnDelivery === true) shopModel.paid = true;
      console.log(status === ProductSoldStatusEnum.DELIVERED, shopModel.cashOnDelivery === true);
      await shopModel.save();
    }
    return shopModel;
  }

  async getShopList(token): Promise<any> {
    return this.shopModel
      .findOne({
        token: token,
      })
      .populate('basket.id')
      .populate('user');
  }

  async getShopListById(id): Promise<any> {
    return this.shopModel
      .findOne({
        _id: id,
      })
      .populate('basket.id deliveryTime user');
  }

  async setPaid(shopid: string, paid: boolean): Promise<any> {
    return this.shopModel.findOneAndUpdate(
      {
        _id: shopid,
      },
      { paid: paid }
    );
  }

  async setToken(id, token): Promise<any> {
    return this.shopModel.findOneAndUpdate(
      {
        _id: id,
      },
      { token: token }
    );
  }

  async setInvoiceId(id, invoiceid): Promise<any> {
    return this.shopModel.findOneAndUpdate(
      {
        _id: id,
      },
      { invoiceid: invoiceid }
    );
  }

  async getUserShopList(userid: string, page: number): Promise<any> {
    return this.shopModel.paginate(
      {
        user: userid,
        $or: [{ paid: true }, { cashOnDelivery: true }],
      },
      { page, populate: 'merchantuser merchant address basket.id deliveryTime', sort: { createdAt: -1 }, limit: 50 }
    );
  }

  async getMerchantShopList(query: any, page: number): Promise<any> {
    return this.shopModel.paginate(query, {
      page,
      populate: ['user address basket.id deliveryTime'],
      sort: { createdAt: -1 },
      limit: 50,
    });
  }

  async getMerchantShopListWithoutPagination(query: any): Promise<any> {
    return this.shopModel.find(query).populate('user address basket.id deliveryTime');
  }

  async getShopDetailByUserid(userid: string, shopref: string): Promise<any> {
    return this.shopModel
      .findOne({
        user: userid,
        _id: shopref,
      })
      .populate('basket.id');
  }

  async getShopDetailsByUseridAndInvocieid(userid: string, invoiceid: string): Promise<any> {
    return this.shopModel
      .findOne({
        user: userid,
        invoiceid: invoiceid,
      })
      .populate('basket.id');
  }

  model(
    merchantuser,
    user,
    cart,
    address,
    total,
    deviceType: string,
    referer: string,
    deliveryTime,
    issuedDeliveryPrice?: number,
    deliveryOption?: any,
    cashOnDelivery = false
  ) {
    return {
      merchantuser: merchantuser,
      user: user,
      basket: cart,
      address: address,
      total: total,
      devicetype: deviceType,
      deliveryOption,
      issuedDeliveryPrice: issuedDeliveryPrice || 0,
      referer,
      deliveryTime: deliveryTime ? deliveryTime.id : null,
      deliveryDate: deliveryTime ? deliveryTime.date : null,
      cashOnDelivery,
    };
  }

  async getLastNthDaysShopsByStoreId(
    storeUserId: string,
    deliveryTimeId: string,
    today: string,
    nthDaysAgo: string
  ): Promise<number> {
    return this.shopModel.count({
      $and: [
        { merchantuser: storeUserId },
        { createdAt: { $gte: nthDaysAgo } },
        { createdAt: { $lte: today } },
        { paid: true },
        { deliveryTime: deliveryTimeId },
      ],
    });
  }
}
