import { BadRequestException, Injectable, NotFoundException } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { BasketProductService } from '../../../../Core/basket/products/services/product.service';
import { BasketStoreCoreService } from '../../../../Core/basket/store/basket-store.service';
import { UserService } from '../../../../Core/useraccount/user/user.service';
import { BasketAddressCoreService } from '../../../../Core/basket/shop/service/shop-address.service';
import { isNil } from '@vision/common/utils/shared.utils';
import { BasketProductOptionCoreService } from '../../../../Core/basket/product-option/product-option.service';

@Injectable()
export class VitrinPaymentMerchantApiService {
  constructor(
    private readonly userService: UserService,
    private readonly basketStoreService: BasketStoreCoreService,
    private readonly productService: BasketProductService,
    private readonly addressService: BasketAddressCoreService,
    private readonly productOptionCoreService: BasketProductOptionCoreService
  ) {}

  // Check Merchant
  async checkMerchant(getInfo): Promise<any> {
    const merchantInfo = await this.userService.getInfoByAccountNo(getInfo.account_no);
    if (!merchantInfo) throw new UserCustomException('فروشگاه نامعتبر');

    const storeInfo = await this.basketStoreService.getInfo(merchantInfo._id);
    if (!storeInfo) throw new NotFoundException();

    const addressInfo = await this.addressService.getAddressById(getInfo.addrid);

    if (merchantInfo.block === true) throw new UserCustomException('فروشگاه نامعتبر');
    if (storeInfo.status === false) throw new UserCustomException('فروشگاه نامعتبر');
    if (!storeInfo.mipg) throw new UserCustomException('ترمینال تعریف نشده است');
    if (storeInfo.mipg.status === false) throw new UserCustomException('ترمینال غیرفعال می باشد');
    if (!storeInfo.mipg.terminal)
      throw new UserCustomException('پرداخت درون برنامه ای برای این فروشگاه غیرفعال می باشد');

    return {
      merchantInfo,
      storeInfo,
      addressInfo,
    };
  }

