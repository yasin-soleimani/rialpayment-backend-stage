import {
  BadRequestException,
  faildOptWithData,
  Injectable,
  NotFoundException,
  successOptWithDataNoValidation,
  successOptWithPagination,
} from '@vision/common';
import { BasketProductService } from '../../../Core/basket/products/services/product.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { BaksetCategoryService } from '../../../Core/basket/category/category.service';
import { imageTransform } from '@vision/common/transform/image.transform';
import { VitrinIpgTransferService } from './services/vitrin-ipg-transfer.service';
import { VitrinIpgTransferDto } from './dto/vitrin-ipg-transfer.dto';
import { BaksetProductTypes } from '../../../Core/basket/products/consts/products.const';
import { BasketProductCardService } from '../../../Core/basket/cards/cards.service';
import { BasketStoreCoreService } from '../../../Core/basket/store/basket-store.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { BasketAddressCoreService } from '../../../Core/basket/shop/service/shop-address.service';
import { BasketShopCoreService } from '../../../Core/basket/shop/service/shop.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { BasketVitirinRedirectService } from './services/redirect.service';
import { BasketVitrinLisenceService } from './services/lisence.service';
import { returnStoreInfoModel, returnUserOnlyInfoModel } from './model/return.model';
import { AddressDto } from './dto/address.dto';
import { VitrinPaymentTypeConst } from './const/virin-payment-type.const';
import { VitrinInAppPurchaseApiService } from './services/purchase.service';
import { VitrinPaymentMerchantApiService } from './payment/payment.service';
import { VitrinAddressApiService } from './payment/address.service';
import { DeliveryTimeService } from '../../../Core/basket/delivery-time/delivery-time.service';
import { BasketProductOptionCoreService } from '../../../Core/basket/product-option/product-option.service';
import { VitrinCashOnDeliveryApiService } from './services/cashOnDelivery.service';
import { BasketLotteryService } from '../../../Core/basket/lottery/lottery.service';
import * as moment from 'jalali-moment';

@Injectable()
export class VitrinService {
  constructor(
    private readonly productService: BasketProductService,
    private readonly categoryService: BaksetCategoryService,
    private readonly vitrinIpgService: VitrinIpgTransferService,
    private readonly basketCardService: BasketProductCardService,
    private readonly basketShopService: BasketShopCoreService,
    private readonly basketStoreService: BasketStoreCoreService,
    private readonly basketRedirectService: BasketVitirinRedirectService,
    private readonly basketAddressService: BasketAddressCoreService,
    private readonly basketLisenceService: BasketVitrinLisenceService,
    private readonly userService: UserService,
    private readonly purchaseService: VitrinInAppPurchaseApiService,
    private readonly merchantService: VitrinPaymentMerchantApiService,
    private readonly addressService: VitrinAddressApiService,
    private readonly basketDeliveryTimeCoreService: DeliveryTimeService,
    private readonly basketProductOptionCoreService: BasketProductOptionCoreService,
    private readonly vitrinCashOnDeliveryService: VitrinCashOnDeliveryApiService,
    private readonly lotteryService: BasketLotteryService
  ) {}

  async getCategoryList(account: number): Promise<any> {
    const userid = await this.userService.getInfoByAccountNo(account);
    const data = await this.categoryService.listView(userid);
    return successOptWithDataNoValidation(data);
  }
  async getCategoryHyperList(account: number): Promise<any> {
    const userid = await this.userService.getInfoByAccountNo(account);
    const data = await this.categoryService.listViewHyper();
    const array = [];
    data.forEach((item) => {
      array.push({ ...item, img: 'https://core-backend.rialpayment.ir/upload/' + item.img });
    });
    return successOptWithDataNoValidation(array);
  }

  async getCategoryListV2(account: number, parent: string): Promise<any> {
    if (!parent) throw new UserCustomException('دسته بندی مادر صحیح نمیباشد');
    parent = parent === 'root' ? '/' : parent;
    const userid = await this.userService.getInfoByAccountNo(account);
    const data = await this.categoryService.listViewV2(userid, parent);
    return successOptWithDataNoValidation(data);
  }

