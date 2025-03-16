import { Injectable, InternalServerErrorException } from '@vision/common';
import { LeasingInstallmentsCoreService } from '../../../Core/leasing-installments/leasing-installments.service';
import { LeasingInstallmentToPay, PayInstallmentsDto } from '../dto/pay-installments.dto';
import {
  LeasingInstallments,
  LeasingInstallmentsDocument,
} from '../../../Core/leasing-installments/interfaces/leasing-installments.interface';
import { isNil } from '@vision/common/utils/shared.utils';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class LeasingInstallmentsUtilityService {
  constructor(private readonly leasingInstallmentsCoreService: LeasingInstallmentsCoreService) {}

  async validatePayInstallmentsDto(dto: PayInstallmentsDto): Promise<LeasingInstallmentsDocument[]> {
    if (isNil(dto)) throw new UserCustomException('ارسال اطلاعات اقساط جهت پرداخت الزامیست');
    if (isNil(dto.amount)) throw new UserCustomException('ارسال مجموع مبالغ اقساط جهت پرداخت الزامیست');
    if (isNil(dto.devicetype)) throw new UserCustomException('ارسال نوع دستگاه جهت پرداخت الزامیست');
    if (typeof dto.amount !== 'number') throw new UserCustomException('مجموع مبالغ اقساط باید عدد باشد');
    if (typeof dto.devicetype !== 'string') throw new UserCustomException('نوع دستگاه باید استرینگ باشد');
    if (!Array.isArray(dto.installments)) throw new UserCustomException('فیلد اقساط باید آرایه باشد');
    if (dto.installments.length === 0) throw new UserCustomException('فیلد اقساط باید شامل آیتم باشد');
    switch (dto.devicetype) {
      case 'mobile':
      case 'mobile_google':
      case 'pwa':
      case 'web':
        break;
      default:
        throw new UserCustomException('نوع دستگاه شناسایی نشد');
    }
    const sumOfInstallments = dto.installments.reduce((acc, curr) => acc + curr.amount, 0);
    if (sumOfInstallments !== dto.amount) throw new UserCustomException('مبالغ ارسالی مطابقت ندارند');
    if (dto.amount > 500000000) throw new UserCustomException('سقف پرداخت اقساط به صورت یکجا ۵۰ میلیون تومان است.');
    const ids = dto.installments.map((i) => i.id);
    const installmentsFromDb = await this.leasingInstallmentsCoreService.findManyByIds(ids);
    if (installmentsFromDb.length !== dto.installments.length)
      throw new UserCustomException('اقساط ارسالی موجود نیستند');
    if (installmentsFromDb.some((i) => i.paid)) throw new UserCustomException('اقساط ارسالی قبلا پرداخت شده اند');

    return installmentsFromDb;
  }

  async setBulkInvoiceId(dto: PayInstallmentsDto, invoiceId: string): Promise<void> {
    try {
      const ids = dto.installments.map((installment) => installment.id);
      await this.leasingInstallmentsCoreService.setBulkInvoiceId(ids, invoiceId);
      return;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async getManyByIds(installmentToPays: LeasingInstallmentToPay[]): Promise<LeasingInstallmentsDocument[]> {
    const ids = installmentToPays.map((i) => i.id);
    return this.leasingInstallmentsCoreService.findManyByIds(ids);
  }
}
