import { LeasingInstallmentsCoreService } from '../../Core/leasing-installments/leasing-installments.service';
import { Injectable, successOpt, successOptWithDataNoValidation } from '@vision/common';
import { LeasingUserCreditCoreService } from '../../Core/leasing-user-credit/leasing-user-credit.service';
import { PayInstallmentsDto } from './dto/pay-installments.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { LeasingOption } from '../../Core/leasing-option/interfaces/leasing-option.interface';
import { normalizeInstallments } from './helpers/normalize-installments.helper';
import { LeasingInstallmentsIpgService } from './services/leasing-installments-ipg.service';
import { LeasingInstallmentsUtilityService } from './services/leasing-installments-utility.service';
import { LeasingInstallmentsPayIpgPayloadDto } from './dto/leasing-installments-pay-ipg-payload.dto';
import { LeasingUserCredit } from '../../Core/leasing-user-credit/interfaces/leasing-user-credit.interface';

@Injectable()
export class LeasingInstallmentsService {
  constructor(
    private readonly leasingInstallmentsCoreService: LeasingInstallmentsCoreService,
    private readonly leasingInstallmentsIpgService: LeasingInstallmentsIpgService,
    private readonly leasingInstallmentsUtilityService: LeasingInstallmentsUtilityService,
    private readonly leasingUserCreditCoreService: LeasingUserCreditCoreService
  ) {}

  async getUserCredits(userId: any): Promise<any> {
    const data = await this.leasingUserCreditCoreService.getAllUserCredits(userId);
    return successOptWithDataNoValidation(data);
  }

  async getLeasingInstallments(leasingUserCreditId: string): Promise<any> {
    const leasingUserCredit = await this.leasingUserCreditCoreService.getById(leasingUserCreditId);
    if (!leasingUserCredit) throw new UserCustomException('اعتبار یافت نشد');
    const option = leasingUserCredit.leasingOption as LeasingOption;
    const data = await this.leasingInstallmentsCoreService.getByLeasingUserCreditId(leasingUserCreditId);

    const result = await normalizeInstallments(data, option);

    return successOptWithDataNoValidation(result);
  }

  async payInstallments(userId: any, dto: PayInstallmentsDto, referer: string): Promise<any> {
    console.log({ userid: userId, dto: dto });
    const installmentsFromDB = await this.leasingInstallmentsUtilityService.validatePayInstallmentsDto(dto);

    const payload: LeasingInstallmentsPayIpgPayloadDto = {
      installments: dto.installments,
      userId,
      amount: dto.amount,
      devicetype: dto.devicetype,
      referer,
      leasingUserId: (installmentsFromDB[0].leasingUserCredit as LeasingUserCredit).leasingUser,
    };
    const data = await this.leasingInstallmentsIpgService.makePay(
      process.env.LECREDIT_INSTALLMENTS_PAY,
      dto.amount,
      process.env.LECREDIT_INSTALLMENTS_PAY_IPG_CALLBACK_SERVER,
      payload
    );
    if (!data.invoiceid) throw new UserCustomException('پرداخت با خطا مواجه شده است');
    await this.leasingInstallmentsUtilityService.setBulkInvoiceId(dto, data.invoiceid);
    console.log('leaisngApply Ipg:::', data.invoiceid);

    return successOptWithDataNoValidation(data.invoiceid);
  }
}
