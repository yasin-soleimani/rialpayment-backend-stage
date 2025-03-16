import { Injectable, InternalServerErrorException, successOpt, successOptWithDataNoValidation } from '@vision/common';
import { BaksetCategoryService } from '../../../Core/basket/category/category.service';
import { BasketCategoryApiDto } from './dto/basket.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { BasketProductService } from '../../../Core/basket/products/services/product.service';

@Injectable()
export class BasketCategoryApiService {
  constructor(
    private readonly categoryService: BaksetCategoryService,
    private readonly productService: BasketProductService
  ) {}

  /*  async changeSlugToId(uri: string, userId: string) {
    uri.trim();
    const uriArray = uri.split('/');

    const newuri = new RegExp('^' + uri + '$');
    const categories = await this.categoryService.changeSlugToId(newuri, userId);
    return categories;
  }*/

  async checkSlugV2(getInfo: Pick<BasketCategoryApiDto, 'slug' | 'user' | 'parent'>): Promise<any> {
    const existingSlug = await this.getExistingSlug(getInfo);

    if (existingSlug.find) {
      throw new UserCustomException('slug تکراریست');
    } else {
      return successOpt();
    }
  }

  async addNewV2(getInfo: BasketCategoryApiDto): Promise<any> {
    if (
      isEmpty(getInfo.title) ||
      isEmpty(getInfo.slug) ||
      isEmpty(getInfo.metaTitle) ||
      isEmpty(getInfo.metaDescription)
    )
      throw new FillFieldsException();

    const existingSlug = await this.getExistingSlug(getInfo);

    if (existingSlug.find) throw new UserCustomException('slug تکراریست');

    getInfo.parent = existingSlug.parentId;

    const res = await this.categoryService.new(getInfo);

    if (!res) throw new InternalServerErrorException();

    return successOpt();
  }

  async editV2(getInfo: BasketCategoryApiDto, userid: string): Promise<any> {
    if (isEmpty(getInfo.title) || isEmpty(getInfo.id)) throw new FillFieldsException();

    const existingSlug = await this.getExistingSlug(getInfo);
    if (existingSlug.find && getInfo.id !== existingSlug.find._id.toString())
      throw new UserCustomException('slug تکراریست');

    getInfo.parent = existingSlug.parentId;
    const res = await this.categoryService.edit(getInfo, userid);
    if (!res) throw new InternalServerErrorException();

    return successOpt();
  }

  async removeV2(id: string, userid: string): Promise<any> {
    if (isEmpty(id)) throw new FillFieldsException();

    const res = await this.categoryService.remove(id, userid);
    if (!res) throw new InternalServerErrorException();

    return successOpt();
  }

  async getListV2(userid: string, parent: string): Promise<any> {
    if (!parent) throw new UserCustomException('دسته بندی مادر صحیح نمیباشد');
    parent = parent === 'root' ? '/' : parent;
    let res = await this.categoryService.listV2(userid, parent);
    if (!isEmpty(res)) {
      let tmpArray = Array();
      for (const info of res) {
        const products = await this.productService.getListProductsWithCategoryV2(userid, 0, info._id);
        tmpArray.push({
          _id: info._id,
          title: info.title,
          parent: info.parent || '/',
          metaTitle: info.metaTitle || '',
          metaDescription: info.metaDescription || '',
          slug: info.slug || '',
          type: info.type || 1,
          productsCount: products.docs.length,
        });
      }

      res = tmpArray;
    }

    return successOptWithDataNoValidation(res);
  }

  async getExistingSlug(getInfo): Promise<any> {
    let parentId = '/';
    if (!!getInfo.parent && getInfo.parent !== '/') {
      const findParent = await this.categoryService.findById(getInfo.parent);
      if (!findParent) throw new UserCustomException('دسته بندی مادر یافت نشد');
      parentId =
        findParent.parent === '/' ? findParent.parent + findParent._id : findParent.parent + '/' + findParent._id;
    }

    const find = await this.categoryService.findBySlugAndUserIdV2(getInfo.slug, parentId, getInfo.user);
    return { find, parentId };
  }

  async checkSlug(getInfo: Pick<BasketCategoryApiDto, 'slug' | 'user'>): Promise<any> {
    const existingSlug = await this.categoryService.findBySlugAndUserId(getInfo.slug, getInfo.user);
    if (existingSlug) {
      throw new UserCustomException('slug تکراریست');
    } else {
      return successOpt();
    }
  }

  async addNew(getInfo: BasketCategoryApiDto): Promise<any> {
    if (
      isEmpty(getInfo.title) ||
      isEmpty(getInfo.slug) ||
      isEmpty(getInfo.metaTitle) ||
      isEmpty(getInfo.metaDescription)
    )
      throw new FillFieldsException();

    const existingSlug = await this.categoryService.findBySlugAndUserId(getInfo.slug, getInfo.user);
    if (existingSlug) throw new UserCustomException('slug تکراریست');

    const res = await this.categoryService.new(getInfo);
    if (!res) throw new InternalServerErrorException();

    return successOpt();
  }

  async edit(getInfo: BasketCategoryApiDto, userid: string): Promise<any> {
    if (isEmpty(getInfo.title) || isEmpty(getInfo.id)) throw new FillFieldsException();

    const existingSlug = await this.categoryService.findBySlugAndUserId(getInfo.slug, getInfo.user);
    if (existingSlug && getInfo.id !== existingSlug._id.toString()) throw new UserCustomException('slug تکراریست');

    const res = await this.categoryService.edit(getInfo, userid);
    if (!res) throw new InternalServerErrorException();

    return successOpt();
  }

  async remove(id: string, userid: string): Promise<any> {
    if (isEmpty(id)) throw new FillFieldsException();

    const res = await this.categoryService.remove(id, userid);
    if (!res) throw new InternalServerErrorException();

    return successOpt();
  }

  async getList(userid: string): Promise<any> {
    let res = await this.categoryService.list(userid);
    if (!isEmpty(res)) {
      let tmpArray = Array();
      for (const info of res) {
        tmpArray.push({
          _id: info._id,
          title: info.title,
          metaTitle: info.metaTitle || '',
          metaDescription: info.metaDescription || '',
          slug: info.slug || '',
          type: info.type || 1,
          productsCount: info.products.length,
        });
      }

      res = tmpArray;
    }

    return successOptWithDataNoValidation(res);
  }
}