  async getProductList(account: number, page: number, category: string, categorySlug: string): Promise<any> {
    const userid = await this.userService.getInfoByAccountNo(account);
    if (!userid) throw new UserNotfoundException();

    const storeInfo = await this.basketStoreService.getInfo(userid);
    if (!storeInfo) throw new NotFoundException();

    let categoryBySlug: any;
    if (categorySlug) {
      categoryBySlug = await this.categoryService.findBySlugAndUserId(categorySlug, userid);
      if (!categoryBySlug) throw new NotFoundException('دسته‌بندی یافت نشد');
      category = categoryBySlug?._id;
    }

    let res;
    if (category == 'All') {
      res = await this.productList(userid, page);
    } else {
      res = await this.productListWithCategory(userid, page, category);
    }
    let tmpArray = Array();
    for (let i = 0; res.docs.length > i; i++) {
      let category, id;
      if (!res.docs[i].category) {
        id: '';
        category = 'بدون دسته';
      } else {
        id: res.docs[i].category._id;
        category = res.docs[i].category.title;
      }

      let qty = 0;

      switch (res.docs[i].type) {
        case BaksetProductTypes.Lisence: {
          qty = await this.getCardQty(res.docs[i]._id);
          break;
        }

        case BaksetProductTypes.physical: {
          qty = res.docs[i].qty;
          break;
        }

        case BaksetProductTypes.Download: {
          qty = 1;
          break;
        }
      }

      const options = await this.basketProductOptionCoreService.getActivesByBasketProductId(res.docs[i]._id);
      const specialSell = this.productService.checkSpecialSell(res.docs[i]);
      const detailsArray = this.productService.checkDetailsSpecialSell(res.docs[i].details);
      tmpArray.push({
        shop: storeInfo._id,
        img: imageTransform(res.docs[i].img),
        title: res.docs[i].title,
        description: res.docs[i].description,
        slug: res.docs[i].slug,
        metaTitle: res.docs[i].metaTitle,
        metaDescription: res.docs[i].metaDescription,
        category: {
          _id: id,
          title: category,
        },
        qty: qty,
        qtyRatio: res.docs[i].qtyRatio,
        qtyType: res.docs[i].qtyType,
        type: res.docs[i].type,
        price: res.docs[i].price,
        _id: res.docs[i]._id,
        updatedAt: res.docs[i].updatedAt,
        details: detailsArray,
        hasDetails: res.docs[i].hasDetails,
        multiOption: res.docs[i].multiOption,
        specialSell: specialSell,
        options: options,
      });
    }

    res.docs = tmpArray;
    return successOptWithPagination(res);
  }

  async getProductListV2(
    account: number,
    page: number,
    category: string,
    categoryParent: string,
    categorySlug: string
  ): Promise<any> {
    const userid = await this.userService.getInfoByAccountNo(account);
    if (!userid) throw new UserNotfoundException();

    const storeInfo = await this.basketStoreService.getInfo(userid);
    if (!storeInfo) throw new NotFoundException();

    let categoryBySlug: any;
    if (categorySlug && categoryParent) {
      categoryBySlug = await this.categoryService.findBySlugAndUserIdV2(categorySlug, categoryParent, userid);
      if (!categoryBySlug) throw new NotFoundException('دسته‌بندی یافت نشد');
      category = categoryBySlug?._id;
    }

    let res;
    if (category == 'All') {
      res = await this.productList(userid, page);
    } else {
      res = await this.productListWithCategoryV2(userid, page, category);
    }
    let tmpArray = Array();
    for (let i = 0; res.docs.length > i; i++) {
      let category, id;
      if (!res.docs[i].category) {
        id: '';
        category = 'بدون دسته';
      } else {
        id: res.docs[i].category._id;
        category = res.docs[i].category.title;
      }

      let qty = 0;

      switch (res.docs[i].type) {
        case BaksetProductTypes.Lisence: {
          qty = await this.getCardQty(res.docs[i]._id);
          break;
        }

        case BaksetProductTypes.physical: {
          qty = res.docs[i].qty;
          break;
        }

        case BaksetProductTypes.Download: {
          qty = 1;
          break;
        }
      }

      const options = await this.basketProductOptionCoreService.getActivesByBasketProductId(res.docs[i]._id);
      const specialSell = this.productService.checkSpecialSell(res.docs[i]);
      const detailsArray = this.productService.checkDetailsSpecialSell(res.docs[i].details);
      tmpArray.push({
        shop: storeInfo._id,
        img: imageTransform(res.docs[i].img),
        title: res.docs[i].title,
        description: res.docs[i].description,
        slug: res.docs[i].slug,
        metaTitle: res.docs[i].metaTitle,
        metaDescription: res.docs[i].metaDescription,
        category: {
          _id: id,
          title: category,
        },
        qty: qty,
        qtyRatio: res.docs[i].qtyRatio,
        qtyType: res.docs[i].qtyType,
        type: res.docs[i].type,
        price: res.docs[i].price,
        _id: res.docs[i]._id,
        updatedAt: res.docs[i].updatedAt,
        details: detailsArray,
        hasDetails: res.docs[i].hasDetails,
        specialSell: specialSell,
        multiOption: res.docs[i].multiOption,
        options: options,
      });
    }

    res.docs = tmpArray;
    return successOptWithPagination(res);
  }

