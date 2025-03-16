import { BadRequestException, ForbiddenException, Injectable } from '@vision/common';
import { isNil } from '@vision/common/utils/shared.utils';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { AclCoreService } from '../../../Core/acl/acl.service';
import { LeasingRef } from '../../../Core/leasing-ref/interfaces/leasing-ref.interface';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { AddNewLeasingRefDto } from '../dto/add-new-leasing-ref.dto';
import { GetLeasingRefUserDataDto } from '../dto/get-leasing-ref-user-data.dto';
import { imageTransform } from '@vision/common/transform/image.transform';
import { LeasingRefCoreService } from '../../../Core/leasing-ref/leasing-ref.service';
import { LeasingRefReformDto } from '../dto/leasing-ref-reform.dto';

@Injectable()
export class LeasingRefUtilsService {
  constructor(
    private readonly aclCoreService: AclCoreService,
    private readonly userCoreService: UserService,
    private readonly leasingRefCoreService: LeasingRefCoreService
  ) {}

  async checkIfLeasingRefCanBeReformed(leasingRefId: string): Promise<void> {
    const leasingRef = await this.leasingRefCoreService.getDeclinedById(leasingRefId);
    if (!leasingRef) throw new BadRequestException('امکان اصلاح درخواست تأیید شده و یا در انتظار بررسی وجود ندارد');
  }

  async checkIfItIsADuplicateRequest(userId: any, dto: AddNewLeasingRefDto): Promise<void> {
    const leasingRef = await this.leasingRefCoreService.getByLeasingUserAndClubUser(userId, dto.id);
    if (leasingRef) throw new BadRequestException(`این شماره قبلا ثبت‌شده است`);
  }

  async validateLeasingRefReformDto(dto: LeasingRefReformDto): Promise<void> {
    if (isNil(dto) || isNil(dto.message) || dto.message === '')
      throw new BadRequestException('توضیحات مربوط به اصلاحات الزامیست');
    if (dto.message.length > 1000) throw new BadRequestException('توضیحات نباید بیشتر از ۱۰۰۰ حرف باشد');
  }

  async validateAddNewLeasingRefDto(dto: AddNewLeasingRefDto): Promise<void> {
    if (!dto) throw new BadRequestException('تمامی فیلدها را پر کنید');
    if (typeof dto.id !== 'string' || isNil(dto.id)) throw new BadRequestException('فیلد id الزامیست');
    if (typeof dto.mobile !== 'string' || isNil(dto.mobile)) throw new BadRequestException('شماره موبایل الزامیست');
    const parsedValue = Number(dto.mobile);
    if (Number.isNaN(parsedValue)) throw new BadRequestException('شماره موبایل وارد شده صحیح نیست');
  }

  async normalizeMobileNumber(mobile: string): Promise<number> {
    return parseInt(mobile, 10);
  }

  async validateUpdateShowDto(dto: Pick<LeasingRef, 'show'>): Promise<void> {
    if (!dto || typeof dto.show !== 'boolean') throw new BadRequestException('تمامی فیلدها را پر کنید');
  }

  async validateGetLeasingRefUserDataDto(dto: GetLeasingRefUserDataDto): Promise<void> {
    if (!dto) throw new BadRequestException('تمامی فیلدها را پر کنید');
    if (!dto.mobile) throw new BadRequestException('شماره موبایل الزامیست');
    const parsedValue = Number(dto.mobile);
    if (Number.isNaN(parsedValue)) throw new BadRequestException('شماره موبایل وارد شده صحیح نیست');
  }

  async checkAcl(userId: string): Promise<void> {
    const acl = await this.aclCoreService.getAclUSer(userId);
    if (acl) {
      if (acl.user.type !== 'customerclub') {
        if (acl.leasingmanager === false) {
          throw new ForbiddenException('شما به این قسمت دسترسی ندارید');
        }
      }
    } else {
      throw new ForbiddenException('شما به این قسمت دسترسی ندارید');
    }
  }

  async validateLeasingUserAccount(data: GetLeasingRefUserDataDto): Promise<void> {
    const normalizedMobileNumber = await this.normalizeMobileNumber(data.mobile);
    const userData = await this.userCoreService.getInfoByMobile(normalizedMobileNumber);
    if (!userData) {
      throw new UserNotfoundException('کاربر مورد نظر یافت نشد');
    }

    if (!userData.islegal) {
      // an individual user. check the identify data
      const isUnidentifiedIndividualUser = await this.isIndividualUserUnidentified(userData);
      if (isUnidentifiedIndividualUser) {
        throw new UserNotfoundException('این کاربر (حقیقی) احراز هویت نشده است');
      }
    } else {
      const isUnidentifiedLegalUser = await this.isLegalUserUnidentified(userData);
      // this is a legal account.
      if (isUnidentifiedLegalUser) {
        throw new UserNotfoundException('این کاربر (حقوقی) احراز هویت نشده است');
      }
    }

    return;
  }

  async isIndividualUserUnidentified(userData: any): Promise<boolean> {
    return !userData.nationalcode || !userData.birthdate || !userData.fullname;
  }

  async isLegalUserUnidentified(userData: any): Promise<boolean> {
    return (
      !userData.legal?.title ||
      !userData.legal?.name ||
      !userData.legal?.logo ||
      !userData.nationalcode ||
      !userData.birthdate ||
      !userData.fullname
    );
  }

  async populateLeasingUserAccount(data: GetLeasingRefUserDataDto): Promise<any> {
    const normalizedMobileNumber = await this.normalizeMobileNumber(data.mobile);
    const userData = await this.userCoreService.getInfoByMobile(normalizedMobileNumber);
    if (!userData) {
      throw new UserNotfoundException('کاربر مورد نظر یافت نشد');
    }

    let identifyState = '';
    let isIdentified = true;

    if (!userData.islegal) {
      // an individual user. check the identify data
      const isUnidentifiedIndividualUser = await this.isIndividualUserUnidentified(userData);
      if (isUnidentifiedIndividualUser) {
        identifyState = 'کاربر (حقیقی) احراز هویت نشده است';
        isIdentified = false;
      }
    } else {
      const isUnidentifiedLegalUser = await this.isLegalUserUnidentified(userData);
      // this is a legal account.
      if (isUnidentifiedLegalUser) {
        identifyState = 'کاربر (حقوقی) احراز هویت نشده است';
        isIdentified = false;
      }
    }

    return {
      mobile: userData.mobile,
      _id: userData._id,
      nationalcode: userData.nationalcode,
      islegal: userData.islegal,
      legal: userData.legal,
      avatar: imageTransform(userData.avatar),
      fullname: userData.fullname,
      birthdate: userData.birthdate,
      identifyState,
      isIdentified,
    };
  }
}
