import { Controller, Get, Req, Post, Put, Delete, Param, Body } from '@vision/common';
import { LeasingFormUpdateDto } from '../../Core/leasing-form/dto/leasing-form-update.dto';
import { GeneralService } from '../../Core/service/general.service';
import { CreateLeasingFormDto } from './dto/create-leasing-form.dto';
import { LeasingFormService } from './leasing-form.service';
import { Request } from 'express';

@Controller('leasing-form')
export class LeasingFormController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly leasingFormService: LeasingFormService
  ) {}

  @Get('')
  async getLeasingForms(@Req() req: Request): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingFormService.getLeasingForms(userId);
  }

  @Post('')
  async addLeasingForm(@Req() req: Request, @Body() body: CreateLeasingFormDto): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingFormService.addLeasingForm(userId, body);
  }

  @Put(':formId')
  async updateLeasingForm(
    @Req() req: Request,
    @Param('formId') formId: string,
    @Body() body: LeasingFormUpdateDto
  ): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingFormService.updateLeasingForm(userId, formId, body);
  }

  @Delete(':formId')
  async deleteLeasingForm(@Req() req: Request, @Param('formId') formId: string): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingFormService.deleteLeasingForm(userId, formId);
  }

  @Get(':formId')
  async getTheLeasingForm(@Req() req: Request, @Param('formId') formId: string): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingFormService.getTheLeasingForm(userId, formId);
  }
}
