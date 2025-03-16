import { BadRequestException, Injectable, successOpt, successOptWithDataNoValidation } from '@vision/common';
import { imageTransform } from '@vision/common/transform/image.transform';
import { CreateLeasingInfoDto } from '../../Core/leasing-info/dto/create-leasing-info.dto';
import { UpdateLeasingInfoDto } from '../../Core/leasing-info/dto/update-leasing-info.dto';
import { LeasingInfoCoreService } from '../../Core/leasing-info/leasing-info.service';
import { LeasingRefCoreService } from '../../Core/leasing-ref/leasing-ref.service';
import { CheckLeasingInfoTitleDto } from './dto/check-leasing-info-title.dto';
import { LeasingInfoUtilityService } from './services/leasing-info-utils.service';

@Injectable()
export class LeasingInfoService {
  constructor(
    private readonly leasingInfoCoreService: LeasingInfoCoreService,
    private readonly leasingInfoUtility: LeasingInfoUtilityService,
    private readonly leasingRefCodeService: LeasingRefCoreService
  ) {}

  async checkLeasingInfoTitle(userId: string, body: CheckLeasingInfoTitleDto): Promise<any> {
    await this.leasingInfoUtility.checkAcl(userId);
    await this.leasingInfoUtility.validateCheckLeasingInfoTitleDto(body);
    const data = await this.leasingInfoCoreService.checkDuplicateTitle(body);
    if (data) throw new BadRequestException('عنوان تکراریست');
    else return successOpt();
  }

  async getLeasingInfo(userId: string): Promise<any> {
    await this.leasingInfoUtility.checkAcl(userId);
    const data = await this.leasingInfoCoreService.getLeasingInfo(userId);
    // if (data === null) throw new UserCustomException('اطلاعات سرمایه‌گذار یافت نشد');
    if (data === null) {
      return successOptWithDataNoValidation(data);
    }
    const clone = {
      ...data,
      logo: imageTransform(data?.logo),
    };
    return successOptWithDataNoValidation(clone);
  }

  async createLeasingInfo(userId: string, dto: CreateLeasingInfoDto): Promise<any> {
    await this.leasingInfoUtility.checkAcl(userId);
    await this.leasingInfoUtility.validateCreateLeasingInfoDto(dto);
    const normalizedFileName = await this.leasingInfoUtility.uploadLogo(dto.logo);
    const leasingRef = await this.leasingRefCodeService.getByLeasingUser(userId);
    const normalizedDto = { ...dto, logo: normalizedFileName, leasingRef: leasingRef.id };
    const data = await this.leasingInfoCoreService.create(userId, normalizedDto);
    return successOptWithDataNoValidation(data);
  }

  async updateLeasingInfo(leasingInfoId: string, userId: string, dto: UpdateLeasingInfoDto): Promise<any> {
    await this.leasingInfoUtility.checkAcl(userId);
    await this.leasingInfoUtility.validateUpdateLeasingInfoDto(dto);
    const normalizedFileName = await this.leasingInfoUtility.uploadLogoIfExists(dto);
    const normalizedDto = await this.leasingInfoUtility.normalizeUpdateLeasingInfoDto(normalizedFileName, dto);
    const updateResult = await this.leasingInfoCoreService.updateLeasingInfo(leasingInfoId, normalizedDto);
    return successOptWithDataNoValidation(updateResult);
  }
}
