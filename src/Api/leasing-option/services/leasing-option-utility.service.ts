import { BadRequestException, ForbiddenException, Injectable } from '@vision/common';
import { isNil } from '@vision/common/utils/shared.utils';
import { AclCoreService } from '../../../Core/acl/acl.service';
import { CreateLeasingOptionDto } from '../../../Core/leasing-option/dto/create-leasing-option.dto';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { LeasingFormCoreService } from '../../../Core/leasing-form/leasing-form.service';
import { LeasingOptionPatchAllowedTerminalsDto } from '../../../Core/leasing-option/dto/patch-allowed-terminals.dto';
import { UpdateLeasingOptionDto } from '../../../Core/leasing-option/dto/update-leasing-option.dto';
import { LeasingContractCoreService } from '../../../Core/leasing-contract/leasing-contract.service';
import { LeasingContract } from '../../../Core/leasing-contract/interfaces/leasing-contract.interface';

@Injectable()
export class LeasingOptionUtilityService {
  constructor(
    private readonly aclCoreService: AclCoreService,
    private readonly leasingFormCoreService: LeasingFormCoreService,
    private readonly leasingContractCoreService: LeasingContractCoreService
  ) {}

  async checkAcl(userId: string): Promise<void> {
    const acl = await this.aclCoreService.getAclUSer(userId);
    if (!acl || !acl.leasing) throw new ForbiddenException('شما به این قسمت دسترسی ندارید');
  }

  async validateCreateLeasingOptionDto(dto: CreateLeasingOptionDto, contract: LeasingContract): Promise<void> {
    if (isNil(dto)) throw new BadRequestException('تمامی فیلدها را پر کنید');
    if (isNil(dto.amount)) throw new BadRequestException('مبلغ اجباریست');
    if (dto.amount > contract.investmentAmount)
      throw new BadRequestException('مبلغ نباید بیشتر از مبلغ سرمایه‌گذاری تعیین شده در قرارداد باشد');
    if (dto.amount > 500000000) throw new BadRequestException('مبلغ نباید بیشتر از 50 میلیون تومان باشد');

    if (isNil(dto.months)) throw new BadRequestException('تعداد ماه اجباریست');
    if (isNil(dto.interest)) throw new BadRequestException('درصد سود احباریست');
    if (isNil(dto.title) || dto.title === '') throw new BadRequestException('عنوان اجباریست');
    if (dto.title.length < 8) throw new BadRequestException('عنوان باید حداقل ۸ حرفی باشد');
    if (dto.title.length > 128) throw new BadRequestException('عنوان باید حداکثر 128 حرفی باشد');
    if (dto.description && dto.description.length > 1000)
      throw new BadRequestException('توضیحات باید حداکثر ۱۰۰۰ حرفی باشد.');

    if (isNil(dto.tenDayPenalty) || isNil(dto.twentyDayPenalty)) throw new BadRequestException('درصد جریمه اجباریست');
    if (dto.tenDayPenalty < 0 || dto.tenDayPenalty > 100)
      throw new BadRequestException('درصد جریمه باید بین 0 تا 100 باشد');
    if (dto.twentyDayPenalty < 0 || dto.twentyDayPenalty > 100)
      throw new BadRequestException('درصد جریمه باید بین 0 تا 100 باشد');

    if (dto.isCustomizable) {
      throw new BadRequestException('در حال حاضر امکان تعریف اعتبار با قابلیت شخصی سازی وجود ندارد.');
      // if (isNil(dto.minCustomAmount)) throw new BadRequestException('حداقل مبلغ قابل شخصی سازی اجباریست');
      // if (isNil(dto.maxCustomAmount)) throw new BadRequestException('حداکثر مبلغ قابل شخصی سازی اجباریست');
    }
  }

  async normalizeUpdateLeasingOptionDto(body: UpdateLeasingOptionDto): Promise<UpdateLeasingOptionDto> {
    const clone: UpdateLeasingOptionDto = {};

    for (const key in body) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        const element = body[key];
        if (!isNil(element)) clone[key] = element;
      }
    }

    return clone;
  }

  async validateTerminalsObjectIds(body: LeasingOptionPatchAllowedTerminalsDto): Promise<void> {
    if (!body) throw new FillFieldsException('تمامی فیلد‌ها را پر کنید');
    if (!body.terminals || typeof body.terminals !== 'object')
      throw new BadRequestException('فیلد terminals باید آرایه باشد');
    return;
  }

  async checkIfLeasingHasDefinedAnyForm(userId: string): Promise<any> {
    const leasingFormFields = await this.leasingFormCoreService.getByLeasingUser(userId);
    if (leasingFormFields.length < 1) throw new UserCustomException('شما هنوز فرم درخواست اعتبار را تعریف نکرده‌اید.');
    return;
  }

  async checkIfLeasingHasActiveContract(userId: string): Promise<LeasingContract> {
    const data = await this.leasingContractCoreService.findCurrentlyActiveContractByLeasingUser(userId);
    if (!data) throw new UserCustomException('قرارداد شما هنوز تأیید نشده و یا قراردادی تعریف نشده است.');
    return data;
  }
}