  async searchProductList(account: number, page: number, searchParam: string): Promise<any> {
    const userid = await this.userService.getInfoByAccountNo(account);
    if (!userid) throw new UserNotfoundException();

    const storeInfo = await this.basketStoreService.getInfo(userid);
    if (!storeInfo) throw new NotFoundException();

    if (!searchParam) throw new FillFieldsException('متن جستجو را وارد کنید');

    let res = await this.allProductsListSearch(userid, page, searchParam);

    let tmpArray = Array();
    for (let i = 0; res.docs.length > i; i++) {
      let category, id;
      if (!res.docs[i].category) {
        id: '';
        category = 'بدون دسته';
      } else {
        id: res.docs[i].category._id;
        category = res.docs[i].category.title;
      }

      let qty = 0;

      switch (res.docs[i].type) {
        case BaksetProductTypes.Lisence: {
          qty = await this.getCardQty(res.docs[i]._id);
          break;
        }

        case BaksetProductTypes.physical: {
          qty = res.docs[i].qty;
          break;
        }

        case BaksetProductTypes.Download: {
          qty = 1;
          break;
        }
      }

      const options = await this.basketProductOptionCoreService.getActivesByBasketProductId(res.docs[i]._id);
      const specialSell = this.productService.checkSpecialSell(res.docs[i]);
      const detailsArray = this.productService.checkDetailsSpecialSell(res.docs[i].details);

      tmpArray.push({
        shop: storeInfo._id,
        img: imageTransform(res.docs[i].img),
        title: res.docs[i].title,
        description: res.docs[i].description,
        slug: res.docs[i].slug,
        metaTitle: res.docs[i].metaTitle,
        metaDescription: res.docs[i].metaDescription,
        category: {
          _id: id,
          title: category,
        },
        qty: qty,
        qtyRatio: res.docs[i].qtyRatio,
        qtyType: res.docs[i].qtyType,
        type: res.docs[i].type,
        price: res.docs[i].price,
        _id: res.docs[i]._id,
        updatedAt: res.docs[i].updatedAt,
        details: detailsArray,
        hasDetails: res.docs[i].hasDetails,
        multiOption: res.docs[i].multiOption,
        specialSell: specialSell,
        options: options,
      });
    }

    res.docs = tmpArray;
    return successOptWithPagination(res);
  }

  async getSingleProduct(account: number, slug: string): Promise<any> {
    const userid = await this.userService.getInfoByAccountNo(account);
    if (!userid) throw new UserNotfoundException();

    const storeInfo = await this.basketStoreService.getInfo(userid);
    if (!storeInfo) throw new NotFoundException();

    let res = await this.getSingleProductFromCore(userid, slug);

    let category, id;
    if (!res.category) {
      id: '';
      category = 'بدون دسته';
    } else {
      id: res.category._id;
      category = res.category.title;
    }

    let qty = 0;

    switch (res.type) {
      case BaksetProductTypes.Lisence: {
        qty = await this.getCardQty(res._id);
        break;
      }

      case BaksetProductTypes.physical: {
        qty = res.qty;
        break;
      }

      case BaksetProductTypes.Download: {
        qty = 1;
        break;
      }
    }

    const options = await this.basketProductOptionCoreService.getActivesByBasketProductId(res._id);
    const specialSell = this.productService.checkSpecialSell(res);
    const detailsArray = this.productService.checkDetailsSpecialSell(res.details);

    const product = {
      shop: storeInfo._id,
      img: imageTransform(res.img),
      title: res.title,
      description: res.description,
      slug: res.slug,
      metaTitle: res.metaTitle,
      metaDescription: res.metaDescription,
      category: {
        _id: id,
        title: category,
      },
      qty: qty,
      qtyType: res.qtyType,
      qtyRatio: res.qtyRatio,
      type: res.type,
      price: res.price,
      _id: res._id,
      updatedAt: res.updatedAt,
      details: detailsArray,
      hasDetails: res.hasDetails,
      multiOption: res.multiOption,
      specialSell: specialSell,
      options: options,
    };

    return successOptWithDataNoValidation(product);
  }

