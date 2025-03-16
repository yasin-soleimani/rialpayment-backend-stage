import { Injectable, Body } from '@vision/common';
import { CategorycoreService } from '../../Core/category/categorycore.service';
import { CategoryaddDto } from './dto/category-add.dto';
import { CategorycoreeditDto } from '../../Core/category/dto/category-edit.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class CategoryService {
  constructor(private readonly categorycoreService: CategorycoreService) {}

  async newCategory(@Body() getInfo: CategoryaddDto): Promise<any> {
    const data = await this.categorycoreService.addCategory(getInfo);
    if (!data) throw new UserCustomException('متاسفانه مشکلی پیش آمده است', false, 500);
    return this.successTransform();
  }

  async getList(page): Promise<any> {
    const data = await this.categorycoreService.getList(page);
    return this.listTransform(data);
  }

  async getAllList(): Promise<any> {
    const data = await this.categorycoreService.getAll();
    return this.successTransformWithData(data);
  }

  async udpateCategory(@Body() getInfo: CategorycoreeditDto): Promise<any> {
    const data = await this.udpateCategory(getInfo);
    if (!data) throw new UserCustomException('متاسفانه مشکلی پیش آمده است', false, 500);
    return this.successTransform();
  }

  private listTransform(data) {
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      data: data.docs,
      total: data.total,
      limit: data.limit,
      page: data.page,
      pages: data.pages,
    };
  }

  private successTransform() {
    return {
      success: true,
      status: 200,
      message: 'عملیات با موفقیت انجام شد',
    };
  }

  private successTransformWithData(datax) {
    return {
      success: true,
      status: 200,
      message: 'عملیات با موفقیت انجام شد',
      data: datax,
    };
  }
}
