import { Controller, Post, Body, Req, Get, Put, Delete, Param } from '@vision/common';
import { Request } from 'express';
import {
  BasketProductOptionDto,
  BasketProductOptionUpdateDto,
} from '../../../Core/basket/product-option/dto/product-option.dto';
import { GeneralService } from '../../../Core/service/general.service';
import { BasketParcelProductDetailDto, BasketProductApiDto } from './dto/product.dto';
import { BasketProductApiService } from './product.service';
import { BasketProductExcelApiService } from './services/excel.service';
import { BasketProductExcelHyperApiService } from './services/excel-hyper.service';

@Controller('basket/product-v2')
export class BasketProductControllerV2 {
  constructor(
    private readonly generalService: GeneralService,
    private readonly productService: BasketProductApiService,
    private readonly excelService: BasketProductExcelApiService,
    private readonly excelHyperService: BasketProductExcelHyperApiService
  ) {}

  @Post()
  async addNew(@Body() getInfo: BasketProductApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.user = userid;
    return this.productService.addNewV2(getInfo, req);
  }

  @Post('checkslug')
  async checkSlug(@Body() getInfo: Pick<BasketProductApiDto, 'slug' | 'user'>, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.user = userid;
    return this.productService.checkSlug(getInfo.slug, getInfo.user);
  }

  @Get()
  async getList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.productService.getList(userid, page);
  }

  @Put()
  async update(@Body() getInfo: BasketProductApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.user = userid;
    return this.productService.updateV2(getInfo, req);
  }

  @Put('updateCategories')
  async updateAllCategory(@Req() req): Promise<any> {
    const id = await this.generalService.getUserid(req);
    console.log(id);
    const userShop = req.headers.userid;
    return this.productService.updateAllProductsCategory(userShop);
  }

  @Delete()
  async remove(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
    return this.productService.remove(id, userid);
  }

  @Post('details')
  async addNewDetail(@Body() getInfo: BasketParcelProductDetailDto, @Req() req: Request): Promise<any> {
    const productId = await this.generalService.getProductId(req);
    return this.productService.addNewDetail(getInfo, productId);
  }

  @Delete('details')
  async deleteTheDetail(@Req() req: Request): Promise<any> {
    const productId = await this.generalService.getProductId(req);
    const productDetailId = await this.generalService.getProductDetailId(req);
    return this.productService.removeParcelDetail(productDetailId, productId);
  }

  @Put('details')
  async updateTheDetail(@Body() getInfo: BasketParcelProductDetailDto, @Req() req: Request): Promise<any> {
    const productId = await this.generalService.getProductId(req);
    const productDetailId = await this.generalService.getProductDetailId(req);
    return this.productService.updateTheDetail(getInfo, productId, productDetailId);
  }

  @Get(':productId/option')
  async getAllOptions(@Param('productId') productId: string, @Req() req: Request): Promise<any> {
    await this.generalService.getUserid(req);
    return this.productService.getAllOptions(productId);
  }

  @Post(':productId/option')
  async addNewOption(
    @Param('productId') productId: string,
    @Body() dto: BasketProductOptionDto,
    @Req() req: Request
  ): Promise<any> {
    await this.generalService.getUserid(req);
    return this.productService.addNewOption(productId, dto);
  }

  @Delete(':productId/option/:optionId')
  async deleteTheOption(
    @Param('productId') productId: string,
    @Param('optionId') optionId: string,
    @Req() req: Request
  ): Promise<any> {
    await this.generalService.getUserid(req);
    return this.productService.deleteTheOption(productId, optionId);
  }

  @Put(':productId/option/:optionId')
  async updateTheOption(
    @Param('productId') productId: string,
    @Param('optionId') optionId: string,
    @Body() dto: BasketProductOptionUpdateDto,
    @Req() req: Request
  ): Promise<any> {
    await this.generalService.getUserid(req);
    return this.productService.updateTheOption(productId, optionId, dto);
  }

  @Put(':productId/multiOption')
  async updateMultiOptionStatus(
    @Param('productId') productId: string,
    @Body() dto: { multiOption: boolean },
    @Req() req: Request
  ): Promise<any> {
    await this.generalService.getUserid(req);
    return this.productService.updateMultiOptionStatus(productId, dto);
  }

  @Post('excel/hyper/upload')
  async uploadHyperExcel(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.excelHyperService.upload(userid, getInfo.category, req);
  }

  @Post('excel/hyper/upload/special-sells')
  async uploadSpecialSells(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.excelHyperService.uploadSpecialSells(userid, getInfo.category, req);
  }

  @Get('excel/hyper/download')
  async downloadHyperExcel(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const catid = await this.generalService.getCategory(req);
    return this.excelHyperService.export(catid, userid);
  }

  @Post('excel/upload')
  async uploadExcel(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.excelService.upload(userid, getInfo.category, req);
  }

  @Get('excel/download')
  async downloadExcel(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const catid = await this.generalService.getCategory(req);
    return this.excelService.export(catid, userid);
  }
}
