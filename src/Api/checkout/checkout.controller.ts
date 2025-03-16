import { Controller, Get, Res, Post, Delete, Body, Req, Put, InternalServerErrorException } from '@vision/common';
import { CheckoutDto } from './dto/checkout.dto';
import { CheckoutService } from './checkout.service';
import { GeneralService } from '../../Core/service/general.service';
import { CheckoutCoreService } from '../../Core/checkout/checkout/checkoutcore.service';
import { CheckoutSubmitCoreService } from '../../Core/checkout/submit/checkoutsubmitcore.service';
import { CheckoutSubmitDto } from './dto/checkoutsubmit.dto';
import { currentDayNum } from '@vision/common/utils/month-diff.util';
import { CheckoutSubmitBankService } from '../../Core/checkout/submit/checkout-submit-core-bank.service';
import { CheckoutAutomaticDto } from './dto/checkout-automatic.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly generalService: GeneralService,
    private readonly checkoutCoreService: CheckoutCoreService,
    private readonly submitCheckoutService: CheckoutSubmitBankService
  ) {}

  @Post()
  async create(@Body() getInfo: CheckoutDto, @Req() req, @Res() res): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.user = userid;
    const addnew = await this.checkoutCoreService.insertCheckout(getInfo);
    if (!addnew) throw new InternalServerErrorException();
    return res.status(200).json({
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
    });
  }

  @Get()
  async getList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const instant = await this.checkoutCoreService.getListInstant(userid);
    const shaparak = await this.checkoutCoreService.getListShaparak(userid);
    return this.checkoutService.listTransform(instant, shaparak);
  }

  @Delete()
  async deleteCard(@Req() req, @Res() res): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const account = this.checkoutService.checkDeleteHeader(req);
    this.checkoutCoreService
      .deleteItem(account, userid)
      .then((success) => {
        return res.status(200).json({
          status: 200,
          success: true,
          message: 'عملیات با موفقیت انجام شد',
        });
      })
      .catch((error) => {
        return res.status(200).json({
          status: 201,
          success: false,
          message: 'عملیات با خطا مواجه شد',
        });
      });
  }
  @Put()
  async updateform(@Body() getInfo: CheckoutDto, @Req() req, @Res() res): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.user = userid;
    this.checkoutCoreService
      .updateItem(getInfo)
      .then((data) => {
        return res.status(200).json({
          status: 200,
          success: true,
          message: 'عملیات با موفقیت انجام شد',
        });
      })
      .catch((error) => {
        return res.status(200).json({
          status: 201,
          success: false,
          message: 'عملیات با خطا مواجه شد',
        });
      });
  }

  @Post('submit')
  async submitCheckout(@Body() getInfo: CheckoutSubmitDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.user = userid;
    if (currentDayNum() == 5) {
      throw new UserCustomException('در روز های جمعه تسویه حساب غیر فعال می باشد');
    }
    return this.submitCheckoutService.submit(getInfo);
  }

  @Post('auto')
  async submitAutomatic(@Body() getInfo: CheckoutAutomaticDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.checkoutService.submitNewAutomatic(getInfo, userid);
  }

  // @Get('auto')
  // async getAutoInfo( @Req() req ): Promise<any> {
  //   const userid = await this.generalService.getUserid( req );
  //   return this.checkoutService.getList( userid );
  // }

  // @Delete('auto')
  // async removeAuto( @Req() req ): Promise<any> {
  //   const userid = await this.generalService.getUserid( req );
  //   return this.checkoutService.remove( userid );
  // }

  @Get('banks')
  async msihe(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.checkoutService.banks(userid);
  }
}
