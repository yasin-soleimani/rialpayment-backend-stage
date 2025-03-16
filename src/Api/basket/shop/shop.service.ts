import {
  Injectable,
  NotFoundException,
  successOpt,
  successOptWithDataNoValidation,
  successOptWithPagination,
} from '@vision/common';
import { BasketShopCoreService } from '../../../Core/basket/shop/service/shop.service';
import { BasketShopApiDto, BasketShopReportExportDto } from './dto/shop.dto';
import { shopExportQueryBuilder, shopQueryBuilder } from './functions/query.function';
import { merchantReportModel, userShopReportModel } from './functions/merchant-model';
import { BasketShopStatusApiDto } from './dto/status.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { BasketProductService } from '../../../Core/basket/products/services/product.service';
import { BasketProductsCardsCoreModule } from '../../../Core/basket/cards/cards.module';
import { BasketProductCardService } from '../../../Core/basket/cards/cards.service';
import { BaksetProductTypes } from '../../../Core/basket/products/consts/products.const';
import { imageTransform } from '@vision/common/transform/image.transform';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { ExportJsService } from './services/export-js.service';

@Injectable()
export class BasketApiShopService {
  constructor(
    private readonly shopService: BasketShopCoreService,
    private readonly productCardService: BasketProductCardService,
    private readonly productService: BasketProductService,
    private readonly exportJsService: ExportJsService
  ) {}

  async getUserFilter(userid: string, page: number): Promise<any> {
    const data = await this.shopService.getUserShopList(userid, page);
    data.docs = await this.getOut(data.docs);
    return successOptWithPagination(data);
  }

  async getMerchantFilter(getInfo: BasketShopApiDto, userid, page: number): Promise<any> {
    const query = shopQueryBuilder(getInfo, userid);
    const data = await this.shopService.getMerchantShopList(query, page);
    data.docs = await this.getOutShop(data.docs);
    return successOptWithPagination(data);
  }

  async getMerchantShopExport(getInfo: BasketShopReportExportDto, userid): Promise<any> {
    const query = shopExportQueryBuilder(getInfo, userid);
    const data = await this.shopService.getMerchantShopListWithoutPagination(query);
    const result = await this.getOutShopForExport(data);
    if (result.length < 1) {
      throw new UserCustomException('موردی یافت نشد');
    }
    return this.exportJsService.makeFile(result, userid);
  }

  async changeStatus(getInfo: BasketShopStatusApiDto, userid: string): Promise<any> {
    const data = await this.shopService.changeStatus(getInfo.id, userid, getInfo.status);
    if (!data) throw new UserCustomException('شما به این خرید دسترسی ندارید');
    return successOpt();
  }

  async getShopInfo(userid: string, invoiceid: string): Promise<any> {
    if (isEmpty(invoiceid)) throw new FillFieldsException();

    const data = await this.shopService.getShopDetailsByUseridAndInvocieid(userid, invoiceid);
    if (!data) throw new NotFoundException();

    if (data.paid === false) throw new UserCustomException('متاسفانه خرید شما پرداخت نشده است');
    const basketInfo = await this.setBasket(data.basket, data._id);
    return successOptWithDataNoValidation(basketInfo);
  }

  private async getOutShop(data): Promise<any> {
    let tmp = Array();
    let basket;
    for (const info of data) {
      let deliveryOption = {};
      if (info.deliveryOption && info.deliveryOption.title && info.deliveryOption.title.includes('پیک')) {
        console.log('ارسال با پیک');
        deliveryOption = {
          title: info.deliveryOption.title,
          amount: info.deliveryOption.amount,
          description: info.deliveryOption.description,
          id: 1,
        };
      } else {
        console.log('ارسال با پست پیشتاز');
        deliveryOption = {
          title: info.deliveryOption.title,
          amount: info.deliveryOption.amount,
          description: info.deliveryOption.description,
          id: 2,
        };
      }
      tmp.push({
        _id: info._id,
        invoiceid: info.invoiceid,
        paid: info.paid,
        fullname: info.user ? info.user.fullname : 'بی نام',
        mobile: info.user ? info.user.mobile : '',
        basket: await this.setBasket(info.basket, info._id),
        address: info.address,
        status: info.status || 1,
        total: info.total,
        createdAt: info.createdAt,
        updatedAt: info.updatedAt,
        deliveryOption: deliveryOption,
        deliveryTime: info.deliveryTime,
        deliveryDate: info.deliveryDate,
        cashOnDelivery: info.cashOnDelivery ?? false,
        issuedDeliveryPrice: info.issuedDeliveryPrice,
      });
    }
    return tmp;
  }

