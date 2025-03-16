import {
  Controller,
  Get,
  Req,
  Post,
  Body,
  successOptWithDataNoValidation,
  Session,
  Res,
  Param,
  Put,
  Delete,
  Query,
} from '@vision/common';
import { VitrinService } from './vitrin.service';
import { GeneralService } from '../../../Core/service/general.service';
import { makeCaptcha } from '@vision/common/utils/captcha-maker.util';
import { VitrinIpgTransferDto } from './dto/vitrin-ipg-transfer.dto';
import { BasketVitrinCallback } from './services/callback.service';
import { MipgService } from '../../../Service/mipg/mipg.service';
import { query, Request } from 'express';
import { AddressDto } from './dto/address.dto';

@Controller('vitrin')
export class VitrinController {
  constructor(
    private readonly vitrinService: VitrinService,
    private readonly callbackService: BasketVitrinCallback,
    private readonly mipgService: MipgService,
    private readonly generalService: GeneralService
  ) {}

  @Get('store')
  async getStoreInformation(@Req() req: Request): Promise<any> {
    const nickname = await this.generalService.getNickname(req);
    return this.vitrinService.getStoreInformation(nickname);
  }

  @Get('store/all')
  async getAllStores(): Promise<any> {
    return this.vitrinService.getAllStores();
  }

  @Get('accountno')
  async getStoreInformationByAccountNo(@Req() req: Request): Promise<any> {
    const accountNo = await this.generalService.getAccountNo(req);
    return this.vitrinService.getStoreInformationByAccountNo(accountNo);
  }

  @Get('products')
  async productsList(@Req() req): Promise<any> {
    const account = await this.generalService.getID(req);
    const page = await this.generalService.getPage(req);
    const category = await this.generalService.getCategory(req);
    const categoryParent = await this.generalService.getCategorySlug(req);
    return this.vitrinService.getProductList(account, page, category, categoryParent);
  }

  @Get('products-v2')
  async productsListV2(@Req() req): Promise<any> {
    const account = await this.generalService.getID(req);
    const page = await this.generalService.getPage(req);
    const category = await this.generalService.getCategory(req);
    const categorySlug = await this.generalService.getCategorySlug(req);
    const categoryParent = await this.generalService.getCategoryParent(req);
    return this.vitrinService.getProductListV2(account, page, category, categoryParent, categorySlug);
  }

  @Get('products-v2/hyper')
  async productsListHyperV2(@Req() req): Promise<any> {
    const account = await this.generalService.getID(req);
    const page = await this.generalService.getPage(req);
    const category = await this.generalService.getCategory(req);
    const categorySlug = await this.generalService.getCategorySlug(req);
    const categoryParent = await this.generalService.getCategoryParent(req);
    return this.vitrinService.getProductListV2(account, page, category, categoryParent, categorySlug);
  }

  @Get('products/search')
  async productsListSearch(@Req() req, @Query('q') searchParam: string): Promise<any> {
    const account = await this.generalService.getID(req);
    const page = await this.generalService.getPage(req);
    return this.vitrinService.searchProductList(account, page, searchParam);
  }

  @Get('products/:slug')
  async getSingleProduct(@Req() req, @Param('slug') slug: string): Promise<any> {
    const account = await this.generalService.getID(req);
    return this.vitrinService.getSingleProduct(account, slug);
  }

  @Get('category/hyper')
  async categoryHyperList(@Req() req): Promise<any> {
    const account = await this.generalService.getID(req);
    return this.vitrinService.getCategoryHyperList(account);
  }

  @Get('category')
  async categoryList(@Req() req): Promise<any> {
    const account = await this.generalService.getID(req);
    return this.vitrinService.getCategoryList(account);
  }

  @Get('category-v2')
  async categoryListV2(@Req() req): Promise<any> {
    const account = await this.generalService.getID(req);
    const parent = await this.generalService.getCategoryParent(req);
    return this.vitrinService.getCategoryListV2(account, parent);
  }

  @Get('captcha')
  async getCaptcha(@Req() req, @Session() session): Promise<any> {
    const captcha = await makeCaptcha();
    session.captcha = captcha.data;
    return successOptWithDataNoValidation({
      id: session.id,
      base64: captcha.base64,
    });
  }

  @Post('transfer')
  async moneyTransfer(@Body() getInfo: VitrinIpgTransferDto, @Req() req): Promise<any> {
    return this.vitrinService.ipgMoneyTransfer(getInfo, req);
  }

  @Post('checkout')
  async checkout(@Body() getInfo, @Req() req: Request): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const referer = req.headers.referer;
    return this.vitrinService.submitCheckout(getInfo, userid, referer);
  }

  @Get('address')
  async getAddress(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.vitrinService.getAddresses(userid);
  }

  @Post('address')
  async addAddress(@Body() getInfo: AddressDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.vitrinService.addAddress(userid, getInfo);
  }

  @Put('address')
  async updateAddress(@Body() getInfo: Partial<AddressDto>, @Req() req): Promise<any> {
    await this.generalService.getUserid(req);
    const addressId = await this.generalService.getBasketAddressId(req);
    return this.vitrinService.updateAddress(addressId, getInfo);
  }

  @Delete('address')
  async deleteAddress(@Req() req): Promise<any> {
    await this.generalService.getUserid(req);
    const addressId = await this.generalService.getBasketAddressId(req);
    return this.vitrinService.deleteAddress(addressId);
  }

  @Post('callback')
  async trasnferCallback(@Body() getInfo, @Req() req, @Res() res): Promise<any> {
    return this.callbackService.transferCallback(getInfo, res);
  }

  @Get('transfer/:ref')
  async transferRedirect(@Param('ref') ref, @Res() res, @Req() req): Promise<any> {
    // return this.vitrinService.redirectTrans( ref, res );
    const protocol = req.protocol;
    let host = req.hostname;
    const url = req.originalUrl;
    if (!!host && !host.includes('sharjjet.ir')) {
      console.log('in redirect:::::::: ');
      let ex = host.split('.');
      ex[ex.length - 2] = 'sharjjet';
      host = ex.join('.');
      const fullUrl = `https://${host}${url}`;
      res.redirect(301, fullUrl);
      res.end();
      return;
    }
    return this.mipgService.shaparakPay(ref, res);
  }

  @Post('payment')
  async payment(@Body() getInfo: VitrinIpgTransferDto, @Req() req): Promise<any> {
    return this.vitrinService.ipgPayment(getInfo, req);
  }

  @Post('payment/callback')
  async paymentCallback(@Body() getInfo, @Req() req, @Res() res): Promise<any> {
    console.log('vitrin/payment-callback:::: ', getInfo);
    return this.callbackService.payment(getInfo, req, res);
  }

  @Post('payment/callback/inAppPurchase')
  async callbackInApp(@Body() getInfo, @Res() res): Promise<any> {
    return this.callbackService.inAppCallback(getInfo, res);
  }

  @Get('special-sells/:accountId')
  async getSpecialSells(@Req() req, @Param('accountId') accountId: string): Promise<any> {
    return this.vitrinService.getSpecialSells(accountId);
  }

  @Get('lottery/:accountId')
  async getLotteries(@Req() req, @Param('accountId') accountId: string): Promise<any> {
    return this.vitrinService.getLotteries(accountId);
  }

  @Get(':accountId/deliveryTimes')
  async getDeliveryTimes(@Req() req, @Param('accountId') accountId: string): Promise<any> {
    await this.generalService.getUserid(req);
    return this.vitrinService.getDeliveryTimes(accountId);
  }
}
