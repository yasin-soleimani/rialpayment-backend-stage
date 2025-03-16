import { BadRequestException, Injectable, InternalServerErrorException } from '@vision/common';
import { imageTransform } from '@vision/common/transform/image.transform';
import { IpgCoreService } from '../../../Core/ipg/ipgcore.service';
import { CreateLeasingApplyDto } from '../../../Core/leasing-apply/dto/create-leasing-apply.dto';
import { UpdateLeasingApplyDto } from '../../../Core/leasing-apply/dto/update-leasing-apply.dto';
import {
  LeasingApply,
  LeasingApplyDocument,
  LeasingApplyFormField,
} from '../../../Core/leasing-apply/interfaces/leasing-apply.interface';
import { LeasingApplyCoreService } from '../../../Core/leasing-apply/leasing-apply.service';
import { LeasingFormTypeEnum } from '../../../Core/leasing-form/enums/leasing-form-type.enum';
import { LeasingOptionCoreService } from '../../../Core/leasing-option/leasing-option.service';
import { LeasingRef } from '../../../Core/leasing-ref/interfaces/leasing-ref.interface';
import { LeasingRefCoreService } from '../../../Core/leasing-ref/leasing-ref.service';
import { LoggercoreService } from '../../../Core/logger/loggercore.service';
import { PaginateResult } from '../../../utils/types.util';

@Injectable()
export class LeasingApplyCommonService {
  constructor(
    private readonly leasingOptionsCoreService: LeasingOptionCoreService,
    private readonly leasingRefCoreService: LeasingRefCoreService,
    private readonly leasingApplyCoreService: LeasingApplyCoreService,
    private readonly ipgCoreService: IpgCoreService,
    private readonly loggerService: LoggercoreService
  ) {}

  async getLeasingRefById(leasingRefId: string): Promise<LeasingRef> {
    const data = await this.leasingRefCoreService.getById(leasingRefId);
    if (!data) throw new BadRequestException('سرمایه‌گذار یافت نشد');
    return data;
  }

  async updateApplyByLeasing(leasingApplyId: string, dto: UpdateLeasingApplyDto): Promise<LeasingApplyDocument> {
    return this.leasingApplyCoreService.updateStatus(leasingApplyId, dto);
  }

  async getTheApply(applyId: string): Promise<LeasingApply[]> {
    const data = await this.leasingApplyCoreService.getById(applyId);
    return this.normalizeLeasingApplyData(data);
  }

  async getTheApplyForUser(applyId: string): Promise<LeasingApply[]> {
    const data = await this.leasingApplyCoreService.getByIdForUser(applyId);
    return this.normalizeLeasingApplyData(data);
  }

  async getTheLeasingOptions(leasingRefId: string): Promise<any> {
    return this.leasingOptionsCoreService.getByLeasingUserId(leasingRefId);
  }

  async addNewApplication(normalizedDto: CreateLeasingApplyDto): Promise<LeasingApplyDocument> {
    return this.leasingApplyCoreService.create(normalizedDto);
  }

  async getUserApplyList(userId: string): Promise<LeasingApply[]> {
    const data = await this.leasingApplyCoreService.getByApplicant(userId);
    return this.normalizeLeasingApplyData(data);
  }

  async getApplyListForLeasing(page: number, aggregate: any): Promise<any> {
    const data = await this.leasingApplyCoreService.getList(page, aggregate);
    return this.normalizeLeasingApplyPaginationData(data);
  }

  async updateApplicationByApplicant(
    userId: any,
    leasingApplyId: string,
    normalizedDto: LeasingApplyFormField[]
  ): Promise<any> {
    try {
      let updatedApply = null;
      for (const dto of normalizedDto) {
        updatedApply = await this.leasingApplyCoreService.updateByApplicant(userId, leasingApplyId, dto);
      }
      return updatedApply;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('خطایی اتفاق افتاده است');
    }
  }

  private async normalizeLeasingApplyData(data: LeasingApply[]): Promise<LeasingApply[]> {
    const clone = [...data];
    const temp: any[] = [];

    for (let i = 0; i < clone.length; i++) {
      const element = clone[i];
      const formsClone = [...element.form];
      const nonFileFields = formsClone.filter((el) => el.type !== LeasingFormTypeEnum.FILE);
      const fileFields = formsClone.filter((el) => el.type === LeasingFormTypeEnum.FILE);
      let updatedFormArray = [];

      if (fileFields.length > 0) {
        updatedFormArray = nonFileFields;
        for (const field of fileFields) {
          console.log({ field });
          updatedFormArray.push({ ...field, link: imageTransform(field.value) });
        }
        element.form = updatedFormArray;
      }

      temp.push(element);
    }

    return temp;
  }

  private async normalizeLeasingApplyPaginationData(
    data: PaginateResult<LeasingApply>
  ): Promise<PaginateResult<LeasingApply>> {
    const objectClone = { ...data };
    const clone = [...objectClone.docs];
    const temp: any[] = await this.normalizeLeasingApplyData(clone);
    objectClone.docs = [...temp];
    return objectClone;
  }
}
