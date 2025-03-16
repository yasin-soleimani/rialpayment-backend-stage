import { Injectable, MerchanSort, CreditStatusEnums } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { MerchantcoreService } from '../../Core/merchant/merchantcore.service';
import { CommentsCoreService } from '../../Core/comments/comments.service';
import { StoreTerminalSearchDto } from './dto/store.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { imageTransform } from '@vision/common/transform/image.transform';
import { MerchantCreditCoreService } from '../../Core/credit/merchantcredit/merchantcredit.service';
import { MerchantCoreTerminalService } from '../../Core/merchant/services/merchant-terminal.service';
import { MerchantCoreBookmarkService } from '../../Core/merchant/services/merchant-bookmark.service';

@Injectable()
export class StoreService {
  constructor(
    private readonly commentsService: CommentsCoreService,
    private readonly merchantCreditService: MerchantCreditCoreService,
    private readonly terminalService: MerchantCoreTerminalService,
    private readonly bookmarkService: MerchantCoreBookmarkService
  ) {}

  async getListStores(page, userid, sort?): Promise<any> {
    const data = await this.terminalService.getAllTermianls(page, sort);
    let tempData = [];
    for (let index = 0; index < data.docs.length; index++) {
      let bookmarked, logo;
      const bookdata = await this.bookmarkService.checkBookmark(userid, data.docs[index]._id);
      if (!bookdata) {
        bookmarked = false;
      } else {
        bookmarked = bookdata.bookmarked;
      }

      let dataRules = [
        { label: 'تخفیف نقدی  ', value: data.docs[index].discbank },
        { label: 'تخفیف اعتباری', value: data.docs[index].discnonebank },
      ];
      let newData = {
        _id: data.docs[index]._id,
        title: data.docs[index].title,
        logo: imageTransform(data.docs[index].merchant.logo),
        category: data.docs[index].merchant.category || ' ',
        description: data.docs[index].descrip || 'توضیحات تکمیل شود',
        type: data.docs[index].type || 1,
        address: data.docs[index].address,
        comments: 0,
        bookmark: bookmarked,
        rate: 0,
        tel: data.docs[index].merchant.tell,
        data: dataRules,
        discounts: { bank: data.docs[index].discbank, nonebank: data.docs[index].discnonebank },
      };
      tempData.push(newData);
    }
    data.docs = tempData;
    return this.getList(data);
  }

