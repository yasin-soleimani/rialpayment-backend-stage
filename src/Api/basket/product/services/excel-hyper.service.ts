import {
  faildOptWithData,
  Injectable,
  InternalServerErrorException,
  successOpt,
  successOptWithDataNoValidation,
} from '@vision/common';
import { BasketProductService } from '../../../../Core/basket/products/services/product.service';
import { BasketProductCardService } from '../../../../Core/basket/cards/cards.service';
import { BaksetCategoryService } from '../../../../Core/basket/category/category.service';
import { isEmpty, isString } from '@vision/common/utils/shared.utils';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import xlsx from 'node-xlsx';
import { BasketProductImagesService } from '../../../../Core/basket/images/images.service';
import * as excel from 'exceljs';
import * as fs from 'fs';
import { todayDay } from '@vision/common/utils/month-diff.util';
import { UPLOAD_URI_USERS } from '../../../../__dir__';

@Injectable()
export class BasketProductExcelHyperApiService {
  constructor(
    private readonly productService: BasketProductService,
    private readonly basketCardService: BasketProductCardService,
    private readonly basketCategoryService: BaksetCategoryService,
    private readonly basketImagesService: BasketProductImagesService
  ) {}

  async export(category: string, userid: string): Promise<any> {
    const data = await this.productService.getAllProductsByCategoryIdAndUser(category, userid);
    if (data.lentgh < 1) throw new UserCustomException('محصولی یافت نشد');

    const result = await this.makeResult(data, userid);

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('محصولات');

    worksheet.columns = [
      { header: 'بارکد', key: 'slug', width: 10 },
      { header: 'تعداد', key: 'qty', width: 10 },
      { header: 'قیمت', key: 'price', width: 30 },
      { header: 'فروش ویژه', key: 'specialSell', width: 30 },
      { header: 'عنوان', key: 'title', width: 10 },
      { header: 'توضیحات', key: 'description', width: 10 },
    ];

    worksheet.addRows(result);

    const dir = UPLOAD_URI_USERS + userid;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const today = todayDay();
    const filname = 'products ' + new Date().getTime() + today + '.xlsx';
    const worked = await workbook.xlsx
      .writeFile(dir + '/' + filname)
      .then(function () {
        console.log('file saved!');
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });

    const downloadLink = process.env.SITE_URL_EXCEL + userid + '/' + filname;
    return successOptWithDataNoValidation(downloadLink);
  }

  makeResult(data, userId: String) {
    let tmp = Array();

    for (const item of data) {
      let specialSell = '';
      if (item.hasOwnProperty('specialSell') && item.specialSell.hasOwnProperty('price') && !!item.specialSell.price)
        specialSell = item.specialSell.price;
      tmp.push({
        title: item.title,
        type: item.type,
        qty: item.qty,
        price: item.price,
        description: item.description,
        category: item.category,
        metaTitle: item.metaTitle,
        specialSell: specialSell,
        metaDescription: item.metaDescription,
        slug: item.slug,
      });
    }

    return tmp;
  }

  async uploadSpecialSells(userid: string, categoryid: string, req: any): Promise<any> {
    const excelFile = req.files.products;
    if (isEmpty(excelFile.data)) throw new UserCustomException('متاسفانه قالب بندی فایل شما درست نمی باشد', false, 500);

    const workSheetsFromBuffer = xlsx.parse(excelFile.data);

    const returnData = await this.submitForEachSpecialSells(workSheetsFromBuffer[0].data, userid, categoryid);
    if (returnData.length > 0) {
      return faildOptWithData(returnData);
    } else {
      return successOpt();
    }
  }
  private async submitForEachSpecialSells(data, userid: string, category: string): Promise<any> {
    let errorArray = Array();
    // filter out all empty arrays
    const filteredXlsxData = data.filter((element) => element.length > 0);
    // filter first row of xlsx file, cause it's just header
    const actualXlsxData = filteredXlsxData.slice(1, filteredXlsxData.length);
    await this.productService.setSpecialFalse(userid);
    const eachData = await actualXlsxData.forEach(async (value, index) => {
      if (value) {
        if (value[0] === '') return;
        const slug = await this.checkSlug(value[0], userid);

        if (slug) {
          this.updateDataSpecialSell(userid, slug);
        }
      } else {
        errorArray.push({
          index: index,
          msg: 'فقط محصولات فیزیکی پشتیبانی می شود',
        });
      }
    });

    return errorArray;
  }