  private async productList(userid: string, page: number): Promise<any> {
    return this.productService.getListProducts(userid, page);
  }

  private async allProductsListSearch(userid: string, page: number, searchParam: string): Promise<any> {
    return this.productService.getListAllProductsSearch(userid, page, searchParam);
  }

  private async getSingleProductFromCore(userid: string, slug: string): Promise<any> {
    return this.productService.getSingleProduct(userid, slug);
  }

  private async productListWithCategory(userid: string, page: number, category: string): Promise<any> {
    return this.productService.getListProductsWithCategory(userid, page, category);
  }
  private async productListWithCategoryV2(userid: string, page: number, category: string): Promise<any> {
    return this.productService.getListProductsWithCategoryV2(userid, page, category);
  }

  async ipgMoneyTransfer(getInfo: VitrinIpgTransferDto, req): Promise<any> {
    return this.vitrinIpgService.newReq(getInfo);
  }

  async ipgPayment(getInfo: VitrinIpgTransferDto, req): Promise<any> {
    return this.vitrinIpgService.newPaymentReq(getInfo, req);
  }

  async getStoreInformation(nickname): Promise<any> {
    const storeInfo = await this.basketStoreService.getInfoByNicknameLean(nickname);
    if (!storeInfo) throw new NotFoundException();

    const userInfo = await this.userService.getInfoByUserid(storeInfo.user);
    if (!userInfo) throw new NotFoundException();

    if (userInfo.block === true) {
      throw new UserCustomException('فروشگاه غیرفعال می باشد', false, 400);
    }

    if (storeInfo.status !== true) {
      return {
        status: 303,
        success: false,
        message: 'فروشگاه غیرفعال می باشد',
        data: returnStoreInfoModel(storeInfo),
      };
    }
    const bannersArray = [];
    console.log('all Banners', storeInfo.banners);
    for (const banner of storeInfo.banners) {
      console.log('single banner', banner);
      bannersArray.push({ ...banner, img: imageTransform(banner.img) });
    }
    storeInfo.banners = [...bannersArray];

    return successOptWithDataNoValidation(returnStoreInfoModel(storeInfo));
  }

  async getStoreInformationByAccountNo(accountNo: string): Promise<any> {
    const userInfo = await this.userService.getInfoByAccountNo(parseInt(accountNo, 10));
    if (!userInfo) throw new NotFoundException();

    let storeInfo = await this.basketStoreService.getInfo(userInfo._id);
    if (storeInfo) {
      if (userInfo.block === true) {
        throw new UserCustomException('فروشگاه غیرفعال می باشد', false, 400);
      }

      storeInfo.user = userInfo;

      if (storeInfo.status !== true) {
        return {
          status: 303,
          success: false,
          message: 'فروشگاه غیرفعال می باشد',
          data: returnStoreInfoModel(storeInfo),
        };
      }

      return successOptWithDataNoValidation(returnStoreInfoModel(storeInfo));
    } else {
      storeInfo = {
        user: userInfo,
      };
      return successOptWithDataNoValidation(returnUserOnlyInfoModel(storeInfo));
    }
  }

  private async getCardQty(productid: string): Promise<any> {
    const data = await this.basketCardService.getQty(productid);
    return data.length;
  }

  async getAddresses(userid: string): Promise<any> {
    const data = await this.basketAddressService.getAdrress(userid);
    return successOptWithDataNoValidation(data);
  }

