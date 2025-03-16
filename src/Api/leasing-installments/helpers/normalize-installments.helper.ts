import { LeasingInstallments } from '../../../Core/leasing-installments/interfaces/leasing-installments.interface';
import { LeasingOption } from '../../../Core/leasing-option/interfaces/leasing-option.interface';
import * as JalaliMoment from 'jalali-moment';

export const normalizeInstallments = async (data: LeasingInstallments[], option: LeasingOption): Promise<any[]> => {
  if (data.length < 1) return [];
  const installmentsLength = data.length;
  const tenDayPenalty = option.tenDayPenalty;
  const twentyDayPenalty = option.twentyDayPenalty;

  const temp = [];
  for (let i = 0; i < installmentsLength; i++) {
    const installment = data[i];
    const normalizedData = {};
    const today = JalaliMoment();
    const dueDate = installment.dueDate;

    if (!installment.paid) {
      if (today.isAfter(dueDate)) {
        const diff = today.diff(dueDate, 'days');
        console.log({ diff });
        if (diff >= 10 && diff < 20) {
          normalizedData['penalty'] = Math.floor(installment.amount * (tenDayPenalty / 100));
        } else if (diff >= 20) {
          normalizedData['penalty'] = Math.floor(installment.amount * (twentyDayPenalty / 100));
        } else {
          normalizedData['penalty'] = 0;
        }
      } else {
        normalizedData['penalty'] = 0;
      }
    } else {
      normalizedData['penalty'] = installment.paidAmount - installment.amount;
    }

    normalizedData['toBePaid'] = installment.amount + normalizedData['penalty'];
    temp.push({ ...installment, ...normalizedData });
  }

  return temp;
};
