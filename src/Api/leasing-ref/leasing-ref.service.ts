import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  successOptWithDataNoValidation,
} from '@vision/common';
import { imageTransform } from '@vision/common/transform/image.transform';

import { LeasingRef } from '../../Core/leasing-ref/interfaces/leasing-ref.interface';
import { LeasingRefCoreService } from '../../Core/leasing-ref/leasing-ref.service';
import { AddNewLeasingRefDto } from './dto/add-new-leasing-ref.dto';
import { GetLeasingRefUserDataDto } from './dto/get-leasing-ref-user-data.dto';
import { LeasingRefReformDto } from './dto/leasing-ref-reform.dto';
import { LeasingRefUtilsService } from './services/leasing-ref-utils.service';

@Injectable()
export class LeasingRefService {
  constructor(
    private readonly leasingRefCoreService: LeasingRefCoreService,
    private readonly leasingRefUtilsService: LeasingRefUtilsService
  ) {}

  async reform(userId: any, leasingRefId: string, dto: LeasingRefReformDto): Promise<any> {
    await this.leasingRefUtilsService.checkAcl(userId);
    await this.leasingRefUtilsService.validateLeasingRefReformDto(dto);
    await this.leasingRefUtilsService.checkIfLeasingRefCanBeReformed(leasingRefId);
    const data = await this.leasingRefCoreService.setNewReformMessage(leasingRefId, dto);
    if (data) {
      return successOptWithDataNoValidation(data);
    } else {
      throw new InternalServerErrorException('خطایی اتفاق افتاده است');
    }
  }

  async getClubLeasingRefs(userId: string): Promise<any> {
    await this.leasingRefUtilsService.checkAcl(userId);
    const data = await this.leasingRefCoreService.getListForLeasingManager(userId);
    const temp = [];
    for (const item of data) {
      const updatedData = {
        ...item,
        leasingUser: {
          ...item.leasingUser,
          avatar: imageTransform(item.leasingUser.avatar),
        },
      };
      temp.push(updatedData);
    }
    return successOptWithDataNoValidation(temp);
  }

  async getLeasingRefById(userId: any, leasingRefId: string): Promise<any> {
    await this.leasingRefUtilsService.checkAcl(userId);
    const data = await this.leasingRefCoreService.getById(leasingRefId);
    if (!data) throw new NotFoundException('موردی یافت نشد');
    return successOptWithDataNoValidation(data);
  }

  async updateShow(userId: any, leasingRefId: string, dto: Pick<LeasingRef, 'show'>): Promise<any> {
    await this.leasingRefUtilsService.checkAcl(userId);
    await this.leasingRefUtilsService.validateUpdateShowDto(dto);

    const data = await this.leasingRefCoreService.updateShow(leasingRefId, dto.show);
    if (data) {
      return successOptWithDataNoValidation(data);
    } else {
      throw new InternalServerErrorException('خطای سرور');
    }
  }

  async getLeasingRefUserData(userId: any, dto: GetLeasingRefUserDataDto): Promise<any> {
    await this.leasingRefUtilsService.checkAcl(userId);
    await this.leasingRefUtilsService.validateGetLeasingRefUserDataDto(dto);
    const userData = await this.leasingRefUtilsService.populateLeasingUserAccount(dto);
    return successOptWithDataNoValidation(userData);
  }

  async addNewLeasingRef(userId: any, dto: AddNewLeasingRefDto): Promise<any> {
    await this.leasingRefUtilsService.validateAddNewLeasingRefDto(dto);
    await this.leasingRefUtilsService.validateLeasingUserAccount(dto);
    await this.leasingRefUtilsService.checkIfItIsADuplicateRequest(userId, dto);
    const data = await this.leasingRefCoreService.create(userId, dto.id);
    if (data) {
      return successOptWithDataNoValidation(data);
    } else {
      throw new InternalServerErrorException('خطایی اتفاق افتاده است');
    }
  }
}