  async addAddress(userid: string, getInfo: AddressDto): Promise<any> {
    if (
      !getInfo.address ||
      !getInfo.province ||
      !getInfo.city ||
      !getInfo.fullname ||
      !getInfo.mobile ||
      !getInfo.location ||
      !Array.isArray(getInfo.location.coordinates)
    ) {
      throw new FillFieldsException();
    }

    if (getInfo.postalcode) {
      const postalcodeRegex = new RegExp(/^[0-9]{10}/);
      if (!postalcodeRegex.test(getInfo.postalcode)) throw new FillFieldsException();
    } else getInfo.postalcode = '';

    getInfo.userid = userid;

    getInfo.location.type = 'Point';

    const result = await this.basketAddressService.addNew(
      getInfo.province,
      getInfo.city,
      getInfo.address,
      getInfo.postalcode,
      getInfo.fullname,
      getInfo.mobile,
      getInfo.userid,
      getInfo.location
    );
    return successOptWithDataNoValidation(result);
  }

  async updateAddress(addressId: string, getInfo: Partial<AddressDto>): Promise<any> {
    if (Object.keys(getInfo).length < 1) {
      throw new FillFieldsException();
    }

    if (getInfo.postalcode) {
      const postalcodeRegex = new RegExp(/^[0-9]{10}/);
      if (!postalcodeRegex.test(getInfo.postalcode)) throw new FillFieldsException();
    }

    if (getInfo.location) {
      getInfo.location.type = 'Point';
    }

    const data = await this.basketAddressService.update(addressId, getInfo);
    return successOptWithDataNoValidation(data);
  }

  async deleteAddress(addressId: string): Promise<any> {
    const data = await this.basketAddressService.delete(addressId);
    return successOptWithDataNoValidation(data);
  }

  async submitCheckout(getInfo, userid, referer: string): Promise<any> {
    console.log('start');
    const { merchantInfo, storeInfo, addressInfo } = await this.merchantService.checkMerchant(getInfo);
    const { tmpArray, total, pid, issuedDeliveryPrice, deliveryTime } = await this.merchantService.basket(
      getInfo,
      merchantInfo,
      storeInfo
    );

    const userInfo = await this.userService.getInfoByUserid(userid);
    if (!userInfo) throw new UserCustomException('کاربر نامعتبر');
    console.log('userInfo');

    getInfo.mipg = { terminal: storeInfo.mipg.terminal };
    getInfo.user = userid;
    // Check cash on delivery
    getInfo.cashOnDelivery =
      getInfo.hasOwnProperty('cashOnDelivery') &&
      getInfo.paytype === VitrinPaymentTypeConst.CashOnDelivery &&
      getInfo.cashOnDelivery === true &&
      storeInfo.hasCashOnDelivery;
    if (storeInfo.deliveryProvince && storeInfo.deliveryCity) {
      if (addressInfo) {
        if (storeInfo.hasDeliveryToWholeCountry) {
          if (getInfo.deliveryOption.type === 1 && addressInfo.province !== storeInfo.deliveryProvince) {
            throw new BadRequestException('امکان ارسال کالا به استان‌های دیگر با پیک وجود ندارد');
          }
        } else {
          if (addressInfo.province !== storeInfo.deliveryProvince) {
            throw new BadRequestException(
              `فروشگاه در حال حاضر صرفا امکان ارسال کالا به شهر‌های استان ${storeInfo.deliveryProvince} را دارد`
            );
          }
        }
      }
    }

    if (getInfo.addr || getInfo.addrid) {
      const data = await this.addressService.addAdress(
        getInfo,
        merchantInfo,
        userid,
        tmpArray,
        total,
        referer,
        issuedDeliveryPrice,
        deliveryTime
      );
      return this.basketShopService.addShop(data).then(async (res) => {
        console.log('basketShopService');

        let none = Array();
        for (const info of pid) {
          if (info.type == 3) {
            const cardReserve = await this.basketLisenceService.getReserve(info.productid, info.qty, res._id);
            if (!cardReserve) none.push(info.title);
          }
        }
        console.log(pid, none);
        if (!isEmpty(none)) return faildOptWithData(none);

        // if is ipg payment
        if (getInfo.paytype == VitrinPaymentTypeConst.Ipg) {
          const data = await this.vitrinIpgService.makePay(
            storeInfo.mipg.terminalid,
            res.total,
            'https://core-backend.rialpayment.ir/v1/vitrin/payment/callback'
          );
          if (!data.invoiceid) throw new UserCustomException('پرداخت با خطا مواجه شده است');
          await this.basketShopService.setToken(res._id, data.invoiceid);
          console.log('ipg');

          return successOptWithDataNoValidation(data.invoiceid);
        }

        // if is Cash On Delivery
        else if (getInfo.paytype == VitrinPaymentTypeConst.CashOnDelivery && getInfo.cashOnDelivery) {
          console.log('basketCashOnDeliveryStarted:::::::::::::::::::::');
          getInfo.amount = res.total;
          return this.vitrinCashOnDeliveryService.setCashOnDelivery(getInfo, storeInfo, res);
        }

        // if is inAppPurchase
        else {
          console.log(1);
          console.log('basketShopService');

          getInfo.amount = res.total;
          return this.purchaseService.action(getInfo, storeInfo, res);
        }
      });
    } else {
      const data = this.basketShopService.model(
        merchantInfo._id,
        userid,
        tmpArray,
        getInfo.addrid,
        total,
        getInfo.devicetype,
        referer,
        issuedDeliveryPrice,
        null,
        getInfo.cashOnDelivery
      );
      return this.basketShopService.addShop(data).then(async (res) => {
        let none = Array();
        for (const info of pid) {
          if (info.type == 3) {
            const cardReserve = await this.basketLisenceService.getReserve(info.productid, info.qty, res._id);
            if (!cardReserve) none.push(info.title);
          }
        }
        if (!isEmpty(none)) return faildOptWithData(none);

        // if is ipg payment
        if (getInfo.paytype == VitrinPaymentTypeConst.Ipg) {
          const data = await this.vitrinIpgService.makePay(
            storeInfo.mipg.terminalid,
            res.total,
            'https://core-backend.rialpayment.ir/v1/vitrin/payment/callback'
          );
          if (!data.invoiceid) throw new UserCustomException('پرداخت با خطا مواجه شده است');
          await this.basketShopService.setToken(res._id, data.invoiceid);
          return successOptWithDataNoValidation(data.invoiceid);
        }

        // if is Cash On Delivery
        else if (getInfo.paytype == VitrinPaymentTypeConst.CashOnDelivery && getInfo.cashOnDelivery) {
          console.log('basketCashOnDeliveryStarted:::::::::::::::::::::2');
          getInfo.amount = res.total;
          return this.vitrinCashOnDeliveryService.setCashOnDelivery(getInfo, storeInfo, res);
        }

        // if is inAppPurchase
        else {
          getInfo.amount = res.total;
          console.log(2);
          return this.purchaseService.action(getInfo, storeInfo, res);
        }
      });
    }
  }

