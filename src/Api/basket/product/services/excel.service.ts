import {
  faildOptWithData,
  Injectable,
  InternalServerErrorException,
  successOpt,
  successOptWithDataNoValidation,
} from '@vision/common';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { BasketProductCardService } from '../../../../Core/basket/cards/cards.service';
import { BasketProductService } from '../../../../Core/basket/products/services/product.service';
import xlsx from 'node-xlsx';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import * as request from 'request';
import * as fs from 'fs';
import * as excel from 'exceljs';
import { todayDay } from '@vision/common/utils/month-diff.util';
import { BaksetCategoryService } from '../../../../Core/basket/category/category.service';
import { UPLOAD_URI, UPLOAD_URI_USERS } from '../../../../__dir__';

@Injectable()
export class BasketProductExcelApiService {
  constructor(
    private readonly productService: BasketProductService,
    private readonly basketCardService: BasketProductCardService,
    private readonly basketCategoryService: BaksetCategoryService
  ) {}

  async export(category: string, userid: string): Promise<any> {
    const data = await this.productService.getAllProductsByCategoryId(category);
    if (data.lentgh < 1) throw new UserCustomException('محصولی یافت نشد');

    const result = await this.makeResult(data, userid);

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('محصولات');

    worksheet.columns = [
      { header: 'عنوان', key: 'title', width: 10 },
      { header: 'slug', key: 'slug', width: 10 },
      { header: 'توضیحات', key: 'description', width: 10 },
      { header: 'نوع محصول', key: 'type', width: 10 },
      { header: 'تعداد', key: 'qty', width: 10 },
      { header: 'قیمت', key: 'price', width: 30 },
      { header: 'عنوان متا', key: 'metaTitle', width: 30 },
      { header: 'توضیحات متا', key: 'metaDescription', width: 10 },
      { header: 'لینک عکس', key: 'imagelink', width: 15 },
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
    const categoryData = this.basketCategoryService.findById(category);

    const eachData = await actualXlsxData.forEach(async (value, index) => {
      if (value) {
        const slug = await this.checkSlug(value[1], userid);

        if (slug) {
          this.updateData(value, userid, category, slug, categoryData);
        } else {
          this.addNew(value, userid, category, categoryData);
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

  private async updateData(value, userid, category, slug, categoryData): Promise<any> {
    const model = {
      title: value[0],
      type: 1,
      qty: value[3],
      price: value[4],
      description: value[2],
      img: '',
      category: category,
      categoryMap:
        categoryData.parent === '/'
          ? categoryData.parent + categoryData._id
          : categoryData.parent + '/' + categoryData._id,
      user: userid,
      fields: undefined,
      metaTitle: value[5],
      metaDescription: value[6],
      slug: value[1],
    };
    let img = await this.imageMv(value[8]);
    if (!img) {
      delete model.img;
    } else {
      model.img = img;
    }

    return this.productService.update(model, slug._id);
  }

  private async addNew(value, userid, category, categoryData): Promise<any> {
    let img = await this.imageMv(value[8]);
    if (!img) img = '';

    return this.productService.new({
      title: value[0],
      type: 1,
      qty: value[3],
      price: value[4],
      description: value[2],
      img: img,
      category: category,
      categoryMap:
        categoryData.parent === '/'
          ? categoryData.parent + categoryData._id
          : categoryData.parent + '/' + categoryData._id,
      user: userid,
      fields: undefined,
      metaTitle: value[5],
      metaDescription: value[6],
      slug: value[1],
    });
  }

  private imageMv(url) {
    const mime = this.getMime(url);
    if (!mime) return false;

    const filname = new Date().getTime() + mime;
    const img = this.download(url, UPLOAD_URI + filname, function () {});

    return filname;
  }

  private checkFile(req) {
    if (!req.files) throw new FillFieldsException();
    if (!req.files.products) throw new FillFieldsException();
  }

  private getMime(url: string) {
    if (!url) return false;
    if (url.length < 5) return false;
    var expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    var regex = new RegExp(expression);

    if (!url.match(regex)) return false;

    const mime = url.substr(url.length - 4);
    if (mime == '.png' || mime == '.jpg') return mime;

    return false;
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

  download(uri, filename, callback) {
    try {
      request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
      });
    } catch {
      return null;
    }
  }

  makeResult(data, userId: String) {
    let tmp = Array();

    for (const item of data) {
      if (item.user != userId) throw new UserCustomException('شما به این دسته بندی دسترسی ندارید');

      tmp.push({
        title: item.title,
        type: item.type,
        qty: item.qty,
        price: item.price,
        description: item.description,
        category: item.category,
        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
        slug: item.slug,
      });
    }

    return tmp;
  }
}