  private async updateDataSpecialSell(userid, slug): Promise<any> {
    return this.productService.setSpecialTrue(userid, slug._id);
  }

  async upload(userid: string, categoryid: string, req: any): Promise<any> {
    const excelFile = req.files.products;
    if (isEmpty(excelFile.data)) throw new UserCustomException('متاسفانه قالب بندی فایل شما درست نمی باشد', false, 500);

    const workSheetsFromBuffer = xlsx.parse(excelFile.data);

    const returnData = await this.submitForEach(workSheetsFromBuffer[0].data, userid, categoryid);
    if (returnData.length > 0) {
      return faildOptWithData(returnData);
    } else {
      return successOpt();
    }
  }

  private async submitForEach(data, userid: string, category: string): Promise<any> {
    let errorArray = Array();
    // filter out all empty arrays
    const filteredXlsxData = data.filter((element) => element.length > 0);
    // filter first row of xlsx file, cause it's just header
    const actualXlsxData = filteredXlsxData.slice(1, filteredXlsxData.length);
    const setAllProductsQtyZero = await this.productService.setAllZero(userid);
    const eachData = await actualXlsxData.forEach(async (value, index) => {
      if (value) {
        if (value[0] === '') return;
        const slug = await this.checkSlug(value[0], userid);

        if (slug) {
          this.updateData(value, userid, slug);
        } else {
          this.addNew(value, userid);
        }
      } else {
        errorArray.push({
          index: index,
          msg: 'فقط محصولات فیزیکی پشتیبانی می شود',
        });
      }
    });

    return errorArray;
  }

  private async updateData(value, userid, slug): Promise<any> {
    const image = await this.basketImagesService.getImageByBarcode(value[0]);
    let categoryData = null;
    if (!!image) categoryData = await this.basketCategoryService.findById(image?.category);
    const [barcode, qty, price, specialSell, productName, description] = value;
    let newSpecial = {
      price: null,
    };
    let pricenew = typeof price === 'string' ? parseInt(price.replace(new RegExp(',', 'g'), '')) : price;
    if (!!specialSell) {
      if (!isNaN(parseInt(specialSell)) && parseInt(specialSell) > 0) newSpecial.price = parseInt(specialSell);
      else newSpecial.price = parseInt(specialSell.replace(new RegExp(',', 'g'), ''));
    }

    const model = {
      title: productName || image?.productName,
      type: 1,
      qty: qty,
      price: pricenew,
      description: description,
      img: image?.imageLink || '',
      category: image?.category || null,
      categoryMap:
        !!categoryData && categoryData.parent === '/'
          ? categoryData.parent + categoryData._id
          : categoryData?.parent ?? '' + '/' + categoryData?._id ?? '',
      user: userid,
      specialSell: newSpecial,
      fields: undefined,
      metaTitle: image?.productName,
      metaDescription: description,
      slug: barcode,
    };
    return this.productService.update(model, slug._id);
  }

  private async addNew(value, userid): Promise<any> {
    const image = await this.basketImagesService.getImageByBarcode(value[0]);
    let categoryData = null;
    if (!!image) categoryData = await this.basketCategoryService.findById(image?.category);
    const [barcode, qty, price, specialSell, productName, description] = value;
    let newSpecial = {
      price: null,
    };
    let pricenew = typeof price === 'string' ? parseInt(price.replace(new RegExp(',', 'g'), '')) : price;
    if (!!specialSell) {
      if (!isNaN(parseInt(specialSell)) && parseInt(specialSell) > 0) newSpecial.price = parseInt(specialSell);
      else newSpecial.price = parseInt(specialSell.replace(new RegExp(',', 'g'), ''));
    }
    return this.productService.new({
      title: productName || image?.productName,
      type: 1,
      qty: qty,
      price: pricenew,
      description: description,
      img: image?.imageLink || '',
      category: image?.category ?? null,
      categoryMap:
        categoryData?.parent === '/'
          ? categoryData?.parent + categoryData?._id
          : categoryData?.parent + '/' + categoryData?._id ?? null,
      user: userid,
      fields: undefined,
      specialSell: newSpecial,
      metaTitle: image?.productName ?? productName,
      metaDescription: description,
      slug: barcode,
    });
  }
  private async checkSlug(slug: string, userId: string): Promise<any> {
    const existingSlug = await this.productService.findBySlugAndUserId(slug, userId);
    console.log('existing slug:::::', existingSlug);
    if (existingSlug) {
      return existingSlug;
    } else {
      return false;
    }
  }
}