  async redirectTrans(ref, res): Promise<any> {
    return this.basketRedirectService.transferRedirect(ref, res);
  }

  async getAllStores(): Promise<any> {
    return this.basketStoreService.getAll();
  }

  async getDeliveryTimes(accountId: string): Promise<any> {
    const userInfo = await this.userService.getInfoByAccountNo(parseInt(accountId, 10));
    if (!userInfo) throw new NotFoundException();

    const store = await this.basketStoreService.getInfo(userInfo._id);
    if (!store) {
      throw new NotFoundException('فروشگاه یافت نشد');
    }

    const result = await this.basketDeliveryTimeCoreService.getAvailableTimes(store);
    return successOptWithDataNoValidation(result);
  }

  async getLotteries(accountId: string): Promise<any> {
    const userInfo = await this.userService.getInfoByAccountNo(parseInt(accountId, 10));
    if (!userInfo) throw new NotFoundException();

    const store = await this.basketStoreService.getInfo(userInfo._id);
    if (!store) {
      throw new NotFoundException('فروشگاه یافت نشد');
    }
    const month = parseInt(moment(new Date()).locale('fa').format('M'));
    const year = moment(new Date()).locale('fa').year();
    console.log('month year::::::::::::::::::::::: ', month, year);
    const result = await this.lotteryService.getLotteryByStoreAndDate(store._id, month, year, true);
    return successOptWithDataNoValidation(result);
  }

  async getSpecialSells(accountId: string): Promise<any> {
    const userInfo = await this.userService.getInfoByAccountNo(parseInt(accountId, 10));
    if (!userInfo) throw new NotFoundException();

    const store = await this.basketStoreService.getInfo(userInfo._id);
    if (!store) {
      throw new NotFoundException('فروشگاه یافت نشد');
    }
    const result = await this.productService.getSpecialSells(userInfo._id);
    const array = [];

    for (const item of result)
      array.push({ ...item, img: imageTransform(item.img), specialSell: this.productService.checkSpecialSell(item) });
    return successOptWithDataNoValidation(array);
  }
}
