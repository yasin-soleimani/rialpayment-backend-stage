import { BadRequestException, Injectable, InternalServerErrorException } from '@vision/common';
import { AclCoreService } from '../../../Core/acl/acl.service';
import { ForbiddenException } from '@vision/common/exceptions/forbidden.exception';
import { CreateLeasingInfoDto } from '../../../Core/leasing-info/dto/create-leasing-info.dto';
import { isNil, isString } from '@vision/common/utils/shared.utils';
import * as uniqid from 'uniqid';
import { UpdateLeasingInfoDto } from '../../../Core/leasing-info/dto/update-leasing-info.dto';
import { CheckLeasingInfoTitleDto } from '../dto/check-leasing-info-title.dto';
import { LeasingContractCoreService } from '../../../Core/leasing-contract/leasing-contract.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { UPLOAD_URI } from '../../../__dir__';

@Injectable()
export class LeasingInfoUtilityService {
  constructor(
    private readonly aclCoreService: AclCoreService,
    private readonly leasingContractCoreService: LeasingContractCoreService
  ) {}

  async checkAcl(userId: string): Promise<void> {
    const acl = await this.aclCoreService.getAclUSer(userId);
    if (!acl || !acl.leasing) throw new ForbiddenException('شما به این قسمت دسترسی ندارید');
  }

  async validateCreateLeasingInfoDto(dto: CreateLeasingInfoDto): Promise<void> {
    if (isNil(dto)) throw new BadRequestException('تمامی فیلد‌ها را پر کنید');
    if (isNil(dto.title) || dto.title === '') throw new BadRequestException('عنوان الزامیست');
    if (!isString(dto.title)) throw new BadRequestException('عنوان باید string باشد');
    if (dto.title.length < 3) throw new BadRequestException('عنوان حداقل باید 3 حرفی باشد');
    if (dto.title.length > 128) throw new BadRequestException('عنوان حداکثر باید ۱۲۸ حرفی باشد');
    if (isNil(dto.logo)) throw new BadRequestException('لوگو الزامیست');
    if (!isNil(dto.description) && dto.description !== '') {
      // NOTE: description field is not required so check it's length validity only if user fills up the field
      if (dto.description.length > 512) throw new BadRequestException('توضیحات باید حداکثر 512 حرفی باشد');
    }
  }

  async validateUpdateLeasingInfoDto(dto: UpdateLeasingInfoDto): Promise<any> {
    if (isNil(dto.title) || dto.title === '') throw new BadRequestException('عنوان الزامیست');
    if (dto.title.length > 128) throw new BadRequestException('عنوان حداکثر باید ۱۲۸ حرفی باشد');
    if (!isNil(dto.description) && dto.description !== '') {
      // NOTE: description field is not required so check it's length validity only if user fills up the field
      if (dto.description.length > 512) throw new BadRequestException('توضیحات باید حداکثر 256 حرفی باشد');
    }
  }

  async uploadLogo(logo: any): Promise<string> {
    console.log('uploading leasingInfo Logo:::: ', logo);

    const mime = await this.checkMime(logo.mimetype);
    const originalFile = logo;
    const uuid = uniqid();
    const normalizedFileName = uuid + '.' + mime;
    await originalFile.mv(UPLOAD_URI + normalizedFileName, (err) => {
      console.log('upload error:::: ', err);
      if (err) throw new InternalServerErrorException();
    });

    return normalizedFileName;
  }

  async uploadLogoIfExists(dto: UpdateLeasingInfoDto): Promise<string> {
    if (dto.logo) return await this.uploadLogo(dto.logo);
    else return null;
  }

  async checkMime(mimetype: string): Promise<string> {
    switch (mimetype) {
      case 'image/png': {
        return 'png';
      }
      case 'image/jpg': {
        return 'jpg';
      }
      case 'image/jpeg': {
        return 'jpeg';
      }
      default:
        throw new BadRequestException('لوگو باید به یکی از فرمت‌های png, jpg و یا jpeg باشد');
    }
  }

  async normalizeUpdateLeasingInfoDto(
    normalizedFileName: string,
    dto: UpdateLeasingInfoDto
  ): Promise<Partial<UpdateLeasingInfoDto>> {
    return normalizedFileName ? { title: dto.title, logo: normalizedFileName } : { title: dto.title };
  }

  async validateCheckLeasingInfoTitleDto(body: CheckLeasingInfoTitleDto): Promise<void> {
    if (isNil(body) || isNil(body.title) || body.title === '') throw new BadRequestException('عنوان الزامیست');
    if (body.title.length < 3) throw new BadRequestException('عنوان باید حداقل ۳ حرفی باشد');
    if (body.title.length > 128) throw new BadRequestException('عنوان باید حداکثر 128 حرفی باشد');
  }

  async checkIfLeasingHasActiveContract(userId: string): Promise<void> {
    const data = await this.leasingContractCoreService.findCurrentlyActiveContractByLeasingUser(userId);
    if (!data) throw new UserCustomException('قرارداد شما هنوز تأیید نشده و یا قراردادی تعریف نشده است.');
    return;
  }
}
