import { Body, Controller, Get, Param, Post, Put, Query, Req, Res } from '@vision/common';
import { Request } from 'express';
import { UpdateLeasingApplyDto } from '../../Core/leasing-apply/dto/update-leasing-apply.dto';
import { GeneralService } from '../../Core/service/general.service';
import { Roles } from '../../Guard/roles.decorations';
import { PossibleDeviceTypes } from '../../utils/types.util';
import { GetApplyListForLeasingQueryParams } from './dto/get-apply-list-for-leasing-query-params.dto';
import { LeasingApplyFormDto } from './dto/leasing-apply-form.dto';
import { UpdateLeasingApplyForm } from './dto/update-leasing-apply-form.dto';
import { LeasingApplyService } from './leasing-apply.service';
import { LeasingApplyCallbackService } from './services/leasing-apply-callback.service';

@Controller('leasing-apply')
export class LeasingApplyController {
  constructor(
    private readonly leasingApplyService: LeasingApplyService,
    private readonly generalService: GeneralService,
    private readonly callbackService: LeasingApplyCallbackService
  ) {}

  @Post('leasingUser/:leasingUserId/leasingOption/:leasingOptionId')
  async apply(
    @Req() req: Request,
    @Body() body: LeasingApplyFormDto,
    @Param('leasingUserId') leasingUser: string,
    @Param('leasingOptionId') leasingOption: string
  ): Promise<any> {
    console.log({ leasingApplyBody: body });
    const userId = await this.generalService.getUserid(req);
    return this.leasingApplyService.apply(req, userId, body, leasingUser, leasingOption);
  }

  @Get('user/list')
  async getApplyList(@Req() req: Request): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingApplyService.getUserApplyList(userId);
  }

  @Get('user/:leasingApplyId')
  async getTheApplyForUser(@Req() req: Request, @Param('leasingApplyId') applyId: string): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingApplyService.getTheLeasingApplyForUser(userId, applyId);
  }

  @Get('leasing/list')
  async getApplyListForLeasing(
    @Req() req: Request,
    @Query() queryParams: GetApplyListForLeasingQueryParams
  ): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.leasingApplyService.getApplyListForLeasing(userId, page, queryParams);
  }

  @Get('leasing/user-credits')
  async getUserCreditsForLeasing(@Req() req: Request): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingApplyService.getUserCreditsForLeasing(userId);
  }

  @Post('pay/callback')
  async paymentCallback(@Body() getInfo: any, @Req() req: Request, @Res() res: any): Promise<any> {
    console.log('leasing/pay/payment-callback:::: ', getInfo);
    return this.callbackService.payment(getInfo, req, res);
  }

  @Get('leasing/:leasingApplyId')
  async getTheApplyForLeasing(@Req() req: Request, @Param('leasingApplyId') applyId: string): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingApplyService.getTheLeasingApplyForLeasing(userId, applyId);
  }

  @Get('leasing/:leasingApplyId/pay')
  async payApplicationAmount(@Req() req: Request, @Param('leasingApplyId') applyId: string): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingApplyService.payApplicationAmount(userId, applyId);
  }

  @Get('options/:leasingRefId')
  async getTheLeasingOptions(@Req() req: Request, @Param('leasingRefId') leasingRefId: string): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingApplyService.getTheLeasingOptions(userId, leasingRefId);
  }

  @Put(':leasingApplyId/leasing')
  async updateLeasingApply(
    @Req() req: Request,
    @Param('leasingApplyId') leasingApplyId: string,
    @Body() dto: UpdateLeasingApplyDto
  ): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingApplyService.updateByLeasing(userId, leasingApplyId, dto);
  }

  @Put(':leasingApplyId/user')
  async updateLeasingApplyByApplicant(
    @Req() req: Request,
    @Param('leasingApplyId') leasingApplyId: string,
    @Body() body: UpdateLeasingApplyForm
  ): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingApplyService.updateLeasingApplyByApplicant(userId, leasingApplyId, req, body);
  }

  @Get(':devicetype')
  async getClubLeasingList(@Req() req: Request, @Param('devicetype') devicetype: PossibleDeviceTypes): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const referer = req.headers['referer'];
    return this.leasingApplyService.getLeasingList(userId, devicetype, referer);
  }
}