  private async getOutShopForExport(data): Promise<any> {
    let tmp = Array();
    let basket;
    for (const info of data) {
      let deliveryOption = {};
      if (info.deliveryOption && info.deliveryOption.title && info.deliveryOption.title.includes('پیک')) {
        console.log('ارسال با پیک');
        deliveryOption = {
          title: info.deliveryOption.title,
          amount: info.deliveryOption.amount,
          description: info.deliveryOption.description,
          id: 1,
        };
      } else {
        console.log('ارسال با پست پیشتاز');
        deliveryOption = {
          title: info.deliveryOption.title,
          amount: info.deliveryOption.amount,
          description: info.deliveryOption.description,
          id: 2,
        };
      }
      tmp.push({
        _id: info._id,
        invoiceid: info.invoiceid,
        paid: info.paid,
        fullname: info.user ? info.user.fullname : 'بی نام',
        mobile: info.user ? info.user.mobile : '',
        basket: await this.setBasketForExport(info.basket, info._id),
        address: info.address,
        status: info.status || 1,
        total: info.total,
        createdAt: info.createdAt,
        updatedAt: info.updatedAt,
        deliveryOption: deliveryOption,
        deliveryTime: info.deliveryTime,
        deliveryDate: info.deliveryDate,
        cashOnDelivery: info.cashOnDelivery ?? false,
        issuedDeliveryPrice: info.issuedDeliveryPrice,
      });
    }
    return tmp;
  }

  private async getOut(data: any): Promise<any> {
    let tmp = Array();
    let basket;
    for (const info of data) {
      let deliveryOption = {};
      if (info.deliveryOption && info.deliveryOption.title && info.deliveryOption.title.includes('پیک')) {
        console.log('ارسال با پیک');
        deliveryOption = {
          title: info.deliveryOption.title,
          amount: info.deliveryOption.amount,
          description: info.deliveryOption.description,
          id: 1,
        };
      } else {
        console.log('ارسال با پست پیشتاز');
        deliveryOption = {
          title: info.deliveryOption.title,
          amount: info.deliveryOption.amount,
          description: info.deliveryOption.description,
          id: 2,
        };
      }
      tmp.push({
        _id: info._id,
        paid: info.paid,
        invoiceid: info.invoiceid,
        merchant: {
          title: info.merchant.title,
          tels: info.merchant.tels,
          address: info.merchant.address,
          email: info.merchant.email,
          account_no: info.merchant.account_no,
          logo: 'https://core-backend.rialpayment.ir/upload/' + info.merchant.logo,
        },
        basket: await this.setBasket(info.basket, info._id),
        address: info.address,
        total: info.total,
        status: info.status || 1,
        createdAt: info.createdAt,
        updatedAt: info.updatedAt,
        deliveryOption: deliveryOption,
        deliveryTime: info.deliveryTime,
        deliveryDate: info.deliveryDate,
        cashOnDelivery: info.cashOnDelivery ?? false,
        issuedDeliveryPrice: info.issuedDeliveryPrice,
      });
    }
    return tmp;
  }

  private async setBasket(basketInfo, id) {
    let tmpArray = Array();

    for (const details of basketInfo) {
      if (details.id) {
        const productInfo = await this.productService.getProductDetails(details.id._id);
        const cardsInfo = await this.productCardService.getCards(productInfo._id, id);
        let valuex = Array();
        let fieldx = Array();
        let finalfield = Array();
        if (cardsInfo) {
          for (const vInfo of cardsInfo) {
            for (const vvInfo of vInfo.value) {
              valuex.push(vvInfo);
            }
          }
        }

        if (productInfo.fields) {
          for (const fInfo of productInfo.fields) {
            fieldx.push(fInfo.title);
          }
        }

        if (fieldx.length < valuex.length) {
          const mod = valuex.length / fieldx.length;
          for (let i = 0; i < mod; i++) {
            finalfield = finalfield.concat(fieldx);
          }
        } else {
          finalfield = fieldx;
        }

        let downloadLink;
        if (details.id.type == BaksetProductTypes.Download) {
          downloadLink = 'https://core-backend.rialpayment.ir/v1/download/shop/' + id + '/' + details.id._id;
        }

        if (!this.checkDuplicate(tmpArray, details._id)) {
          tmpArray.push({
            _id: details._id,
            title: details.title,
            qty: details.qty,
            type: details.id.type,
            price: details.price,
            total: details.total,
            count: fieldx.length,
            link: downloadLink,
            fields: finalfield,
            value: valuex,
            details: details.details,
            options: details.options,
          });
        }
      }
    }

    return tmpArray;
  }

  private async setBasketForExport(basketInfo, id) {
    let tmpArray = Array();

    for (const details of basketInfo) {
      if (details.id && details.id.type == BaksetProductTypes.physical) {
        if (!this.checkDuplicate(tmpArray, details._id)) {
          tmpArray.push({
            _id: details._id,
            title: details.title,
            qty: details.qty,
            type: details.id.type,
            price: details.price,
            total: details.total,
            details: details.details,
            options: details.options,
          });
        }
      }
    }

    return tmpArray;
  }

  private checkDuplicate(array1, id) {
    return array1.find(function (element) {
      return element._id == id;
    });
  }
}