  // Add products
  async basket(getInfo, merchantInfo, storeInfo): Promise<any> {
    const basketModel = typeof getInfo.basket === 'string' ? JSON.parse(getInfo.basket) : getInfo.basket;

    let tmpArray = Array();
    let pid = Array();
    let total = 0;
    let parcelProductFound = false;
    let issuedDeliveryPrice = 0;
    let deliveryTime = null;

    for (const info of basketModel) {
      // if (isNil(info.options)) {
      //   throw new UserCustomException('فیلد options باید آرایه باشد');
      // }
      let options = [];

      const productInfo = await this.productService.getProductInfo(info.id, merchantInfo._id);
      if (productInfo) {
        if (productInfo.type === 1) {
          // a parcel product has been found!
          parcelProductFound = true;
        } else if (productInfo.type == 3) {
          pid.push({
            type: productInfo.type,
            productid: productInfo._id,
            title: productInfo.title,
            qty: info.qty,
          });
        }

        if (info.details?.length > 0) {
          const allProductDetails = this.productService.checkDetailsSpecialSell(productInfo.details);
          for (const detail of info.details) {
            if (detail.qty < 1) {
              throw new BadRequestException('تعداد محصول انتخاب شده باید بیشتر از صفر باشد');
            }

            const sourceDetailInDB = allProductDetails.find((el) => el._id == detail._id);
            if (productInfo.type === 1 && sourceDetailInDB.qty < 1) {
              throw new BadRequestException(
                `متأسفانه موجودی محصول ${info.title} - رنگ ${sourceDetailInDB.color} - سایز ${sourceDetailInDB.size} به پایان رسیده است`
              );
            }

            if (detail.qty % sourceDetailInDB.qtyRatio !== 0) {
              throw new UserCustomException(
                productInfo.title + ' - ' + 'تعداد محصول انتخاب شده با ضریب انتخاب محصول مغایرت دارد'
              );
            }

            let sumOfSelectedOptionsPrice = 0;
            // if options found
            if (info?.options?.length > 0) {
              for (const option of info.options) {
                const productOption = await this.productOptionCoreService.getByOptionId(option);
                if (!productOption) {
                  throw new UserCustomException(`گزینه انتخاب شده برای محصول ${productInfo.title} یافت نشد`);
                }
                sumOfSelectedOptionsPrice += productOption.price;
                total = total + productOption.price;
                options.push({ title: productOption.title, price: productOption.price });
              }
            }

            tmpArray.push({
              type: productInfo.type,
              id: productInfo._id,
              title: productInfo.title,
              qty: detail.qty,
              qtyRatio: detail.qtyRatio || 1,
              price: sourceDetailInDB.specialSell !== null ? sourceDetailInDB.specialSell : sourceDetailInDB.price,
              total:
                sourceDetailInDB.specialSell !== null
                  ? sourceDetailInDB.specialSell * detail.qty + sumOfSelectedOptionsPrice
                  : sourceDetailInDB.price * detail.qty + sumOfSelectedOptionsPrice,
              details: {
                ...detail,
                color: sourceDetailInDB.color || '',
                size: sourceDetailInDB.size || '',
                qtyRatio: sourceDetailInDB.qtyRatio || 1,
                specialSell: sourceDetailInDB.specialSell,
              },
              options: options,
            });

            total =
              sourceDetailInDB.specialSell !== null
                ? total + sourceDetailInDB.specialSell * detail.qty
                : total + sourceDetailInDB.price * detail.qty;
          }
        } else if (
          info.hasDetails &&
          (info.details === null || info.details === undefined || info.details?.length === 0)
        ) {
          throw new FillFieldsException('لطفا جزئیات محصول را انتخاب کنید');
        } else {
          if (info.qty < 1) {
            throw new BadRequestException('تعداد محصول انتخاب شده باید بیشتر از صفر باشد');
          }

          if (info.qty % productInfo.qtyRatio !== 0) {
            throw new UserCustomException(
              productInfo.title + ' - ' + 'تعداد محصول انتخاب شده با ضریب انتخاب محصول مغایرت دارد'
            );
          }

          if (productInfo.type === 1 && productInfo.qty < 1) {
            throw new BadRequestException(`متأسفانه موجودی محصول ${productInfo.title} - به پایان رسیده است`);
          }

          const specialSell = this.productService.checkSpecialSell(productInfo);
          total = specialSell !== null ? total + specialSell * info.qty : total + productInfo.price * info.qty;

          let sumOfSelectedOptionsPrice = 0;

          // if options found
          if (info?.options?.length > 0) {
            for (const option of info.options) {
              const productOption = await this.productOptionCoreService.getByOptionId(option);
              if (!productOption) {
                throw new UserCustomException(`گزینه انتخاب شده برای محصول ${productInfo.title} یافت نشد`);
              }
              sumOfSelectedOptionsPrice += productOption.price;
              total = total + productOption.price;
              options.push({ title: productOption.title, price: productOption.price });
            }
          }

          tmpArray.push({
            id: productInfo._id,
            title: productInfo.title,
            qty: info.qty,
            qtyRatio: productInfo.qtyRatio || 1,
            price: specialSell !== null ? specialSell : productInfo.price,
            total:
              specialSell !== null
                ? specialSell * info.qty + sumOfSelectedOptionsPrice
                : productInfo.price * info.qty + sumOfSelectedOptionsPrice,
            type: productInfo.type,
            options: options,
          });
        }
      }
    }

    if (parcelProductFound) {
      // user has selected at least 1 parcel product
      // so we need to calculate delivery price
      const deliveryOption =
        typeof getInfo.deliveryOption === 'string' ? JSON.parse(getInfo.deliveryOption) : getInfo.deliveryOption;
      if (getInfo.deliveryOption) {
        // parse deliveryOption

        if (storeInfo.hasFreeShipping) {
          // if store owner has defined a freeShipping threshold
          // we need to check if the total price of the shopping cart exceeds the threshold or not
          // if it does NOT exceed, we add delivery price to the total shopping cart amount
          // otherwise we ignore it.
          if (total <= storeInfo.freeShippingAmount) {
            total = total + deliveryOption.amount;
            issuedDeliveryPrice = deliveryOption.amount;
          } else {
            issuedDeliveryPrice = 0;
          }
        } else {
          // if store owner has not defined a freeShipping threshold
          // we add selectedDeliveryOption price to the total amount of the shopping cart
          total = total + deliveryOption.amount;
          issuedDeliveryPrice = deliveryOption.amount;
        }
      } else {
        // no deliveryOption is selected by client so we throw an exception
        throw new UserCustomException('لطفا نحوه ارسال را انتخاب کنید');
      }

      // if user has chosen the casual delivery
      if (deliveryOption.id === 1) {
        const deliveryTimeData = getInfo.deliveryTime;
        if (isNil(deliveryTimeData) || isNil(deliveryTimeData.id) || isNil(deliveryTimeData.date)) {
          throw new UserCustomException('لطفا زمان ارسال را انتخاب کنید');
        } else {
          deliveryTime = deliveryTimeData;
        }
      }
    }

    return {
      total,
      tmpArray,
      pid,
      issuedDeliveryPrice,
      deliveryTime,
    };
  }
}
