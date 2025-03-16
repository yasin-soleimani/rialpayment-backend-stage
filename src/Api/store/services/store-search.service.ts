import {
  Injectable,
  successOptWithPagination,
  CreditStatusEnums,
  successOptWithDataNoValidation,
} from '@vision/common';
import { MerchantcoreService } from '../../../Core/merchant/merchantcore.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { StoreTypes } from '@vision/common/constants/sore-types.const';
import { imageTransform } from '@vision/common/transform/image.transform';
import { StoreTerminalSearchDto } from '../dto/store.dto';
import { DiscountTypeEnum } from '@vision/common/enums/discount-type.enum';
import { NotFoundException } from '@vision/common/exceptions/not-found.exception';
const roundTo = require('round-to');

@Injectable()
export class StoreListService {
  constructor(private readonly merchantService: MerchantcoreService) {}

  async AllList(page, userid): Promise<any> {
    const res = await this.merchantService.getAllList(page);
    if (res) {
      const rData = await this.circle(res.docs, userid);
      res.docs = rData;
    }
    return successOptWithPagination(res);
  }

  async searchList(getInfo: StoreTerminalSearchDto, page, userid): Promise<any> {
    const query = await this.queryGeneratorStore(getInfo);
    if (getInfo.all == 'true') return this.AllList(page, userid);
    const res = await this.merchantService.searchList(query, page);
    if (res) {
      const rData = await this.circle(res.docs, userid);
      res.docs = rData;
    }
    return successOptWithPagination(res);
  }

  async showStore(storeid, userid): Promise<any> {
    const res = await this.merchantService.showStore(storeid, userid);
    const data = await this.single(res, userid);
    return successOptWithDataNoValidation(data[0]);
  }

  private async single(data, userid): Promise<any> {
    let tmpArray = Array();
    if (isEmpty(data)) throw new NotFoundException();
    const type = await this.terminalTypeSelector(data[0].discount, data[0].credit);
    const dataRules = await this.ruleMaker(data[0].discount, data[0].credit);
    tmpArray.push({
      _id: data[0]._id,
      title: data[0].title,
      logo: imageTransform(data[0].logo),
      images: [imageTransform(data[0].img1), imageTransform(data[0].img2), imageTransform(data[0].img3)],
      address: data[0].terminals[0].address,
      category: data[0].category,
      description: data.descrip || ' ',
      type: type,
      comments: 0,
      rate: 0,
      bookmark: false,
      tel: data[0].tell,
      discounts: [{ bank: 0, nonebank: 0 }],
      balanceinstore: 0,
      worktime: '8 صبح الی 10 شب',
      lat: data[0].lat,
      long: data[0].long,
      roles: dataRules,
    });

    return tmpArray;
  }
  private async circle(data, userid): Promise<any> {
    let tmpArray = Array();
    for (let i = 0; i < data.length; i++) {
      const type = await this.terminalTypeSelector(data[i].discount, data[i].credit);
      const dataRules = await this.ruleMaker(data[i].discount, data[i].credit);
      tmpArray.push({
        _id: data[i]._id,
        title: data[i].title,
        logo: imageTransform(data[i].logo),
        img1: imageTransform(data[i].img1),
        img2: imageTransform(data[i].img2),
        img3: imageTransform(data[i].img3),
        province: data[i].terminals[0].province,
        city: data[i].terminals[0].city,
        address: data[i].terminals[0].address,
        category: data[i].category,
        description: data.descrip || ' ',
        type: type,
        comments: 0,
        bookmark: false,
        tell: data[i].tell,
        discounts: { bank: 0, nonebank: 0 },
        lat: data[i].lat,
        long: data[i].long,
        data: dataRules,
      });
    }
    return tmpArray;
  }

