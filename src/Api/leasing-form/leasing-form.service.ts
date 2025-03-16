import { Injectable, successOptWithDataNoValidation } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { BadRequestException } from '@vision/common/exceptions/bad-request.exception';
import { LeasingFormUpdateDto } from '../../Core/leasing-form/dto/leasing-form-update.dto';
import { LeasingFormCoreService } from '../../Core/leasing-form/leasing-form.service';
import { LeasingInfoUtilityService } from '../leasing-info/services/leasing-info-utils.service';
import { CreateLeasingFormDto } from './dto/create-leasing-form.dto';
import { CounterCoreService } from '../../Core/counter/counter.service';
import { LeasingFormTypeEnum } from '../../Core/leasing-form/enums/leasing-form-type.enum';
import { LeasingForm } from '../../Core/leasing-form/interfaces/leasing-form.interface';
import { getFormKey } from './functions/get-form-key.func';
import { LeasingApplyCoreService } from '../../Core/leasing-apply/leasing-apply.service';

@Injectable()
export class LeasingFormService {
  constructor(
    private readonly leasingFormCoreService: LeasingFormCoreService,
    private readonly leasingUtilityService: LeasingInfoUtilityService,
    private readonly counterService: CounterCoreService,
    private readonly leasingApplyCoreService: LeasingApplyCoreService
  ) {}

  async getTheLeasingForm(userId: string, formId: string): Promise<any> {
    await this.leasingUtilityService.checkAcl(userId);
    const data = await this.leasingFormCoreService.getById(formId);
    if (data) {
      return successOptWithDataNoValidation(data);
    } else {
      throw new UserCustomException('موردی یافت نشد');
    }
  }

  async deleteLeasingForm(userId: string, formId: string): Promise<any> {
    await this.leasingUtilityService.checkAcl(userId);
    const data = await this.leasingFormCoreService.remove(formId);
    if (data) {
      return successOptWithDataNoValidation(data);
    } else {
      throw new UserCustomException('موردی یافت نشد');
    }
  }

  async updateLeasingForm(userId: string, formId: string, body: LeasingFormUpdateDto): Promise<any> {
    await this.leasingUtilityService.checkAcl(userId);
    await this.checkIfLeasingHasPendingOrDeclinedApplyRequest(userId);
    await this.validateUpdateLeasingFormDto(body);
    const normalizedData = await this.normalizeUpdateLeasingFormDto(body);
    const data = await this.leasingFormCoreService.update(formId, normalizedData);
    return successOptWithDataNoValidation(data);
  }

  async checkIfLeasingHasPendingOrDeclinedApplyRequest(userId: string): Promise<void> {
    const apply = await this.leasingApplyCoreService.getPendingOrDeclinedApplyByLeasingUser(userId);
    if (apply)
      throw new UserCustomException(
        'شما حداقل یک درخواست اعتبار تأیید نشده دارید. به همین دلیل قادر به ویرایش فرم نیستید'
      );
  }

  async addLeasingForm(userId: string, body: CreateLeasingFormDto): Promise<any> {
    await this.leasingUtilityService.checkAcl(userId);
    await this.leasingUtilityService.checkIfLeasingHasActiveContract(userId);
    await this.validateCreateLeasingFormDto(body);
    const normalizedData = await this.normalizeCreateLeasingFormDto(userId, body);
    const data = await this.leasingFormCoreService.add(normalizedData);
    return successOptWithDataNoValidation(data);
  }

  async getLeasingForms(userId: string): Promise<any> {
    await this.leasingUtilityService.checkAcl(userId);
    const data = await this.leasingFormCoreService.getByLeasingUser(userId);
    return successOptWithDataNoValidation(data);
  }

  private async validateCreateLeasingFormDto(body: CreateLeasingFormDto): Promise<void> {
    if (typeof body !== 'object' || Object.keys(body).length < 1)
      throw new BadRequestException('تمامی فیلد‌ها را پر کنید');
    if (!body.title || typeof body.title !== 'string') throw new BadRequestException('عنوان الزامیست');
    if (body.title.length < 3) throw new BadRequestException('عنوان باید حداقل 3 حرفی باشد');
    if (body.title.length > 128) throw new BadRequestException('عنوان باید حداکثر 128 حرفی باشد');
    if (body.description && body.description.length > 512)
      throw new BadRequestException('توضیحات نباید بیشتر از 512 کاراکتر باشد');
    if (typeof body.required !== 'boolean') throw new BadRequestException('فیلد required الزامیست');
    if (!body.type) throw new BadRequestException('نوع فیلد الزامیست');
    switch (body.type) {
      case LeasingFormTypeEnum.EMAIL:
      case LeasingFormTypeEnum.FILE:
      case LeasingFormTypeEnum.MOBILE:
      case LeasingFormTypeEnum.NATIONAL_CODE:
      case LeasingFormTypeEnum.TEXT:
        break;
      default:
        throw new BadRequestException('نوع فرم انتخاب شده صحیح نیست');
    }
  }

  private async normalizeCreateLeasingFormDto(userId: string, body: CreateLeasingFormDto): Promise<LeasingForm> {
    const nextFormCounter = await this.counterService.getLeasingFormNumber();
    const key = await getFormKey(nextFormCounter);
    return { ...body, leasingUser: userId, deleted: false, key: key };
  }

  private async validateUpdateLeasingFormDto(body: LeasingFormUpdateDto): Promise<void> {
    if (typeof body !== 'object' || Object.keys(body).length < 1)
      throw new BadRequestException('تمامی فیلد‌ها را پر کنید');
    if (!body.title || typeof body.title !== 'string') throw new BadRequestException('عنوان الزامیست');
    if (body.title.length < 3) throw new BadRequestException('عنوان باید حداقل 3 حرفی باشد');
    if (body.title.length > 128) throw new BadRequestException('عنوان باید حداکثر 128 حرفی باشد');
    if (body.description && body.description.length > 512)
      throw new BadRequestException('توضیحات نباید بیشتر از 512 کاراکتر باشد');
    if (typeof body.required !== 'boolean') throw new BadRequestException('فیلد required الزامیست');
    if (!body.type) throw new BadRequestException('نوع فیلد الزامیست');
    switch (body.type) {
      case LeasingFormTypeEnum.EMAIL:
      case LeasingFormTypeEnum.FILE:
      case LeasingFormTypeEnum.MOBILE:
      case LeasingFormTypeEnum.NATIONAL_CODE:
      case LeasingFormTypeEnum.TEXT:
        break;
      default:
        throw new BadRequestException('نوع فرم انتخاب شده صحیح نیست');
    }
  }

  private async normalizeUpdateLeasingFormDto(body: LeasingFormUpdateDto): Promise<LeasingFormUpdateDto> {
    return {
      title: body.title,
      description: body.description,
      required: body.required,
      type: body.type,
    };
  }
}
