import { Controller, Post, Body, Req, Get, Res } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { BillInquiryApiDto } from './dto/bill-inquiry.dto';
import { BillInquiryApiService } from './bill-inquiry.service';
import { BillInquiryApiPaidListDto } from './dto/paid-list.dto';
import { BillInquiryListCoreService } from '../../Core/bill-inquiry/services/list.service';

@Controller('billinquiry')
export class BillInquiryController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly inquiryService: BillInquiryApiService,
    private readonly listService: BillInquiryListCoreService
  ) {}

  @Get()
  async getBillList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.listService.getList(userid);
  }

  @Post('payment')
  async payment(@Body() getInfo, @Req() req, @Res() res): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.inquiryService.payment(getInfo.id, userid, getInfo.devicetype, res);
  }

  @Post('callback')
  async callback(@Body() getInfo, @Req() req, @Res() res): Promise<any> {
    return this.inquiryService.callback(getInfo, res);
  }

  @Post('remove')
  async remove(@Body() getInfo: BillInquiryApiDto, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.listService.deleteByUserId(getInfo.id, userId);
  }

  @Post('info')
  async getInfo(@Body() getInfo: BillInquiryApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const referer = req.headers.referer;
    return this.inquiryService.getInfoBill(userid, getInfo, referer);
  }

  @Post('paid')
  async getPaidList(@Body() getInfo: BillInquiryApiPaidListDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    console.log(userid, getInfo);

    return this.inquiryService.getPaidList(userid, page, getInfo.type);
  }
}