  private async terminalTypeSelector(discount, credit): Promise<any> {
    if (!isEmpty(credit)) {
      switch (credit[0].type) {
        case CreditStatusEnums.CREDIT: {
          return StoreTypes.CREDIT;
        }

        case CreditStatusEnums.PREPAID_INSTALLS: {
          return StoreTypes.INSTALMENT_CREDIT;
        }

        case CreditStatusEnums.INSTALLMENTS_CREDIT: {
          return StoreTypes.INSTALMENT;
        }

        case CreditStatusEnums.MOZAREBEH: {
          return StoreTypes.MOZAREBE;
        }
      }
    } else if (discount) {
      return StoreTypes.DISCOUNT;
    } else {
      return StoreTypes.DISCOUNT;
    }
  }

  private async ruleMaker(discount, credit): Promise<any> {
    let tmpArray = Array();
    let count = 0;
    for (let i = 0; i < discount.length; i++) {
      if (discount[i].type == 100 && count == 0) {
        let disBank = 0;
        count++;
        if (discount[i].bankdisc > 0) {
          const calc = Math.round(Math.round((15 * discount[i].bankdisc) / 100));
          disBank = roundTo(Number(discount[i].bankdisc) - Number(calc), 2);
        }
        tmpArray.push({ label: 'تخفیف نقدی ', value: disBank + ' %' });
        tmpArray.push({ label: 'تخفیف غیر نقدی ', value: discount[i].nonebankdisc + ' %' });
      }
    }

    for (let i = 0; i < credit.length; i++) {
      if (credit[i]) {
        switch (credit[i].type) {
          case CreditStatusEnums.CREDIT: {
            tmpArray.push({ label: 'نوع پذیرنده ', value: 'اعتباری' });
            tmpArray.push({ label: 'تعداد اقساط', value: credit[i].advance.qty.toString() || 0 + '%' });
            tmpArray.push({ label: 'سود ماهانه', value: credit[i].advance.benefit + '%' || 0 + '%' });
            tmpArray.push({ label: ' درصد تخفیف تا ۱۰ روز', value: credit[i].tenday + '%' || 0 + '%' });
            tmpArray.push({ label: ' درصد تخفیف تا ۲۰ روز', value: credit[i].tenday + '%' || 0 + '%' });
            break;
          }
          case CreditStatusEnums.INSTALLMENTS_CREDIT: {
            tmpArray.push({ label: 'نوع پذیرنده ', value: 'اقساطی' });
            tmpArray.push({ label: 'تعداد اقساط', value: credit[i].advance.qty.toString() || 0 + '%' });
            tmpArray.push({ label: 'سود ماهانه', value: credit[i].advance.benefit + '%' || 0 + '%' });
            tmpArray.push({ label: ' درصد تخفیف تا ۱۰ روز', value: credit[i].tenday + '%' || 0 + '%' });
            tmpArray.push({ label: ' درصد تخفیف تا ۲۰ روز', value: credit[i].tenday + '%' || 0 + '%' });
            break;
          }
          case CreditStatusEnums.MOZAREBEH: {
            tmpArray.push({ label: 'نوع پذیرنده ', value: 'مضاربه ای' });
            tmpArray.push({ label: 'تعداد اقساط', value: credit[i].advance.qty.toString() || 0 + '%' });
            tmpArray.push({ label: 'سود ماهانه', value: credit[i].advance.benefit + '%' || 0 + '%' });
            tmpArray.push({ label: ' درصد تخفیف تا ۱۰ روز', value: credit[i].tenday + '%' || 0 + '%' });
            tmpArray.push({ label: ' درصد تخفیف تا ۲۰ روز', value: credit[i].tenday + '%' || 0 + '%' });
            break;
          }
          case CreditStatusEnums.PREPAID_INSTALLS: {
            tmpArray.push({ label: 'نوع پذیرنده ', value: 'مضاربه ای' });
            tmpArray.push({ label: 'تعداد اقساط', value: credit[i].advance.qty.toString() || 0 + '%' });
            tmpArray.push({ label: 'سود ماهانه', value: credit[i].advance.benefit + '%' || 0 + '%' });
            tmpArray.push({ label: ' درصد تخفیف تا ۱۰ روز', value: credit[i].tenday + '%' || 0 + '%' });
            tmpArray.push({ label: ' درصد تخفیف تا ۲۰ روز', value: credit[i].tenday + '%' || 0 + '%' });
            break;
          }
        }
      }
    }

    return tmpArray;
  }

