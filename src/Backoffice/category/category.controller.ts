import { Controller, Get, Post, Put, Req, Body, Delete, InternalServerErrorException } from '@vision/common';
import { CategoryaddDto } from './dto/category-add.dto';
import { CategoryService } from './category.servicce';
import { CategoryeditDto } from './dto/category-edit-dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getList(): Promise<any> {
    return this.categoryService.getList(1);
  }

  @Get('all')
  async getListAll(): Promise<any> {
    return this.categoryService.getAllList();
  }

  @Post()
  async addCategory(@Body() addDto: CategoryaddDto): Promise<any> {
    return this.categoryService.newCategory(addDto);
  }

  @Put()
  async updateCategory(@Body() editDto: CategoryeditDto): Promise<any> {
    return this.updateCategory(editDto);
  }
}
