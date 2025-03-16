import { Injectable } from '@vision/common';
import { LeasingInstallmentsCoreService } from '../../../Core/leasing-installments/leasing-installments.service';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { LeasingInstallmentsPayIpgPayloadDto } from '../dto/leasing-installments-pay-ipg-payload.dto';
import { LeasingInstallmentToPay } from '../dto/pay-installments.dto';

@Injectable()
export class LeasingInstallmentsSettlementService {
  constructor(
    private readonly installmentsCoreService: LeasingInstallmentsCoreService,
    private readonly accountsCoreService: AccountService
  ) {}

  async actionIpg(
    installments: LeasingInstallmentToPay[],
    payloadDto: LeasingInstallmentsPayIpgPayloadDto,
    user: any,
    invoiceId: string
  ): Promise<void> {
    for (const installment of installments) {
      await this.installmentsCoreService.setPaid(installment, invoiceId);
    }

    const installmentsLength = installments.length;
    // charge leasing user's wallet;
    await this.accountsCoreService.chargeAccount(payloadDto.leasingUserId, 'wallet', payloadDto.amount);

    // inform the leasing of installment payments
    const title = `پرداخت ${installmentsLength} قسط توسط ${user.fullname}`;
    await this.accountsCoreService.accountSetLogg(
      title,
      'LeCreditInstallmentsPay',
      payloadDto.amount,
      true,
      payloadDto.userId,
      payloadDto.leasingUserId
    );
    return;
  }
}