  async queryGeneratorStore(getInfo: StoreTerminalSearchDto): Promise<any> {
    let andQuery = Object();
    let orQuery = Array();

    const creditType = await this.creditArrayGen(getInfo);
    if (creditType['credit.type'].$in.length > 0) {
      orQuery.push(creditType);
    }

    const discountType = await this.discountArrayGen(getInfo);
    if (discountType && discountType['discount.type'].$in.length > 0) {
      orQuery.push(discountType);
    }

    const category = await this.catorySelector(getInfo);
    if (category) {
      Object.assign(andQuery, category);
    }

    const province = await this.provinceSelector(getInfo);
    if (province) {
      Object.assign(andQuery, province);
    }

    const city = await this.citySelector(getInfo);
    if (city) {
      Object.assign(andQuery, city);
    }

    const search = await this.searchSelector(getInfo);
    console.log(search);
    if (search) {
      Object.assign(andQuery, search);
    }
    if (!isEmpty(orQuery)) {
      if (orQuery.length > 1) {
        const exData = { $or: orQuery };
        Object.assign(andQuery, exData);
      } else {
        Object.assign(andQuery, orQuery[0]);
      }
    }

    const main = {
      $and: [
        andQuery,
        { terminals: { $exists: true, $not: { $size: 0 } } },
        { 'terminals.visible': true },
        {
          $or: [{ discount: { $exists: true, $not: { $size: 0 } } }, { credit: { $exists: true, $not: { $size: 0 } } }],
        },
      ],
    };

    return main;
  }

  private async creditArrayGen(getInfo: StoreTerminalSearchDto): Promise<any> {
    console.log(getInfo);
    let creditType = Array();

    if (getInfo.installments && getInfo.installments == 'true') {
      creditType.push(CreditStatusEnums.INSTALLMENTS_CREDIT);
    }

    if (getInfo.installmentsCredit && getInfo.installmentsCredit == 'true') {
      creditType.push(CreditStatusEnums.PREPAID_INSTALLS);
    }

    if (getInfo.credit && getInfo.credit == 'true') {
      creditType.push(CreditStatusEnums.CREDIT);
    }

    if (getInfo.mozarebe && getInfo.mozarebe == 'true') {
      creditType.push(CreditStatusEnums.MOZAREBEH);
    }

    const returnData = { 'credit.type': { $in: creditType } };

    return returnData;
  }

  private async discountArrayGen(getInfo: StoreTerminalSearchDto): Promise<any> {
    let tmpArray = Array();
    if (getInfo.discount && getInfo.discount == 'true') {
      tmpArray.push(DiscountTypeEnum.Base);
      tmpArray.push(DiscountTypeEnum.Class);
      tmpArray.push(DiscountTypeEnum.Hour);
      tmpArray.push(DiscountTypeEnum.Organ);
      tmpArray.push(DiscountTypeEnum.Point);
      tmpArray.push(DiscountTypeEnum.Price);
      tmpArray.push(DiscountTypeEnum.Visit);
      return { 'discount.type': { $in: tmpArray } };
    }
  }

  private async catorySelector(getInfo: StoreTerminalSearchDto): Promise<any> {
    if (getInfo.category && !isEmpty(getInfo.category)) {
      return { category: getInfo.category };
    }
    return null;
  }

  private async provinceSelector(getInfo: StoreTerminalSearchDto): Promise<any> {
    if (getInfo.province && !isEmpty(getInfo.province)) {
      return { province: getInfo.province };
    }
    return null;
  }

  private async citySelector(getInfo: StoreTerminalSearchDto): Promise<any> {
    if (getInfo.city && !isEmpty(getInfo.city)) {
      return { city: getInfo.city };
    }
    return null;
  }

  private async searchSelector(getInfo: StoreTerminalSearchDto): Promise<any> {
    if (getInfo.search && !isEmpty(getInfo.search)) {
      var Value_match = new RegExp(getInfo.search);

      return { title: { $regex: Value_match } };
    }
    return null;
  }
}