  getList(data) {
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      data: data.docs || [],
      total: data.total || 0,
      limit: data.limit || 0,
      page: data.page || 0,
      pages: data.pages || 0,
    };
  }

  async showStore(storeId, userid): Promise<any> {
    const data = await this.terminalService.findByTerminal(storeId);
    if (!data) throw new UserCustomException('متاسفانه فروشگاه مورد نظر یافت نشد', false, 404);
    this.terminalService.updateVisit(storeId);
    let bookmarked;
    const bookdata = await this.bookmarkService.checkBookmark(userid, storeId);
    if (!bookdata) {
      bookmarked = false;
    } else {
      bookmarked = bookdata.bookmarked;
    }
    const merchantInfo = await this.merchantCreditService.getOneDetails(storeId);
    return this.transformSuccessStore(this.showTerminalStore(data, bookmarked, merchantInfo));
  }

  async listComments(terminalid, page): Promise<any> {
    return this.commentsService.showListComments(terminalid, page);
  }

  async searchStores(getInfo: StoreTerminalSearchDto, page, userid, sort?): Promise<any> {
    const query = this.selecttype(getInfo);
    let queryFinal;
    if (query.length > 0) {
      queryFinal = { $and: query };
    } else {
      queryFinal = false;
    }
    // if ( isEmpty(query) ) return this.getList([]);
    const data = await this.terminalService.searchTerminalsByUser(queryFinal, page, sort);
    let tempData = [];
    for (let index = 0; index < data.docs.length; index++) {
      let bookmarked;
      const bookdata = await this.bookmarkService.checkBookmark(userid, data.docs[index]._id);
      if (!bookdata) {
        bookmarked = false;
      } else {
        bookmarked = bookdata.bookmarked;
      }

      let dataRules = Array();
      dataRules.push({ label: 'تخفیف نقدی', value: data.docs[index].discbank });
      dataRules.push({ label: 'تخفیف اعتباری', value: data.docs[index].discnonebank });
      //let dataRules = [ { label: 'تخفیف نقدی  ',  value: data.docs[index].discbank}, { label: 'تخفیف اعتباری', value: data.docs[index].discnonebank}];
      let newData = {
        _id: data.docs[index]._id,
        title: data.docs[index].title,
        logo: imageTransform(data.docs[index].merchant.logo),
        category: data.docs[index].merchant.category || ' ',
        description: data.docs[index].descrip || 'توضیحات تکمیل شود',
        type: data.docs[index].type || 1,
        address: data.docs[index].address,
        comments: 0,
        bookmark: bookmarked,
        rate: 0,
        tel: data.docs[index].merchant.tell,
        data: dataRules,
        discounts: { bank: data.docs[index].discbank, nonebank: data.docs[index].discnonebank },
      };
      tempData.push(newData);
    }
    data.docs = tempData;
    return this.getList(data);
  }

  async bookmark(userid, merchantid): Promise<any> {
    const bookmark = await this.bookmarkService.checkBookmark(userid, merchantid);
    let bookmarked;
    if (!bookmark) {
      bookmarked = true;
    } else {
      bookmarked = !bookmark.bookmarked;
    }
    const data = await this.bookmarkService.addBookmark(userid, merchantid, bookmarked);
    if (!data) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است2', false, 500);
    return this.transformSuccessStore('');
  }

  private showTerminalStore(data, bookmark, merchantcredit) {
    // let dataRules = [ { label: 'تخفیف نقدی  ',  value: data.discbank}, { label: 'تخفیف اعتباری', value: data.discnonebank}];
    let dataRules = Array();
    dataRules.push({ label: 'تخفیف نقدی', value: data.discbank });
    dataRules.push({ label: 'تخفیف اعتباری', value: data.discnonebank });

    if (merchantcredit && !isEmpty(merchantcredit.type)) {
      switch (merchantcredit.type) {
        case CreditStatusEnums.CREDIT: {
          dataRules.push({ label: 'نوع پذیرنده ', value: 'اعتباری' });
          dataRules.push({ label: 'تعداد اقساط', value: merchantcredit.advance.qty || 0 + '%' });
          dataRules.push({ label: 'سود ماهانه', value: merchantcredit.advance.benefit || 0 + '%' });
          dataRules.push({ label: ' درصد تخفیف تا ۱۰ روز', value: merchantcredit.tenday || 0 + '%' });
          dataRules.push({ label: ' درصد تخفیف تا ۲۰ روز', value: merchantcredit.tenday || 0 + '%' });
        }

        case CreditStatusEnums.INSTALLMENTS_CREDIT: {
          dataRules.push({ label: 'نوع پذیرنده ', value: 'اقساطی' });
          dataRules.push({ label: 'تعداد اقساط', value: merchantcredit.advance.qty || 0 + '%' });
          dataRules.push({ label: 'سود ماهانه', value: merchantcredit.advance.benefit || 0 + '%' });
          dataRules.push({ label: ' درصد تخفیف تا ۱۰ روز', value: merchantcredit.tenday || 0 + '%' });
          dataRules.push({ label: ' درصد تخفیف تا ۲۰ روز', value: merchantcredit.tenday || 0 + '%' });
        }

        case CreditStatusEnums.MOZAREBEH: {
          dataRules.push({ label: 'نوع پذیرنده ', value: 'مضاربه ای' });
          dataRules.push({ label: 'تعداد اقساط', value: merchantcredit.advance.qty || 0 + '%' });
          dataRules.push({ label: 'سود ماهانه', value: merchantcredit.advance.benefit || 0 + '%' });
          dataRules.push({ label: ' درصد تخفیف تا ۱۰ روز', value: merchantcredit.tenday || 0 + '%' });
          dataRules.push({ label: ' درصد تخفیف تا ۲۰ روز', value: merchantcredit.tenday || 0 + '%' });
        }

        case CreditStatusEnums.PREPAID_INSTALLS: {
          dataRules.push({ label: 'نوع پذیرنده ', value: 'مضاربه ای' });
          dataRules.push({ label: 'تعداد اقساط', value: merchantcredit.advance.qty || 0 + '%' });
          dataRules.push({ label: 'سود ماهانه', value: merchantcredit.advance.benefit || 0 + '%' });
          dataRules.push({ label: ' درصد تخفیف تا ۱۰ روز', value: merchantcredit.tenday || 0 + '%' });
          dataRules.push({ label: ' درصد تخفیف تا ۲۰ روز', value: merchantcredit.tenday || 0 + '%' });
        }
      }
    }
    // if ( !isEmpty(data.iscredit) && data.iscredit == true ) {
    //   const creditData = await this.merchantCredit.getDetails(data._id);
    // }
    return {
      _id: data._id,
      title: data.title,
      description: 'این یک متن برای تست می باشد',
      type: 1,
      rate: 0,
      comments: 0,
      logo: imageTransform(data.merchant.logo),
      address: data.address,
      tel: data.merchant.tell,
      images: [
        imageTransform(data.merchant.img1),
        imageTransform(data.merchant.img2),
        imageTransform(data.merchant.img3),
      ],
      bookmark: bookmark,
      roles: dataRules,
      discounts: [{ bank: data.discbank, nonebank: data.discnonebank }],
      category: data.merchant.category,
      balanceinstore: 0,
      worktime: '8صبح الی 10 شب',
    };
  }

  transformSuccessStore(datax) {
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      data: datax,
    };
  }

  selecttype(getInfo: StoreTerminalSearchDto) {
    let query = Array();
    if (!isEmpty(getInfo.installments) && getInfo.installments == true) {
      query.push(CreditStatusEnums.INSTALLMENTS_CREDIT);
    }
    if (!isEmpty(getInfo.discount) && getInfo.discount == true) {
      query.push({ isdiscount: getInfo.discount });
    }

    if (!isEmpty(getInfo.credit) && getInfo.credit == true) {
      query.push({ iscredit: getInfo.credit });
    }

    if (!isEmpty(getInfo.province)) {
      query.push({ province: getInfo.province });
    }

    if (!isEmpty(getInfo.city)) {
      query.push({ city: getInfo.city });
    }

    if (!isEmpty(getInfo.category)) {
      query.push({ category: getInfo.category });
    }

    if (!isEmpty(getInfo.search)) {
      query.push({ $or: [{ title: { $regex: getInfo.search } }, { description: { $regex: getInfo.search } }] });
    }

    if (!isEmpty(getInfo.installmentsCredit) && getInfo.installmentsCredit == true) {
      query.push({ isinstallmentsCredit: getInfo.installmentsCredit });
    }

    if (!isEmpty(getInfo.internet) && getInfo.internet == true) {
      query.push({ isinternet: getInfo.internet });
    }

    if (!isEmpty(getInfo.mozarebe) && getInfo.mozarebe == true) {
      query.push({ ismozarebe: getInfo.mozarebe });
    }
    return query;
  }

  checkEmptyInputs(getInfo: StoreTerminalSearchDto) {
    if (
      isEmpty(getInfo.mozarebe) &&
      isEmpty(getInfo.internet) &&
      isEmpty(getInfo.installmentsCredit) &&
      isEmpty(getInfo.search) &&
      isEmpty(getInfo.category) &&
      isEmpty(getInfo.city) &&
      isEmpty(getInfo.province) &&
      isEmpty(getInfo.credit) &&
      isEmpty(getInfo.discount) &&
      isEmpty(getInfo.favorited) &&
      isEmpty(getInfo.installments)
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkFalseInputs(getInfo: StoreTerminalSearchDto) {
    if (
      getInfo.installmentsCredit == false &&
      getInfo.favorited == false &&
      getInfo.credit == false &&
      getInfo.discount == false &&
      getInfo.mozarebe == false &&
      getInfo.internet == false &&
      getInfo.installments == false
    ) {
      return true;
    } else {
      return false;
    }
  }

  setSort(sort?) {
    switch (true) {
      case isEmpty(sort): {
        return { createdAt: -1 };
        break;
      }

      case sort == MerchanSort.Visit: {
        return { visit: -1 };
        break;
      }

      case sort == MerchanSort.Rate: {
        return { rate: -1 };
        break;
      }

      case sort == MerchanSort.Discount: {
        return { discbank: -1 };
        break;
      }
    }
  }

  // public list
  async getPublicListStores(page, sort?): Promise<any> {
    const data = await this.terminalService.getAllTermianls(page, sort);
    let tempData = [];
    for (let index = 0; index < data.docs.length; index++) {
      let dataRules = [
        { label: 'تخفیف نقدی  ', value: data.docs[index].discbank },
        { label: 'تخفیف اعتباری', value: data.docs[index].discnonebank },
      ];
      let newData = {
        _id: data.docs[index]._id,
        title: data.docs[index].title,
        logo: imageTransform(data.docs[index].merchant.logo),
        category: data.docs[index].merchant.category || ' ',
        description: data.docs[index].descrip || 'توضیحات تکمیل شود',
        type: data.docs[index].type || 1,
        address: data.docs[index].address,
        comments: 0,
        rate: 0,
        tel: data.docs[index].merchant.tell,
        data: dataRules,
        discounts: { bank: data.docs[index].discbank, nonebank: data.docs[index].discnonebank },
      };
      tempData.push(newData);
    }
    data.docs = tempData;
    return this.getList(data);
  }

  // search public list
  async searchPublicStores(getInfo: StoreTerminalSearchDto, page, sort?): Promise<any> {
    const query = this.selecttype(getInfo);
    let queryFinal;
    if (query.length > 0) {
      queryFinal = { $and: query };
    } else {
      queryFinal = false;
    }
    // if ( isEmpty(query) ) return this.getList([]);
    const data = await this.terminalService.searchTerminalsByUser(queryFinal, page, sort);
    let tempData = [];
    for (let index = 0; index < data.docs.length; index++) {
      let dataRules = [
        { label: 'تخفیف نقدی  ', value: data.docs[index].discbank },
        { label: 'تخفیف اعتباری', value: data.docs[index].discnonebank },
      ];

      let newData = {
        _id: data.docs[index]._id,
        title: data.docs[index].title,
        logo: imageTransform(data.docs[index].merchant.logo),
        category: data.docs[index].merchant.category || ' ',
        description: data.docs[index].descrip || 'توضیحات تکمیل شود',
        type: data.docs[index].type || 1,
        address: data.docs[index].address,
        comments: 0,
        rate: 0,
        tel: data.docs[index].merchant.tell,
        data: dataRules,
        discounts: { bank: data.docs[index].discbank, nonebank: data.docs[index].discnonebank },
      };
      tempData.push(newData);
    }
    data.docs = tempData;
    return this.getList(data);
  }

  // Get Public Store Details
  async showPublicStore(storeId): Promise<any> {
    const data = await this.terminalService.findByTerminal(storeId);
    if (!data) throw new UserCustomException('متاسفانه فروشگاه مورد نظر یافت نشد', false, 404);
    this.terminalService.updateVisit(storeId);
    const merchantInfo = await this.merchantCreditService.getOneDetails(storeId);

    return this.transformSuccessStore(this.showTerminalStore(data, false, merchantInfo));
  }

  async showSearchLists(): Promise<any> {}
}
