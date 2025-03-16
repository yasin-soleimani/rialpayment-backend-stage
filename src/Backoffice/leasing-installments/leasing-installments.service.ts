import { Injectable, successOptWithDataNoValidation, successOptWithPagination, successOpt } from '@vision/common';
import { LeasingUserCreditCoreService } from '../../Core/leasing-user-credit/leasing-user-credit.service';
import { LeasingInstallmentsCoreService } from '../../Core/leasing-installments/leasing-installments.service';
import { normalizeInstallments } from '../../Api/leasing-installments/helpers/normalize-installments.helper';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { LeasingOption } from '../../Core/leasing-option/interfaces/leasing-option.interface';
import { ChangeLeasingUserCreditStatusDto } from './dto/change-leasing-user-credit-status.dto';
import { BadRequestException } from '@vision/common/exceptions/bad-request.exception';
import { isNil } from '../../../@vision/common/utils/shared.utils';
@Injectable()
export class BackofficeLeasingInstallmentsService {
  constructor(
    private readonly leasingUserCreditsService: LeasingUserCreditCoreService,
    private readonly leasingInstallmentsCoreService: LeasingInstallmentsCoreService
  ) {}

  async getCredits(page: any): Promise<any> {
    const data = await this.leasingUserCreditsService.getAll(page);
    return successOptWithPagination(data);
  }

  async getCreditInstallments(creditId: string): Promise<any> {
    const leasingUserCredit = await this.leasingUserCreditsService.getById(creditId);
    if (!leasingUserCredit) throw new UserCustomException('اعتبار یافت نشد');
    const option = leasingUserCredit.leasingOption as LeasingOption;
    const data = await this.leasingInstallmentsCoreService.getByLeasingUserCreditId(creditId);
    const normalizedData = await normalizeInstallments(data, option);
    return successOptWithDataNoValidation(normalizedData);
  }

  async changeUserCreditStatus(creditId: string, dto: ChangeLeasingUserCreditStatusDto): Promise<any> {
    if (Object.keys(dto).length < 1) throw new BadRequestException('تمامی فیلد ها باید پر شوند');
    if (isNil(dto.block)) throw new BadRequestException('فیلد block باید پر شود');
    if (typeof dto.block !== 'boolean') throw new BadRequestException('فیلد block باید boolean باشد');
    if (dto.block) {
      await this.leasingUserCreditsService.blockUserCredit(creditId);
    } else {
      await this.leasingUserCreditsService.unblockUserCredit(creditId);
    }

    return successOpt();
  }
}
